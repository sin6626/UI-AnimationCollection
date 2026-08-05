<script setup lang="ts">
// locale: 当前语言, 是一个ref, locales: 是在nuxt.config配置中的语言数组
const { locale, locales, setLocale } = useI18n()

const items = computed(() => locales.value.map((item) => {
  // 保险写法, locales允许是locales:['zh','en']
  if (typeof item === 'string') {
    return { label: item, value: item }
  }

  return { label: item.name ?? item.code, value: item.code }
}))

// Parameters Ts中的工具类型, 获取函数的参数类型
async function changeLocale(value: Parameters<typeof setLocale>[0]): Promise<void> {
  await setLocale(value)
}
</script>


<!-- 下面使用model-value而不是value, 因为组件规定单项传值的属性是modelValue -->
<template>
  <USelect
    :model-value="locale"
    :items="items"
    size="md"
    variant="ghost"
    @update:model-value="changeLocale"
  />
</template>
