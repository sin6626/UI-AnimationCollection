/**
 * 顶部浮动导航组件
 * - 固定在顶部居中位置 (左右随机平移到中线)
 * - 使用 UNavigationMenu + 模糊背景胶囊样式
 * - links 由父组件传入 (统一来自 utils/links.ts 的 navLinks)
 * - 末尾槽位放颜色模式切换按钮
 */

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// 接收导航菜单项数组
defineProps<{
  links: NavigationMenuItem[]
}>()
</script>

<template>
  <div class="top-2 sm:top-4 z-10 size-10 fixed">
    <img src="/Sin.jpg" alt="" class="object-cover rounded-lg">
  </div>
  <!-- 容器: 固定定位 + 居中 + 高 z-index 保证悬浮在内容之上 -->
  <!-- Tailwind经典居中样式组合 left-1/2 距离左边宽度的一半, transform -translate-x-1/2 往左边移动自身的宽度的一半 -->
  <div class="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-10">
    <UNavigationMenu
      :items="links"
      variant="link"
      color="neutral"
      :highlight="true"
      class="bg-muted/80 backdrop-blur-sm rounded-full px-2 sm:px-4 border border-muted/50 shadow-lg shadow-neutral-950/5"
      :ui="{
        link: 'px-2 py-1',
        linkLeadingIcon: 'hidden'
      }"
    >
      <!-- 末尾追加颜色模式切换按钮 -->
      <template #list-trailing>
        <ColorModeButton />
      </template>
    </UNavigationMenu>
  </div>
</template>
