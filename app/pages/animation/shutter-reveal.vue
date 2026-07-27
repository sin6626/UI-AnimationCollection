<script setup lang='ts'>
const route = useRoute()

const { data } = await useAsyncData(route.path, () =>
  queryCollection('animation').path(route.path).first()
)
</script>

<template>
  
  <SinAniDemo :title="data?.title" :description="data?.description">
    <SinAniShutterReveal />
  </SinAniDemo>

</template>
