<script setup lang='ts'>
const route = useRoute()

const { data } = await useAsyncData(route.path, () =>
  queryCollection('ui').path(route.path).first()
)
</script>

<template>
  <SinUIDemo
    :title="data?.title"
    :description="data?.description"
  >
    <SinUINihilisticHero />
  </SinUIDemo>
</template>
