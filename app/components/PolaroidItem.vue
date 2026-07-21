<script setup lang='ts'>
defineProps<{
  image: {
    src: string,
    alt: string
  }
  index: number
}>()
</script>

<template>
  <div class="flex flex-col bg-white p-2 drop-shadow-2xl transition-transform duration-300 ease-in-out hover:scale-105 hover:rotate-0 hover:z-10 -space-x-8" :class="[
      index % 2 === 0 ? 'rotate-5' : '-rotate-5', index % 2 === 0 ? 'hover:-translate-x-4' : 'hover:translate-x-4'
    ]">
    <img :src="image.src" :alt="image.alt" class="size-32 object-cover" >

    <span class="w-32 text-center text-xs text-black font-serif mt-2">
      {{ image.alt }}
    </span>

  </div>
</template>
