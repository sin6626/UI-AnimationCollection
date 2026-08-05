<script setup lang='ts'>
const route = useRoute()
const { locale } = useI18n()

const { data } = await useAsyncData(`${route.path}-content`, () => {
  return queryLocalizedContentItem('animation', locale.value, route.path)
}, { watch: [locale] })
</script>

<template>
  <SinAniDemo
    :title="data?.title"
    :description="data?.description"
  >
    <SinAniInteractiveIconMorph />
  </SinAniDemo>
</template>
