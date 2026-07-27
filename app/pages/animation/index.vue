<script setup lang='ts'>
const { data: page } = await useAsyncData('animation-index', () => {
  return queryCollection('index').first()
})
const data = page.value?.events.filter(item => item.category === 'Animation')
</script>

<template>
  <UPage>
    <UPageHero
      title="Sin的动画收藏夹"
      description="学懂了就收进来, 下次要用的时候不用重新扒一遍..."
      :ui="{
        title: 'mx-0! text-left',
        description: 'mx-0! text-left'
      }"
    />

    <UPageSection :ui="{ container: 'pt-0!' }">
      <Motion
        v-for="(item, index) in data"
        :key="item.date"
        :initial="{ opacity: 0, transform: 'translateY(10px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.3 * index }"
        :in-view-options="{ once: false }"
      >
        <UPageCard
          :title="item.title"
          :description="item.description"
          target="_self"
          orientation="horizontal"
          variant="naked"
          :reverse="index % 2 === 1"
          class="group"
          :ui="{ wrapper: 'max-sm:order-last' }"
        >
          <template #leading>
            <span class="text-sm text-muted">
              {{ item.date }}
            </span>
          </template>

          <template #footer>
            <ULink
              :to="item.to"
              class="text-sm text-fuchsia-600/80 hover:text-fuchsia-500/80 flex items-center"
            >
              View Animation
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 text-primary transition-all opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
              />
            </ULink>
          </template>

          <NuxtImg
            :src="item.src"
            :alt="item.title"
            class="object-cover w-full h-48 rounded-lg"
          />
        </UPageCard>
      </Motion>
    </UPageSection>
  </UPage>
</template>
