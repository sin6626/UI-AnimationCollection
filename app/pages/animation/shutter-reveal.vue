<script setup lang='ts'>
const { t } = useI18n()
</script>

<template>
  
  <SinAniDemo :title="t('items.shutter-reveal.title')" :description="t('items.shutter-reveal.description')">
    <SinAniShutterReveal />
  </SinAniDemo>

</template>
