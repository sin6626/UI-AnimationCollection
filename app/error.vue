<script setup lang="ts">
import type { NuxtError } from '#app'
import { Motion } from 'motion-v'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

defineProps({
  error:{
    type: Object as PropType<NuxtError>,
    required: true  
  }
})

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
  <UMain class="relative bg-amber-50 flex flex-col gap-4 min-w-[100vh] min-h-screen">
    <DotLottieVue class="w-full h-full m-auto" autoplay loop src="/404-error.lottie" />
    <!-- <UButton to="/" class="absolute top-4/5 left-1/2 -translate-x-1/2 text-gray-600 hover:text-gray-700 hover:bg-amber-100/80" variant="outline" size="xl" icon="i-lucide-rocket" >Back to Home</UButton> -->
    <UButton
      to="/"
      size="xl"
      color="neutral"
      variant="outline"
      :class="['absolute overflow-hidden cursor-pointer top-4/5 left-1/2 -translate-x-1/2 bg-transparent']"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
    <!-- spring弹簧动画, stiffness弹簧的刚度, 越小越柔软, 回弹更明显, damping: 阻尼, 越小摆动越久, 用来做轻微的摆动, resetDelta:当速度/位置误差小于该值时视为动画结束,值越小越精确、动画越久(其实不是很懂, 但是随便加点值显示吧) -->
      <Motion
        tag="span"
        :initial="{ scale: 0 }"
        :animate="{ scale: isHovered ? 1 : 0 }"
        :transition="{ type: 'spring', stiffness: 85, damping: 18, restDelta: 0.001 }"
        class="pointer-events-none absolute size-160 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d92600]/80"
        :style="{ left: `${cursor.x}px`, top: `${cursor.y}px` }"
      />
      <span :class="['relative z-10 flex items-center gap-2 transition-colors', isHovered ? 'text-white' : 'text-black/80']">
        <UIcon name="lucide-rocket" class="size-5" />
        Back to Home
      </span>
    </UButton>
  </UMain>

  <!-- Toast 容器,用于全局消息提示 (错误页可能也会触发 toast) -->
  <!-- 使用useToast中的add方法时触发 -->
  <UToaster />
</template>