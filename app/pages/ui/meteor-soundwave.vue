<script setup lang="ts">
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
    <div class="m-auto flex flex-col justify-center items-center py-6">
      <SinUIMeteorSoundwave />
    </div>
  </SinUIDemo>
</template>
