/**
 * 全屏梅花生长背景的核心算法。
 *
 * 使用递归分形与任务队列模拟枝条逐层生长，三个生长源从视口边缘
 * 向页面内部延伸，并在枝条末端随机散落少量花瓣状粒子。
 */

/** 平面坐标系中的一个点。 */
interface Point {
  x: number
  y: number
}

/** 一根由起点、长度和方向角确定的枝条。 */
interface Branch {
  start: Point
  length: number
  theta: number
}

/** 背景组件持有的生命周期控制器。 */
export interface PlumGrowthController {
  resize: () => void
  dispose: () => void
}

/** 前三层必然生长，保证主干成型。 */
const INIT_ITERATIONS = 3
/** 枝条长度上下限，避免随机长度失控。 */
const MAX_BRANCH_LENGTH = 12
const MIN_BRANCH_LENGTH = 3
/** 每隔 14 帧执行一批生长任务。 */
const FRAME_FLUSH_INTERVAL = 14

/** 源项目当前实际使用的银灰枝条与光晕参数。 */
function getRenderStyle() {
  return {
    strokeStyle: 'rgba(180, 184, 192, 0.35)',
    lineWidth: 1,
    shadowBlur: 12,
    shadowColor: 'rgba(204, 210, 223, 1)',
    lineCap: 'round' as const,
    lineJoin: 'round' as const
  }
}

/** 花瓣状粒子的绘制参数。 */
function getParticleStyle() {
  return {
    fillBase: '220, 223, 230',
    alpha: 0.22,
    shadowBlur: 12,
    shadowColor: 'rgba(214, 219, 230, 0.16)'
  }
}

/** 左侧中部、右侧上部和右侧下部三个生长源。 */
function getSeedAnchors(width: number, height: number): Point[] {
  const point = (x: number, y: number): Point => ({
    x: Math.round(x),
    y: Math.round(y)
  })

  return [
    point(0, height * 0.44),
    point(width, height * 0.16),
    point(width, height * 0.76)
  ]
}

/** 前三层强制生长，之后每一侧独立保留 50% 生长概率。 */
function shouldGrowBranch(depth: number, randomValue: number): boolean {
  return depth < INIT_ITERATIONS || randomValue < 0.5
}

/** 子枝长度相对父枝随机浮动 ±2，并限制在安全范围内。 */
function getNextBranchLength(currentLength: number): number {
  return Math.max(
    MIN_BRANCH_LENGTH,
    Math.min(MAX_BRANCH_LENGTH, currentLength + Math.random() * 4 - 2)
  )
}

/** 为每个锚点建立一条初始根枝。 */
function getInitialRootBranches(anchors: Point[]): Branch[] {
  return anchors.map(anchor => ({
    start: anchor,
    length: MIN_BRANCH_LENGTH,
    theta: 0
  }))
}

/**
 * 在目标 Canvas 上创建梅花生长背景。
 * 仅由客户端组件的 onMounted 调用，不会在 SSR 阶段访问浏览器 API。
 */
