<script setup lang='ts'>
const route = useRoute()

// 从 content/ui/color-mode-button.yml 取元信息
const { data } = await useAsyncData(route.path, () =>
  queryCollection('ui').path(route.path).first()
)
</script>

<template>
  <SinUIDemo :title="data?.title" :description="data?.description">
    <!-- 演示区: 居中放一个 SinUI 版的 ColorModeButton -->
    <div class="m-auto flex flex-row justify-center items-center py-10 bg-default rounded-3xl">
      <SinUIColorModeButton />
    </div>
  </SinUIDemo>
</template>
