/**
 * 默认布局
 * - 顶部浮动导航 + 页面内容 (slot) + 页脚 的统一包裹
 * - 在 sm 及以上屏幕给一个左右边框作为容器分隔
 */

<script setup lang="ts">
import { navLinks } from '~/utils/links';

// 默认布局没有额外逻辑,仅作结构包裹
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
