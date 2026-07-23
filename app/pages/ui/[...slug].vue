<script setup lang='ts'>
const route = useRoute()
// console.log(route.path);

const { data: data } = await useAsyncData(route.path, () =>
  queryCollection('ui').path(route.path).first()
)

// const { data: images } = await useAsyncData('image', () => {
//   return queryCollection('images').first()
// })

type image = {
  src: string,
  alt: string
}

const images: image[] = [
  {
    src: '/Devil.png',
    alt: 'Let my demon invade!'
  },
  {
    src:'/Sin.jpg',
    alt:`I'm Sin 😉`
  },
  {
    src: '/Devil.png',
    alt: 'Let my demon invade!'
  },
  {
    src:'/Sin.jpg',
    alt:`I'm Sin 😉`
  }
] 


// 取相邻文章 (上一篇/下一篇,仅需 description 字段)
// queryCollectionItemSurrounding: 查找特定路径的同级内容
const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
  // fields: 要包含在周围项中的附加字段数组, 这里只要description
  queryCollectionItemSurroundings('ui', route.path, {
    fields: ['description']
  })
)

</script>

<template>
  <UMain class="mt-20 px-2">
    <UContainer class="relative min-h-screen">
      <UPage>
        <ULink to="/ui" class="text-sm flex items-center gap-1">
          <UIcon name="lucide:chevron-left" />
          Back to UI
        </ULink>
        <div class="flex flex-col gap-3 mt-8">
          <h1 class="text-4xl text-center font-medium max-w-3xl mx-auto text-highlighted text-shadow-lg">
            {{ data?.title }}
          </h1>
        </div>
        <p class="text-base text-center max-w-2xl mx-auto">
          {{ data?.description }}
        </p>

        <UPageBody>
          <div class="m-auto flex flex-row justify-center items-center py-10 bg-default rounded-3xl ">
            <SinUIPolaroidItem v-for="(image, index) in images" :key="index" :image="image" :index />
          </div>

          <UContentSurround :surround />
        </UPageBody>

      </UPage>
    </UContainer>
  </UMain>
</template>
