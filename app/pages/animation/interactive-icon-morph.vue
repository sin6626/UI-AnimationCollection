<script setup lang='ts'>
const { t } = useI18n()
</script>

<template>
  <SinAniDemo
    :title="t('items.interactive-icon-morph.title')"
    :description="t('items.interactive-icon-morph.description')"
  >
    <SinAniInteractiveIconMorph />
  </SinAniDemo>
</template>
