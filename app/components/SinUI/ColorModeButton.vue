<script setup lang='ts'>
const colorMode = useColorMode()

const nextTheme = computed(() => colorMode.value === 'dark' ? 'light' : 'dark')

// 切换主题: 同时同步操作 html class, 让 startViewTransition 的 cb 内 DOM 立即处于目标主题
// 否则 @nuxtjs/color-mode 的两层 watch (preference -> value -> DOM class) 异步应用,
// 浏览器拍"新快照"时 DOM 仍是旧主题, 动画结束覆盖层撤除后真实 DOM 才切, 产生闪屏
const switchTheme = () => {
  const next = nextTheme.value
  const html = document.documentElement
  // @nuxtjs/color-mode 默认 classPrefix="" classSuffix="-mode": dark-mode / light-mode
  html.classList.remove(`${colorMode.value}-mode`)
  html.classList.add(`${next}-mode`)
  // 同步更新 preference, 触发内部 setState 但不等 watch 异步
  colorMode.preference = next
}

const startViewTransition = (event: MouseEvent) => {
  if (!document.startViewTransition) {
    switchTheme()
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )
  const transition = document.startViewTransition(() => {
    switchTheme()
  })

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
        duration,
        easing: 'cubic-bezier(.76,.32,.29,.99)',
        pseudoElement: '::view-transition-new(root)'
      }
    )
  })
}

const startViewTransition2 = (event: MouseEvent) => {
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    switchTheme()
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )
  const root = document.documentElement
  const transitionClass = nextTheme.value === 'light'
    ? 'sinui-theme-reveal-expand'
    : 'sinui-theme-reveal-contract'

  root.style.setProperty('--sinui-theme-transition-x', `${x}px`)
  root.style.setProperty('--sinui-theme-transition-y', `${y}px`)
  root.style.setProperty('--sinui-theme-transition-radius', `${endRadius}px`)
  root.classList.add(transitionClass)

  const transition = document.startViewTransition(() => {
    switchTheme()
  })

  transition.finished.finally(() => {
    root.classList.remove(transitionClass)
    root.style.removeProperty('--sinui-theme-transition-x')
    root.style.removeProperty('--sinui-theme-transition-y')
    root.style.removeProperty('--sinui-theme-transition-radius')
  })
}
</script>

<template>
  <ClientOnly>
    <UButton
      :aria-label="`Switch to ${nextTheme} mode`"
      :icon="`i-lucide-${nextTheme === 'dark' ? 'sun' : 'moon'}`"
      color="neutral"
      variant="ghost"
      size="xl"
      class="rounded-full"
      @click="startViewTransition"
    />

    <div class="border border-gray-400 mx-8 h-6" />

    <UButton
      :aria-label="`Switch to ${nextTheme} mode`"
      :icon="`i-lucide-${nextTheme === 'dark' ? 'sun' : 'moon'}`"
      color="neutral"
      variant="ghost"
      size="xl"
      class="rounded-full"
      @click="startViewTransition2"
    />

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

.sinui-theme-reveal-expand::view-transition-old(root),
.sinui-theme-reveal-contract::view-transition-new(root) {
  z-index: -1;
}

.sinui-theme-reveal-expand::view-transition-new(root),
.sinui-theme-reveal-contract::view-transition-old(root) {
  z-index: 1;
}

.sinui-theme-reveal-expand::view-transition-new(root) {
  clip-path: circle(
    0 at
    var(--sinui-theme-transition-x, 50vw)
    var(--sinui-theme-transition-y, 50vh)
  );
  animation: sinui-theme-reveal-expand 600ms cubic-bezier(.76,.32,.29,.99) both;
}

.sinui-theme-reveal-contract::view-transition-old(root) {
  clip-path: circle(
    var(--sinui-theme-transition-radius, 150vmax) at
    var(--sinui-theme-transition-x, 50vw)
    var(--sinui-theme-transition-y, 50vh)
  );
  animation: sinui-theme-reveal-contract 600ms cubic-bezier(.76,.32,.29,.99) both;
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

@keyframes sinui-theme-reveal-contract {
  to {
    clip-path: circle(
      0 at
      var(--sinui-theme-transition-x, 50vw)
      var(--sinui-theme-transition-y, 50vh)
    );
  }
}
</style>
