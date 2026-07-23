<script setup lang='ts'>

const { data: page } = await useAsyncData('index', () => {
  return queryCollection('index').first()
})
const events = page.value?.events
// console.log(events)


if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

const hero = {
  title: '我是Sin, 这是我写UI和动画的地方',
  description: '一个专门用来给我写组件, UI设计, 动画的仓库, 可能来源于各种地方, 收集各个角落自己喜欢的UI和动画',
  links: '#'
}

const categorys = ['UI', 'Animation']


</script>

<template>
  <UPage>
    <UPageHero :title="hero.title" :description="hero.description" :ui="{
      title: 'mx-0! text-left',
      description: 'mx-0! text-left text-blance',
      links: 'justify-start'
    }">
      <template #links>
        <UButton v-if="hero.links" :to="`#`" />
      </template>
    </UPageHero>

    <UPage>
      <div v-for="(category, index) in categorys" :key="index"
        class="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 mb-16 last:mb-0">

        <!-- 左侧 -->
        <div class="lg:col-span-1 mb-4 lg:mb-0 pl-10">
          <h2 class="lg:sticky lg:top-16 text-xl font-semibold text-highlighted">
            {{ category }}
          </h2>
        </div>

        <!-- 右侧 -->
        <div
          class="lg:col-span-1 space-y-8 font-serif">
          <div class="flex-col gap-3 " v-for="(event, index) in events?.filter(e => e.category === category)" :key="event.title">
            <NuxtLink v-if="event.to" :to="event.to" class="dark:hover:text-amber-50 light:hover:text-gray-500">
              {{ index + 1 }} - {{ event.title }}
            </NuxtLink>
          </div>
        </div>

      </div>
    </UPage>

  </UPage>
</template>