export function createPlumGrowth(canvas: HTMLCanvasElement): PlumGrowthController {
  const context = canvas.getContext('2d')

  if (!context) {
    return {
      resize: () => {},
      dispose: () => {}
    }
  }

  const pendingTasks: Array<() => void> = []
  let animationFrameId = 0
  let frameCount = 0
  let disposed = false
  let anchors = getSeedAnchors(window.innerWidth, window.innerHeight)

  /** 应用固定中性色；主题适配由 Canvas 的 difference 混合模式负责。 */
  const applyRenderStyle = () => {
    const renderStyle = getRenderStyle()
    context.strokeStyle = renderStyle.strokeStyle
    context.lineWidth = renderStyle.lineWidth
    context.shadowBlur = renderStyle.shadowBlur
    context.shadowColor = renderStyle.shadowColor
    context.lineCap = renderStyle.lineCap
    context.lineJoin = renderStyle.lineJoin
  }

  const lineTo = (start: Point, end: Point) => {
    context.beginPath()
    context.moveTo(start.x, start.y)
    context.lineTo(end.x, end.y)
    context.stroke()
  }

  const getEndPoint = (branch: Branch): Point => ({
    x: branch.start.x + branch.length * Math.cos(branch.theta),
    y: branch.start.y + branch.length * Math.sin(branch.theta)
  })

  const drawBranch = (branch: Branch) => {
    lineTo(branch.start, getEndPoint(branch))
  }

  /** 在枝条末端绘制一颗带微弱光晕的花瓣粒子。 */
  const drawParticle = (point: Point, radius: number, alpha: number) => {
    const particleStyle = getParticleStyle()

    context.save()
    context.beginPath()
    context.fillStyle = `rgba(${particleStyle.fillBase}, ${alpha})`
    context.shadowBlur = particleStyle.shadowBlur
    context.shadowColor = particleStyle.shadowColor
    context.arc(point.x, point.y, radius, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }

  /** 长度足够的枝条以受控概率在末端散落一至两颗粒子。 */
  const scatterParticles = (point: Point, branchLength: number) => {
    if (branchLength < 5 || Math.random() > 0.42) return

    const particleStyle = getParticleStyle()
    const count = branchLength > 8 ? 2 : 1

    for (let index = 0; index < count; index += 1) {
      const drift = Math.random() * 10 - 5
      drawParticle(
        {
          x: point.x + drift,
          y: point.y + Math.random() * 10 - 5
        },
        0.45 + Math.random() * 0.95,
        particleStyle.alpha * (0.7 + Math.random() * 0.8)
      )
    }
  }

  const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

  /**
   * 绘制当前枝条，再将可能生长的左右子枝加入下一轮任务队列。
   * 任务按层批量执行，因此整体呈现广度优先的生长过程。
   */
  const step = (branch: Branch, depth = 0) => {
    const end = getEndPoint(branch)
    drawBranch(branch)
    scatterParticles(end, branch.length)

    if (shouldGrowBranch(depth, Math.random())) {
      pendingTasks.push(() => {
        step({
          start: end,
          length: getNextBranchLength(branch.length),
          theta: branch.theta - 0.28 * Math.random()
        }, depth + 1)
      })
    }

    if (shouldGrowBranch(depth, Math.random())) {
      pendingTasks.push(() => {
        step({
          start: end,
          length: getNextBranchLength(branch.length),
          theta: branch.theta + 0.28 * Math.random()
        }, depth + 1)
      })
    }
  }

  /** 根据生长源所在位置，让枝条朝向视口内部。 */
  const getInitialTheta = (index: number) => {
    if (index === 0) return randomBetween(-0.85, 0.85)
    if (index === 1) return randomBetween(1.95, 3.15)
    return randomBetween(2.95, 4.25)
  }

  const spawnRoot = (anchor: Point, index: number) => {
    const jitter = Math.min(window.innerWidth, window.innerHeight) * 0.03

    step({
      start: {
        x: anchor.x,
        y: anchor.y + randomBetween(-jitter, jitter)
      },
      length: randomBetween(MIN_BRANCH_LENGTH, MAX_BRANCH_LENGTH),
      theta: getInitialTheta(index)
    })
  }

  /** 清空旧队列并播下三个新的生长任务。 */
  const seedInitialRoots = () => {
    pendingTasks.length = 0
    getInitialRootBranches(anchors).forEach((branch, index) => {
      pendingTasks.push(() => spawnRoot(branch.start, index))
    })
  }

  /** 当前层执行时新增的任务会保留到下一轮。 */
  const flushFrame = () => {
    const tasks = pendingTasks.splice(0)
    tasks.forEach(task => task())
  }

  const loop = () => {
    if (disposed) return

    animationFrameId = window.requestAnimationFrame(() => {
      frameCount += 1

      if (pendingTasks.length === 0) {
        animationFrameId = 0
        return
      }

      if (frameCount % FRAME_FLUSH_INTERVAL === 0) flushFrame()
      loop()
    })
  }

  /** 清空画布、恢复高分屏变换并重新播种。 */
  const paint = (width: number, height: number, scale: number) => {
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.setTransform(scale, 0, 0, scale, 0, 0)
    applyRenderStyle()
    anchors = getSeedAnchors(width, height)
    seedInitialRoots()
  }

  const resize = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    const scale = window.devicePixelRatio || 1

    canvas.width = Math.max(1, Math.floor(width * scale))
    canvas.height = Math.max(1, Math.floor(height * scale))
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    paint(width, height, scale)
  }

  const handleResize = () => {
    resize()

    // 生长已结束后发生 resize 时，重新启动刚刚播下的任务。
    if (animationFrameId === 0) loop()
  }

  window.addEventListener('resize', handleResize)
  resize()
  loop()

  return {
    resize,
    dispose: () => {
      disposed = true
      pendingTasks.length = 0
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }
}
