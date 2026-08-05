<script setup lang='ts'>
const { t } = useI18n()

type image = {
  src: string
  alt: string
}

const images: image[] = [
  { src: '/Devil.png', alt: 'Let my demon invade!' },
  { src: '/Sin.jpg', alt: `I'm Sin 😉` },
  { src: '/Devil.png', alt: 'Let my demon invade!' },
  { src: '/Sin.jpg', alt: `I'm Sin 😉` }
]
</script>

<template>
  <SinUIDemo :title="t('items.polaroid.title')" :description="t('items.polaroid.description')">
    <div class="m-auto flex flex-row justify-center items-center py-10 bg-default rounded-3xl">
      <SinUIPolaroidItem v-for="(image, index) in images" :key="index" :image="image" :index />
    </div>
  </SinUIDemo>
</template>
