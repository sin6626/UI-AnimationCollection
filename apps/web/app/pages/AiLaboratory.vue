<script setup lang="ts">
interface SpiralSquare {
  // SVG 使用同一套逻辑坐标：左上角 (x, y)、边长 size，以及该方块内的圆弧路径。
  x: number
  y: number
  size: number
  arc: string
  color: string
}

interface CameraFrame {
  // 一个正方形 viewBox 的左上角和边长；每新增一个方块就预先计算一帧。
  x: number
  y: number
  size: number
}

useSeoMeta({
  title: '黄金螺旋实验室',
  description: '观察斐波那契方块与四分之一圆弧如何逐步拼成螺旋。'
})

const colors = ['#fbbf24', '#fb923c', '#facc15', '#a3e635', '#4ade80', '#38bdf8', '#a78bfa']
// 相邻两项之和得到下一项；这些边长让方块拼成逐渐扩张的斐波那契矩形。
const sizes = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
const squares: SpiralSquare[] = []
const cameraFrames: CameraFrame[] = []
const bounds = { left: 0, top: 0, right: 0, bottom: 0 }

// 从相邻的两个 1×1 方块开始，依次向下、左、上、右添加新方块。
for (const [index, size] of sizes.entries()) {
  // 前两块单独定位；之后每四块重复一次方向，沿当前外框向外生长。
  const direction = (index - 2) % 4
  let x = bounds.left
  let y = bounds.top
  if (index === 1) x = 1
  else if (index > 1) {
    if (direction === 0) y = bounds.bottom
    if (direction === 1) x = bounds.left - size
    if (direction === 2) y = bounds.top - size
    if (direction === 3) x = bounds.right
  }

  // 外框记录迄今所有方块的并集，也是镜头需要覆盖的范围。
  bounds.left = Math.min(bounds.left, x)
  bounds.top = Math.min(bounds.top, y)
  bounds.right = Math.max(bounds.right, x + size)
  bounds.bottom = Math.max(bounds.bottom, y + size)

  // 正方形视窗始终容纳已经绘制的所有方块；1.12 留出约 12% 的画面余量。
  const width = bounds.right - bounds.left
  const height = bounds.bottom - bounds.top
  const cameraSize = Math.max(width, height) * 1.12
  cameraFrames.push({
    x: (bounds.left + bounds.right - cameraSize) / 2,
    y: (bounds.top + bounds.bottom - cameraSize) / 2,
    size: cameraSize
  })

  // SVG 的 A 命令以 size 为半径画四分之一圆；四种起终点依次旋转。
  // 相邻圆弧共用端点，视觉上连成螺旋，但不是标题公式所表示的精确曲线。
  const arc = index % 4 === 0
    ? `M ${x} ${y + size} A ${size} ${size} 0 0 1 ${x + size} ${y}`
    : index % 4 === 1
      ? `M ${x} ${y} A ${size} ${size} 0 0 1 ${x + size} ${y + size}`
      : index % 4 === 2
        ? `M ${x + size} ${y} A ${size} ${size} 0 0 1 ${x} ${y + size}`
        : `M ${x + size} ${y + size} A ${size} ${size} 0 0 1 ${x} ${y}`

  squares.push({ x, y, size, arc, color: colors[index % colors.length]! })
}

// 每 1100ms 开始一个新方块；镜头和描边各用 850ms，留出短暂停顿。
const stepDuration = 1100
const zoomDuration = 850
const drawDuration = 850
// 圆弧比所属方块晚 250ms 出现，让观众先看到方块的轮廓。
const arcDelay = 250
const camera = ref<CameraFrame>({ ...cameraFrames[0]! })
const viewBox = computed(() => `${camera.value.x} ${camera.value.y} ${camera.value.size} ${camera.value.size}`)
const replayKey = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []
let animationFrame = 0

function stopCamera() {
  // 重播或离开页面时清理上一轮调度，避免旧镜头继续改写 viewBox。
  timers.forEach(clearTimeout)
  timers.length = 0
  cancelAnimationFrame(animationFrame)
}

function moveCamera(target: CameraFrame) {
  // 以当前镜头为起点插值，便于镜头平滑移动到下一块方块的外框。
  const from = { ...camera.value }
  const startedAt = performance.now()

  function tick(now: number) {
    const progress = Math.min((now - startedAt) / zoomDuration, 1)
    // smoothstep：起步与结束时速度趋近于零，缩放不会突然跳变。
    const eased = progress * progress * (3 - 2 * progress)
    camera.value = {
      x: from.x + (target.x - from.x) * eased,
      y: from.y + (target.y - from.y) * eased,
      size: from.size + (target.size - from.size) * eased
    }
    if (progress < 1) animationFrame = requestAnimationFrame(tick)
  }

  animationFrame = requestAnimationFrame(tick)
}

