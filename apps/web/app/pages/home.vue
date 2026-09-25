<script setup lang='ts'>
const { $gsap: gsap, $SplitText: SplitText } = useNuxtApp()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const { data: uiItems } = await useAsyncData(`home-ui-${locale.value}`, () => {
  return queryLocalizedContentList('ui', locale.value)
}, { watch: [locale] })

const { data: animationItems } = await useAsyncData(`home-animation-${locale.value}`, () => {
  return queryLocalizedContentList('animation', locale.value)
}, { watch: [locale] })

const hero = computed(() => ({
  title: t('home.title'),
  description: t('home.description')
}))

const categories = computed(() => ['UI', 'Animation'].map(category => ({
  key: category,
  label: t(`categories.${category}`),
  items: category === 'UI' ? uiItems.value : animationItems.value
})))

onMounted(() => {
  const herodescription = new SplitText('.herodescription', {
    type: 'lines, chars'
  })

  const t1 = gsap.timeline()
  t1
    .from(
      herodescription.chars,
      {
        yPercent: 100,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.7,
        ease: 'power4.out'
      }
    )
})
</script>

<template>
  <UPage>
    <Motion
      :initial="{
        scale: 1.1,
        opacity: 0,
        filter: 'blur(20px)'
      }"
      :animate="{
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)'
      }"
      :transition="{
        duration: 0.6,
        delay: 0.1
      }"
    >
      <UPageHero
        :title="hero.title"
        :description="hero.description"
        :ui="{
          title: 'mx-0! text-left',
          description: 'mx-0! text-left text-balance herodescription',
          links: 'justify-start'
        }"
      />
    </Motion>

    <Motion
      :initial="{
        scale: 1.1,
        opacity: 0,
        filter: 'blur(20px)'
      }"
      :animate="{
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)'
      }"
      :transition="{
        duration: 0.6,
        delay: 0.2
      }"
    >
      <div
        v-for="category in categories"
        :key="category.key"
        class="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 mb-16 last:mb-0"
      >
        <!-- 左侧 -->
        <div class="lg:col-span-1 mb-4 lg:mb-0 pl-10">
          <h2 class="lg:sticky lg:top-16 text-xl font-semibold text-highlighted">
            {{ category.label }}
          </h2>
        </div>

        <!-- 右侧 -->
        <div class="lg:col-span-1 space-y-8 font-serif">
          <div
            v-for="(event, index) in category.items"
            :key="event.path"
            class="flex-col gap-3 "
          >
            <NuxtLink
              :to="localePath(event.path)"
              class="dark:hover:text-amber-50 light:hover:text-gray-500"
            >
              {{ index + 1 }} - {{ event.title }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </Motion>
  </UPage>
</template>
