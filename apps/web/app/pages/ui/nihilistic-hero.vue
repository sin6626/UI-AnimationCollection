<script setup lang='ts'>
const route = useRoute()
const { locale } = useI18n()

const { data } = await useAsyncData(`${route.path}-content`, () => {
  return queryLocalizedContentItem('ui', locale.value, route.path)
}, { watch: [locale] })
</script>

<template>
  <SinUIDemo
    :title="data?.title"
    :description="data?.description"
  >
    <SinUINihilisticHero />
  </SinUIDemo>
</template>
