<script setup lang='ts'>
const { locale } = useI18n()

useHead(() => ({
  htmlAttrs: {
    lang: locale.value
  }
}))
</script>

<template>
  <!-- Nuxt UI 顶层应用组件,提供全局 UI 上下文、颜色模式支持、Toast 等基础能力 -->
  <UApp>
    <!-- 默认布局包裹,内部渲染当前路由对应的页面 -->
    <NuxtLayout>
      <UMain class="relative">
        <NuxtPage />
      </UMain>
    </NuxtLayout>
  </UApp>

</template>
<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  filter: grayscale(1);
}
</style>
