<script setup lang='ts'>
const { data: images } = await useAsyncData('image', () => {
  return queryCollection('images').first()
})

const oj = {
  src: '/favicon.ico',
  alt: 'Sin'
}

// console.log(images.value)
</script>

<template>
  <div class="m-auto h-255 flex flex-row justify-center items-center py-10 bg-gray-900">
    <PolaroidItem v-for="(image, index) in images?.images" :key="index" :image="image" :index />
    <!-- <PolaroidItem :image="oj" :index="1" /> -->
  </div>
</template>
