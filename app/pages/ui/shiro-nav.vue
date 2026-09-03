<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()

const { data } = await useAsyncData(`${route.path}-content`, () => {
  return queryLocalizedContentItem('ui', locale.value, route.path)
}, { watch: [locale] })
</script>

<template>
  <SinUIDemo
    :title="data?.title"
    :description="data?.description"
  >
    <!-- 演示区: 居中展示 ShiroNav 胶囊导航栏 -->
    <div class="m-auto flex flex-row justify-center items-center py-20 bg-default rounded-3xl">
      <SinUIShiroNav />
    </div>
  </SinUIDemo>
</template>
