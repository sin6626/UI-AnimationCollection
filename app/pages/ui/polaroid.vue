<script setup lang='ts'>
const route = useRoute()
const { locale } = useI18n()

const { data } = await useAsyncData(`${route.path}-content`, () => {
  return queryLocalizedContentItem('ui', locale.value, route.path)
}, { watch: [locale] })

type PolaroidImage = {
  src: string
  alt: string
}

const images: PolaroidImage[] = [
  { src: '/Devil.png', alt: 'Let my demon invade!' },
  { src: '/Sin.jpg', alt: `I'm Sin 😉` },
  { src: '/Devil.png', alt: 'Let my demon invade!' },
  { src: '/Sin.jpg', alt: `I'm Sin 😉` }
]
</script>

<template>
  <SinUIDemo
    :title="data?.title"
    :description="data?.description"
  >
    <DemoContainer>
      <SinUIPolaroidItem
        v-for="(image, index) in images"
        :key="index"
        :image="image"
        :index
      />
    </DemoContainer>
  </SinUIDemo>
</template>
