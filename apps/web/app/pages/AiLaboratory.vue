<script setup lang="ts">
interface SpiralSquare {
  x: number
  y: number
  size: number
  arc: string
  color: string
}

interface CameraFrame {
  x: number
  y: number
  size: number
}

useSeoMeta({
  title: '黄金螺旋实验室',
  description: '观察斐波那契方块与四分之一圆弧如何逐步拼成螺旋。'
})

const colors = ['#fbbf24', '#fb923c', '#facc15', '#a3e635', '#4ade80', '#38bdf8', '#a78bfa']
const sizes = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
const squares: SpiralSquare[] = []
const cameraFrames: CameraFrame[] = []
const bounds = { left: 0, top: 0, right: 0, bottom: 0 }

// 从相邻的两个 1×1 方块开始，依次向下、左、上、右添加新方块。
for (const [index, size] of sizes.entries()) {
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

  bounds.left = Math.min(bounds.left, x)
  bounds.top = Math.min(bounds.top, y)
  bounds.right = Math.max(bounds.right, x + size)
  bounds.bottom = Math.max(bounds.bottom, y + size)

  // 正方形视窗始终容纳已经绘制的所有方块；边长随斐波那契外框增长。
  const width = bounds.right - bounds.left
  const height = bounds.bottom - bounds.top
  const cameraSize = Math.max(width, height) * 1.12
  cameraFrames.push({
    x: (bounds.left + bounds.right - cameraSize) / 2,
    y: (bounds.top + bounds.bottom - cameraSize) / 2,
    size: cameraSize
  })

  // 四种圆心位置轮换，邻接圆弧共用端点，形成一条连续的近似螺旋。
  const arc = index % 4 === 0
    ? `M ${x} ${y + size} A ${size} ${size} 0 0 1 ${x + size} ${y}`
    : index % 4 === 1
      ? `M ${x} ${y} A ${size} ${size} 0 0 1 ${x + size} ${y + size}`
      : index % 4 === 2
        ? `M ${x + size} ${y} A ${size} ${size} 0 0 1 ${x} ${y + size}`
        : `M ${x + size} ${y + size} A ${size} ${size} 0 0 1 ${x} ${y}`

  squares.push({ x, y, size, arc, color: colors[index]! })
}

const stepDuration = 1100
const zoomDuration = 850
const drawDuration = 850
const arcDelay = 250
const camera = ref<CameraFrame>({ ...cameraFrames[0]! })
const viewBox = computed(() => `${camera.value.x} ${camera.value.y} ${camera.value.size} ${camera.value.size}`)
const replayKey = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []
let animationFrame = 0

function stopCamera() {
  timers.forEach(clearTimeout)
  timers.length = 0
  cancelAnimationFrame(animationFrame)
}

function moveCamera(target: CameraFrame) {
  const from = { ...camera.value }
  const startedAt = performance.now()

  function tick(now: number) {
    const progress = Math.min((now - startedAt) / zoomDuration, 1)
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
  if (restart) replayKey.value++
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    camera.value = { ...cameraFrames.at(-1)! }
    return
  }

  camera.value = { ...cameraFrames[0]! }
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
        黄金螺旋
      </h1>
      <p class="font-serif text-lg text-amber-100/80 sm:text-xl">
        r(θ) = aφ<sup>2θ/π</sup><span class="mx-3 text-amber-500/60">·</span>φ = (1 + √5) / 2
      </p>
    </div>

    <div class="flex w-full flex-col items-center rounded-3xl border border-amber-200/10 bg-[#08090d] px-4 py-6 shadow-2xl">
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
  to { stroke-dashoffset: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .spiral-square,
  .spiral-arc {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
