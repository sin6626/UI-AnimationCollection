<script setup lang='ts'>
const { locale, t } = useI18n()
const localePath = useLocalePath()

const { data } = await useAsyncData(`animation-index-${locale.value}`, () => {
  return queryLocalizedContentList('animation', locale.value)
}, { watch: [locale] })
</script>

<template>
  <UPage>
    <UPageHero
      :title="t('animation.title')"
      :description="t('animation.description')"
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
        :in-view-options="{ once: true }"
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
              :to="localePath(item.path)"
              class="text-sm text-fuchsia-600/80 hover:text-fuchsia-500/80 flex items-center"
            >
              {{ t('animation.view') }}
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
