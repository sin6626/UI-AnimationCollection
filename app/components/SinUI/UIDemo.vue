/**
 * UI 组件演示页公共壳
 * - 负责统一渲染: 返回链接 / 标题 / 描述 / 上下篇导航
 * - 演示内容由默认插槽传入, 各组件演示页自定义
 * - meta (title/description) 由父组件从当前语言 Content 查询后传入
 * - surround 基于 route.path 查询同级内容
 */

<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const props = defineProps<{
  title?: string
  description?: string
}>()

// 取相邻文章 (上一篇/下一篇,仅需 description 字段)
const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryLocalizedContentSurround('ui', locale.value, route.path)
}, { watch: [locale] })

const localizedSurround = computed(() => surround.value?.map((item) => {
  if (!item) return item

  return {
    ...item,
    path: localePath(item.path),
    title: item.title,
    description: item.description
  }
}))

</script>

<template>
  <UMain class="mt-20 px-2">
    <UContainer class="relative min-h-[70vh]">
      <UPage>
          <ULink :to="localePath('/ui')" class="text-sm flex items-center gap-1">
            <UIcon name="lucide:chevron-left" />
          {{ t('ui.back') }}
        </ULink>

        <div class="flex flex-col gap-3 mt-8">
          <h1 class="text-4xl text-center font-medium max-w-3xl mx-auto text-highlighted text-shadow-lg">
            {{ props.title }}
          </h1>
        </div>
        <p class="text-base text-center max-w-2xl mx-auto mt-8">
          {{ props.description }}
        </p>

        <UPageBody>
          <!-- 演示区: 由各组件页注入 -->
          <slot />
        </UPageBody>
      </UPage>
    </UContainer>

  <UContentSurround :surround="localizedSurround" class="mt-d"/>
  </UMain>
</template>
