<script setup lang="ts">
/**
 * 梅花生长算法的原始手写版本（最早的核心算法原稿）。
 *
 * 用途：作为算法演进的历史归档，保留最初的实现思路。
 * 它与当前生产版（src/generative/plum-growth/plumGrowth.ts）的区别：
 * - 这里是单株、固定 600x600 画布、从画布底部中央向上生长；
 * - 当前生产版改为三个生长源、全屏自适应、加入粒子与银灰线条样式。
 */
const el = ref < HTMLCanvasElement > ()
/** 2d 上下文，使用 computed 惰性获取 */
const ctx = computed(() => {
  return el.value?.getContext('2d') ?? null
})

/** 画布宽高（像素），原始版固定尺寸 */
const WIDTH = 600
const HEIGHT = 600

/** 平面坐标点 */
interface Ponint {
  x: number,
  y: number
}

/** 一根枝条：起点 + 长度 + 方向角 */
interface Branch {
  start: Ponint
  length: number
  theta: number
}

/** 在两点间画一条线段 */
const lineTo = (p1: Ponint, p2: Ponint) => {
  if ( !ctx.value ) {
    return
  }

  ctx.value.beginPath()
  ctx.value.moveTo(p1.x, p1.y)
  ctx.value.lineTo(p2.x, p2.y)
  ctx.value.stroke()
}

/** 由枝条起点 + 长度 + 角度计算末端点坐标 */
const getEndPoint = (b: Branch) => {
  return {
    x: b.start.x + b.length * Math.cos(b.theta),
    y: b.start.y + b.length * Math.sin(b.theta)
  }
}

/** 绘制一根枝条 */
const drawBranch = (b: Branch) => {
  lineTo(b.start, getEndPoint(b))
}


/**
 * 初始化：设置白色线条，并从画布底部中央向上播下第一根主枝。
 */
const init = () => {
  if ( !ctx.value ) {
    return
  }

  // 使用NuxtUI的变量, 让颜色能随着主题变化 ❌️, 打脸了这一点使用css变量做不到, 因为canvas已经把枝条画上去了, 不受变量的影响
  // 可以把之前的branch的状态给记录下来, 然后去展示, 但是感觉那样太麻烦了, 可以使用一定的透明度, 让颜色在黑暗/光明下都能很好展示
  // const color = getComputedStyle(document.documentElement)
  // .getPropertyValue('--ui-text-highlighted')
  // .trim()
  // console.log(color);
  
  const color = 'rgba(182, 182, 182, 0.752)'

  ctx.value.strokeStyle = color
  step(
    {
      start: { x: WIDTH / 2, y: HEIGHT },
      length: 40,
      theta: -Math.PI / 2
    })
}

/** 待执行的生长任务队列（延迟绘制实现逐帧生长） */
const pendingTasks: Function[] = []

/**
 * 递归生长一步：
 * 绘制当前枝条后，向左/向右分别生成一条子枝任务，
 * 子枝长度在父枝基础上 ±5 随机浮动，角度 ±0.4 随机偏转。
 */
const step = (b: Branch, depth = 0) => {
  const end = getEndPoint(b)
  drawBranch(b)

  // 左子枝：深度 < 3 必然生长，之后 50% 概率
  if (depth < 3 || Math.random() < 0.5) {
    pendingTasks.push(() =>
      step({
        start: end,
        length: b.length + (Math.random() * 10 - 5),
        theta: b.theta - 0.4 * Math.random()
      }, depth + 1))
  }

  // 右子枝：同上
  if (depth < 3 || Math.random() < 0.5) {
    pendingTasks.push(() =>
      step({
        start: end,
        length: b.length + (Math.random() * 10 - 5),
        theta: b.theta + 0.4 * Math.random()
      }, depth + 1))
  }

}

/** 执行本帧所有待处理任务（先取出再清空队列） */
const frame = () => {
  const tasks = [...pendingTasks]
  pendingTasks.length = 0
  tasks.forEach(fn => fn())
}

/** 帧计数器 */
let frameCount = 0
/**
 * 动画循环：每帧计数，每隔 30 帧执行一批生长任务，
 * 把整株梅花的生长拉长到多帧完成。
 */
const startFrame = () => {
  requestAnimationFrame(() => {
    frameCount++
    if (frameCount % 30 == 0 ) {
      frame()
    }
    startFrame()
  })
}


// 组件挂载后开始生长
onMounted(() => {
  init()
  startFrame()
})

</script>

<template>
  <div class="flex min-h-[62vh] items-center justify-center py-16">
    <canvas ref="el" width="600" height="600" class="border border-inverted text-default"></canvas>
  </div>
</template>
