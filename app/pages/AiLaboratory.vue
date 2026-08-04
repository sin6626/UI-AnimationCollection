<script setup lang='ts'>
import { Motion } from 'motion-v'

const isHovered = ref(false)
const cursor = reactive({ x: 0, y: 0 })

function updateCursor(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect() // 获取目标元素在视口中的坐标
  cursor.x = event.clientX - rect.left
  cursor.y = event.clientY - rect.top
}

function handleMouseEnter(event: MouseEvent) {
  updateCursor(event)
  isHovered.value = true
}

function handleMouseLeave(event: MouseEvent) {
  updateCursor(event)
  isHovered.value = false
}
</script>

<template>
  <div class="mx-auto mt-50 flex justify-center items-center">
    <UButton
      size="xl"
      color="neutral"
      class="relative overflow-hidden cursor-pointer bg-inverted"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
    <!-- spring弹簧动画, stiffness弹簧的刚度, 越小越柔软, 回弹更明显, damping: 阻尼, 越小摆动越久, 用来做轻微的摆动, resetDelta:当速度/位置误差小于该值时视为动画结束,值越小越精确、动画越久(其实不是很懂, 但是随便加点值显示吧) -->
      <Motion
        tag="span"
        :initial="{ scale: 0 }"
        :animate="{ scale: isHovered ? 1 : 0 }"
        :transition="{ type: 'spring', stiffness: 85, damping: 18, restDelta: 0.001 }"
        class="pointer-events-none absolute size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-default/80"
        :style="{ left: `${cursor.x}px`, top: `${cursor.y}px` }"
      />
      <span :class="['relative z-10 flex items-center gap-2 transition-colors', isHovered ? 'text-default' : 'text-inverted']">
        <UIcon name="lucide-rocket" class="size-5" />
        Click There
      </span>
    </UButton>
  </div>
</template>
