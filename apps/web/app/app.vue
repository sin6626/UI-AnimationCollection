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
      <NuxtPage />
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

.visit-door-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  overflow: hidden;
}

.visit-door-panel {
  position: relative;
  flex: 0 0 50%;
  height: 100%;
  overflow: hidden;
  background: #282a30;
}

.visit-door-scene {
  position: absolute;
  top: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  pointer-events: none;
}

.visit-door-panel--left .visit-door-scene { left: 0; }
.visit-door-panel--right .visit-door-scene { right: 0; }

.visit-door-line {
  position: absolute;
  top: var(--door-line-top);
  width: 1px;
  height: var(--door-line-height);
  background: linear-gradient(to bottom, transparent, rgb(255 255 255 / 20%), transparent);
  pointer-events: none;
}

.visit-door-panel--left .visit-door-line { right: 0; }
.visit-door-panel--right .visit-door-line { left: 0; }
</style>