function play(restart = true) {
  stopCamera()
  // 改变 SVG 的 key 会重新挂载描边元素，使 CSS 动画从第一帧重播。
  if (restart) replayKey.value++
  // 尊重系统的减少动态效果设置：直接显示完整图案与最终镜头。
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    camera.value = { ...cameraFrames.at(-1)! }
    return
  }

  camera.value = { ...cameraFrames[0]! }
  // 描边从 index * stepDuration 开始；镜头提前 zoomDuration 启动，
  // 恰好在对应方块开始描边时到达容纳它的视窗。
  for (let index = 1; index < cameraFrames.length; index++) {
    timers.push(setTimeout(() => moveCamera(cameraFrames[index]!), index * stepDuration - zoomDuration))
  }
}

onMounted(() => play(false))
onBeforeUnmount(stopCamera)
</script>

<template>
  <section class="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-4 py-6 text-center">
    <div class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400/75">
        Animation Laboratory
      </p>
      <h1 class="font-serif text-4xl font-bold tracking-[0.15em] text-amber-200 sm:text-5xl">
        黄金回旋
      </h1>
      <p class="font-serif text-lg text-amber-100/80 sm:text-xl">
        r(θ) = aφ<sup>2θ/π</sup><span class="mx-3 text-amber-500/60">·</span>φ = (1 + √5) / 2
      </p>
    </div>

    <div class="flex w-full flex-col items-center rounded-3xl border border-amber-200/10 bg-[#08090d] px-4 py-6 shadow-2xl">
      <!-- 描边宽度随 viewBox 放大而增加，保持屏幕上的视觉粗细基本稳定。 -->
      <svg
        :key="replayKey"
        :viewBox="viewBox"
        class="spiral-canvas aspect-square overflow-hidden"
        :style="{
          'width': 'min(100%, 56dvh, 520px)',
          '--square-stroke': String(camera.size / 350),
          '--arc-stroke': String(camera.size / 260),
          '--draw-duration': `${drawDuration}ms`
        }"
        role="img"
        aria-label="斐波那契方块与圆弧依次绘制成黄金螺旋近似图"
      >
        <g
          v-for="(square, index) in squares"
          :key="index"
        >
          <!-- 周长作为虚线长度：初始偏移时整条边不可见，偏移归零后完整显现。 -->
          <rect
            :x="square.x"
            :y="square.y"
            :width="square.size"
            :height="square.size"
            :stroke="square.color"
            :style="{ '--dash-length': String(4 * square.size), 'animation-delay': `${index * stepDuration}ms` }"
            class="spiral-square"
            fill="none"
          />
          <!-- 四分之一圆的弧长为 πr/2；它在方块开始后再延迟 arcDelay。 -->
          <path
            :d="square.arc"
            :style="{ '--dash-length': String(Math.PI * square.size / 2), 'animation-delay': `${index * stepDuration + arcDelay}ms` }"
            class="spiral-arc"
            fill="none"
          />
        </g>
      </svg>

      <p class="mt-4 max-w-lg text-sm leading-6 text-neutral-400">
        按斐波那契数列的边长排列方块，再在每个方块内画一段四分之一圆弧。
        这是黄金螺旋的常见近似画法，并非公式对应的精确曲线。
      </p>
      <UButton
        class="mt-4"
        color="neutral"
        variant="outline"
        icon="i-lucide-rotate-ccw"
        @click="play()"
      >
        重播动画
      </UButton>
    </div>
  </section>
</template>

<style scoped>
.spiral-square,
.spiral-arc {
  /* 用一段与路径等长的虚线和同长度偏移，将整条路径藏在起点之外。 */
  stroke-dasharray: var(--dash-length);
  stroke-dashoffset: var(--dash-length);
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: spiral-draw var(--draw-duration) ease-in-out forwards;
}

.spiral-square {
  stroke-width: var(--square-stroke);
}

.spiral-arc {
  stroke: #f8fafc;
  stroke-width: var(--arc-stroke);
}

@keyframes spiral-draw {
  /* 偏移归零时虚线沿路径逐渐进入视野，形成“画出来”的效果。 */
  to { stroke-dashoffset: 0; }
}

@media (prefers-reduced-motion: reduce) {
  /* 与脚本中的最终镜头配合，静态展示全部方块和圆弧。 */
  .spiral-square,
  .spiral-arc {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
