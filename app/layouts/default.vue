/**
 * 默认布局
 * - 顶部吸附导航 + 页面内容 (slot) + 页脚 的统一包裹
 * - 在 sm 及以上屏幕给一个左右边框作为容器分隔
 */

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t } = useI18n()
const localePath = useLocalePath()
const navLinks = computed<NavigationMenuItem[]>(() => [{
  label: t('nav.home'),
  icon: 'i-lucide-home',
  to: localePath('/')
}, {
  label: t('nav.ui'),
  icon: 'tabler:components',
  to: localePath('/ui')
}, {
  label: t('nav.animation'),
  icon: 'tdesign:animation-1',
  to: localePath('/animation')
}, {
  label: t('nav.laboratory'),
  icon: 'ri:ai',
  to: localePath('/AiLaboratory')
}])
</script>

<template>
  <div>
    <!-- 容器: 居中限宽 + 紧凑顶部留白 + 两侧边框 (中等及以上屏幕显示) -->
    <UContainer class="relative sm:border-x border-default pt-3 sm:pt-4">
      <aside
        class="absolute top-0 hidden px-3 min-[1440px]:block 2xl:px-6"
        style="left: calc((100vw - var(--ui-container)) / -2); width: calc((100vw - var(--ui-container)) / 2);"
      >
        <div class="sticky top-24 flex justify-center">
          <SidebarMusicPlayer class="max-w-full" />
        </div>
      </aside>

      <!-- 顶部导航 -->
      <AppHeader :links="navLinks" />
      <!-- 页面内容插槽,由进入该布局的路由组件填充 -->
      <slot />
      <!-- 页脚 -->
      <AppFooter />
    </UContainer>
  </div>
</template>
