<script setup lang="ts">
/**
 * 演示区通用容器组件 (DemoContainer)
 * - 统一 UI 与动画演示外层的居中包裹容器
 * - 默认水平/垂直居中、圆角 3xl、透明背景 (bg-transparent) 以透出全局梅花画布背景
 * - 默认 py-10，支持父级透传 class 覆盖 padding 或调整为 flex-col 等布局
 */
</script>

<template>
  <div class="m-auto flex flex-row items-center justify-center rounded-3xl bg-transparent py-10">
    <slot />
  </div>
</template>
