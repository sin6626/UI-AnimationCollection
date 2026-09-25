<script setup lang="ts">
interface SpiralSquare {
  x: number
  y: number
  size: number
  arc: string
  color: string
}

useSeoMeta({
  title: '黄金螺旋实验室',
  description: '观察斐波那契方块与四分之一圆弧如何逐步拼成螺旋。'
})

const colors = ['#fbbf24', '#fb923c', '#facc15', '#a3e635', '#4ade80', '#38bdf8', '#a78bfa']
const sizes = [1, 1, 2, 3, 5, 8, 13]
const squares: SpiralSquare[] = []
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

const padding = 1.5
const viewBox = `${bounds.left - padding} ${bounds.top - padding} ${bounds.right - bounds.left + padding * 2} ${bounds.bottom - bounds.top + padding * 2}`
const replayKey = ref(0)
</script>

<template>
  <section class="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-4 py-10 text-center sm:py-14">
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

    <div class="flex w-full flex-col items-center rounded-3xl border border-amber-200/10 bg-[#08090d] px-5 py-10 shadow-2xl sm:py-14">
      <svg
        :key="replayKey"
        :viewBox="viewBox"
        class="spiral-canvas h-[min(64vh,580px)] w-full max-w-[500px] overflow-visible"
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
            :style="{ '--dash-length': String(4 * square.size), 'animation-delay': `${index * 0.9}s` }"
            class="spiral-square"
            fill="none"
          />
          <path
            :d="square.arc"
            :style="{ '--dash-length': String(Math.PI * square.size / 2), 'animation-delay': `${index * 0.9 + 0.25}s` }"
            class="spiral-arc"
            fill="none"
          />
        </g>
      </svg>

      <p class="mt-5 max-w-lg text-sm leading-7 text-neutral-400">
        按 1、1、2、3、5、8、13 的边长排列方块，再在每个方块内画一段四分之一圆弧。
        这是黄金螺旋的常见近似画法，并非公式对应的精确曲线。
      </p>
      <UButton
        class="mt-6"
        color="neutral"
        variant="outline"
        icon="i-lucide-rotate-ccw"
        @click="replayKey++"
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
  animation: spiral-draw 0.8s ease-in-out forwards;
}

.spiral-square {
  stroke-width: 0.075;
}

.spiral-arc {
  stroke: #f8fafc;
  stroke-width: 0.1;
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
