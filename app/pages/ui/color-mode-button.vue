<script setup lang='ts'>
const { t } = useI18n()
</script>

<template>
  <SinUIDemo :title="t('items.color-mode-button.title')" :description="t('items.color-mode-button.description')">
    <!-- 演示区: 居中放一个 SinUI 版的 ColorModeButton -->
    <div class="m-auto flex flex-row justify-center items-center py-10 bg-default rounded-3xl">
      <SinUIColorModeButton />
    </div>
  </SinUIDemo>
</template>
