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
<!-- 下面的bodyLock默认为True, 会锁定全局, 也会让滚动条消失, 让布局改变 -->
<template>
  <USelect
    :model-value="locale"
    :items="items"
    :content="{ bodyLock: false }"
    size="md"
    variant="ghost"
    class="w-28 shrink-0"
    @update:model-value="changeLocale"
  />
</template>
