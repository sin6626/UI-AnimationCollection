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

// 实际切换颜色模式: 同时同步操作 html class, 让 startViewTransition 内 DOM 立即处于目标主题
const switchTheme = () => {
  const next = nextTheme.value
  const html = document.documentElement
  html.classList.remove(`${colorMode.value}-mode`)
  html.classList.add(`${next}-mode`)
  colorMode.preference = next
}

// 通过 View Transitions API + CSS 变量驱动无偏移的圆形过渡动画
const startViewTransition = (event: MouseEvent) => {
  // 浏览器不支持或开启了减弱动态效果时直接切换
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    switchTheme()
    return
  }

  // 点击点坐标与扩散半径 (保留原有参数计算)
  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  const root = document.documentElement
  const transitionClass = 'sinui-theme-reveal-expand'

  root.style.setProperty('--sinui-theme-transition-x', `${x}px`)
  root.style.setProperty('--sinui-theme-transition-y', `${y}px`)
  root.style.setProperty('--sinui-theme-transition-radius', `${endRadius}px`)
  root.classList.add(transitionClass)

  // 启动视图过渡并执行切换
  const transition = document.startViewTransition(() => {
    switchTheme()
  })

  // 过渡结束后清理 CSS 变量与辅助 class
  transition.finished.finally(() => {
    root.classList.remove(transitionClass)
    root.style.removeProperty('--sinui-theme-transition-x')
    root.style.removeProperty('--sinui-theme-transition-y')
    root.style.removeProperty('--sinui-theme-transition-radius')
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
/* 取消默认 cross-fade 动画, 改由 CSS clip-path 控制, 防止新旧快照叠加闪屏 */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

/* 旧视图在下层，新视图在上层自点击点扩散展开覆盖 */
.sinui-theme-reveal-expand::view-transition-old(root) {
  z-index: 1;
}

.sinui-theme-reveal-expand::view-transition-new(root) {
  z-index: 9999;
  clip-path: circle(
    0 at
    var(--sinui-theme-transition-x, 50vw)
    var(--sinui-theme-transition-y, 50vh)
  );
  animation: sinui-theme-reveal-expand 600ms cubic-bezier(.76,.32,.29,.99) both;
}

@keyframes sinui-theme-reveal-expand {
  to {
    clip-path: circle(
      var(--sinui-theme-transition-radius, 150vmax) at
      var(--sinui-theme-transition-x, 50vw)
      var(--sinui-theme-transition-y, 50vh)
    );
  }
}
</style>
