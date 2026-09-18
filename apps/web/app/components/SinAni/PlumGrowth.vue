<script setup lang="ts">
/**
 * 梅花生长动画的收藏展示版。
 *
 * 算法思路：
 * - 从画布底部中央向上绘制第一根主枝；
 * - 每根枝条的末端都可能生成左、右两根子枝，形成一棵二叉树；
 * - 前三层必定生长，之后左右枝条各有 50% 的生长概率；
 * - 子枝先进入任务队列，再按固定帧间隔成批执行，形成广度优先的生长效果。
 */
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

/** Canvas 使用固定内部像素尺寸，展示宽度交给 CSS 自适应。 */
const WIDTH = 600
const HEIGHT = 600

/** 平面坐标点。 */
interface Point {
  x: number
  y: number
}

/** 一根枝条：起点、长度和方向角。 */
interface Branch {
  start: Point
  length: number
  theta: number
}

/** 下一轮需要生长的枝条任务，用队列实现逐层广度优先生长。 */
const pendingTasks: Array<() => void> = []
let frameCount = 0
let animationFrameId = 0

/** 根据枝条起点、长度和角度计算末端坐标。 */
function getEndPoint(branch: Branch): Point {
  return {
    x: branch.start.x + branch.length * Math.cos(branch.theta),
    y: branch.start.y + branch.length * Math.sin(branch.theta)
  }
}

/** 在 Canvas 上绘制一根枝条。 */
function drawBranch(branch: Branch) {
  const context = canvas.value?.getContext('2d')
  if (!context) return

  const end = getEndPoint(branch)
  context.beginPath()
  context.moveTo(branch.start.x, branch.start.y)
  context.lineTo(end.x, end.y)
  context.stroke()
}

/**
 * 绘制当前枝条，并把下一层左右子枝加入队列。
 * 子枝长度在父枝基础上随机浮动 ±5，方向分别向左右随机偏转。
 */
function grow(branch: Branch, depth = 0) {
  const end = getEndPoint(branch)
  drawBranch(branch)

  // 左子枝：前三层必定生长，之后每层有 50% 概率继续生长。
  if (depth < 3 || Math.random() < 0.5) {
    pendingTasks.push(() => grow({
      start: end,
      length: branch.length + Math.random() * 10 - 5,
      theta: branch.theta - 0.4 * Math.random()
    }, depth + 1))
  }

  // 右子枝：与左子枝独立判断，同样具有 50% 的生长概率。
  if (depth < 3 || Math.random() < 0.5) {
    pendingTasks.push(() => grow({
      start: end,
      length: branch.length + Math.random() * 10 - 5,
      theta: branch.theta + 0.4 * Math.random()
    }, depth + 1))
  }
}

/** 取出当前队列中的全部任务，作为同一层枝条一起绘制。 */
function frame() {
  const tasks = pendingTasks.splice(0)
  tasks.forEach(task => task())
}

/** 每 30 个渲染帧生长一层，使枝条生成过程清晰可见。 */
function animate() {
  frameCount++
  if (frameCount % 30 === 0) frame()
  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  const context = canvas.value?.getContext('2d')
  if (!context) return

  // Canvas 已绘制的像素不会随主题变量改变，使用明暗主题均可辨认的半透明灰色。
  context.strokeStyle = 'rgba(182, 182, 182, 0.752)'

  // 从画布底部中央播下第一根垂直向上的主枝。
  grow({
    start: { x: WIDTH / 2, y: HEIGHT },
    length: 40,
    theta: -Math.PI / 2
  })
  animate()
})

onUnmounted(() => {
  // 离开详情页后停止动画循环，并清空尚未执行的生长任务。
  cancelAnimationFrame(animationFrameId)
  pendingTasks.length = 0
})
</script>

<template>
  <section class="flex min-h-[62vh] items-center justify-center py-16">
    <canvas
      ref="canvas"
      :width="WIDTH"
      :height="HEIGHT"
      class="aspect-square h-auto w-full max-w-[600px] border border-inverted"
      role="img"
      aria-label="Plum blossom binary tree growth animation"
    />
  </section>
</template>
