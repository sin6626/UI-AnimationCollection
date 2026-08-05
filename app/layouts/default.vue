/**
 * 默认布局
 * - 顶部浮动导航 + 页面内容 (slot) + 页脚 的统一包裹
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
    <!-- 容器: 居中限宽 + 顶部留白 + 两侧边框 (中等及以上屏幕显示) -->
    <UContainer class="sm:border-x border-default pt-10">
      <!-- 顶部导航 -->
      <AppHeader :links="navLinks" />
      <!-- 页面内容插槽,由进入该布局的路由组件填充 -->
      <slot />
      <!-- 页脚 -->
      <AppFooter />
    </UContainer>
  </div>
</template>
