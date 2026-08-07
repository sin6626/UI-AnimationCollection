/**
 * 默认布局
 * - 顶部吸附导航 + 三栏页面内容 + 页脚的统一包裹
 * - UPage 负责左右侧栏,页面组件负责中间内容
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
  <UContainer class="sm:border-x border-default pt-3 sm:pt-4">
    <AppHeader :links="navLinks" />

    <UMain>
      <UPage>
        <template #left>
          <UPageAside>
            <SidebarMusicPlayer />
          </UPageAside>
        </template>

        <!-- 页面组件保留自己的 UPage,用于组织当前页面内容 -->
        <slot />

        <!-- 为未来的 2D 角色保留右侧栏 -->
        <template #right>
          <UPageAside aria-hidden="true" />
        </template>
      </UPage>
    </UMain>

    <AppFooter />
  </UContainer>
</template>
