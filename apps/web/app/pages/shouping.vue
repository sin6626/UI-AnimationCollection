<script setup lang="ts">
definePageMeta({
  layout: false
})

const isHovered = ref(false)
const cursor = reactive({ x: 0, y: 0 })
const { enter, pageRef, dividerRef } = useEnter()

function updateCursor(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
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
  <div
    ref="pageRef"
    class="relative min-h-screen w-full bg-[#282a30] text-neutral-800 flex flex-col justify-between"
  >
    <!-- 顶部留白缓冲区 -->
    <div class="h-4 sm:h-8" />

    <!-- 主体内容承载区：最大宽度居中 + 垂直居中 -->
    <main class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center py-6">
      <div class="relative w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <!-- 左侧个人名片区（1:1 平分） -->
        <div class="w-full">
          <ShoupingHomeLeft :enter="enter" />
        </div>

        <!-- 中间分割线：绝对定位居中，不占 Grid 轨道 -->
        <div
          ref="dividerRef"
          data-visit-divider
          class="hidden lg:block absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/20 to-transparent pointer-events-none"
        />

        <!-- 右侧信息展板与导航区（1:1 平分） -->
        <div class="w-full">
          <ShoupingHomeRight :enter="enter" />
        </div>
      </div>
    </main>

    <!-- 底部区域：包含 Visit 按钮与版权信息 -->
    <footer class="w-full flex flex-col items-center gap-3.5 pb-4 pt-2 text-center z-10">
      <!-- Visit 按钮：点击跳转首页，具备鼠标位置跟随弹簧水波纹动效 -->
      <UButton
        type="button"
        size="xl"
        color="neutral"
        variant="outline"
        class="relative overflow-hidden cursor-pointer rounded-full px-7 py-2.5 bg-neutral-900/60 border-white/20 hover:border-transparent transition-all duration-300 backdrop-blur-sm group"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @click="enter('/')"
      >
        <!-- spring 弹簧动画背景色块 -->
        <Motion
          tag="span"
          :initial="{ scale: 0 }"
          :animate="{ scale: isHovered ? 1 : 0 }"
          :transition="{ type: 'spring', stiffness: 85, damping: 18, restDelta: 0.001 }"
          class="pointer-events-none absolute size-160 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d92600]/80"
          :style="{ left: `${cursor.x}px`, top: `${cursor.y}px` }"
        />
        <span class="relative z-10 flex items-center gap-2 text-sm sm:text-base font-medium tracking-wide text-white transition-colors">
          <UIcon
            name="i-lucide-rocket"
            class="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
          <span>Visit</span>
        </span>
      </UButton>

      <!-- 版权信息 -->
      <div class="text-xs text-neutral-400">
        <!-- &copy是版本符号 &bull是圆点符号  -->
        <p>Copyright &copy; {{ new Date().getFullYear() }} &bull; Made with &hearts;</p>
      </div>
    </footer>
  </div>
</template>
