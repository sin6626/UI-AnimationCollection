<script setup lang='ts'>
const { t } = useI18n()
</script>

<template>
  <SinAniDemo
    :title="t('items.wave-reveal.title')"
    :description="t('items.wave-reveal.description')"
  >
    <SinAniWaveReveal />
  </SinAniDemo>
</template>
