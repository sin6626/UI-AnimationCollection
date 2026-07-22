/**
 * 暗色 / 亮色颜色模式切换按钮
 * - 使用 View Transitions API 实现从点击点扩散的圆形切换动画
 * - 不支持 startViewTransition 时降级为直接切换
 * - 仅在客户端渲染 (ClientOnly 包装)
 */

<script setup lang="ts">
// 获取当前颜色模式实例
const colorMode = useColorMode()

// 计算下一个主题 (当前为暗则切到亮,反之亦然)
const nextTheme = computed(() => (colorMode.value === 'dark' ? 'light' : 'dark'))

// 实际切换颜色模式: 设置 preference 触发切换
const switchTheme = () => {
  colorMode.preference = nextTheme.value
}

// 通过 View Transitions API 启动从点击点扩散的圆形过渡动画
const startViewTransition = (event: MouseEvent) => {
  // 浏览器不支持时直接切换
  if (!document.startViewTransition) {
    switchTheme()
    return
  }

  // 点击点坐标与扩散半径 (覆盖全屏)
  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  // 启动视图过渡并执行切换
  const transition = document.startViewTransition(() => {
    switchTheme()
  })

  // 过渡就绪后用 clipPath 动画实现从点击点扩散的圆形切换效果
  transition.ready.then(() => {
    const duration = 600
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ]
      },
      {
        duration: duration,
        easing: 'cubic-bezier(.76,.32,.29,.99)',
        pseudoElement: '::view-transition-new(root)'
      }
    )
  })
}
</script>

<template>
  <!-- 仅客户端渲染 (避免水合不匹配) -->
  <ClientOnly>
    <UButton
      :aria-label="`Switch to ${nextTheme} mode`"
      :icon="`i-lucide-${nextTheme === 'dark' ? 'sun' : 'moon'}`"
      color="neutral"
      variant="ghost"
      size="sm"
      class="rounded-full"
      @click="startViewTransition"
    />
    <!-- 加载前占位 -->
    <template #fallback>
      <div class="size-4" />
    </template>
  </ClientOnly>
</template>

<style>
/* 自定义 view-transition 的层叠顺序与混合,避免动画时双图混色 */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

/* 新视图放上层,旧视图放下层 */
::view-transition-new(root) {
  z-index: 9999;
}
::view-transition-old(root) {
  z-index: 1;
}
</style>
