<script setup lang="ts">
const { locale, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const nextLocale = computed(() => locale.value === 'zh' ? 'en' : 'zh')
</script>

<template>
  <UButton
    :to="switchLocalePath(nextLocale)"
    :aria-label="t('common.switchLanguage')"
    :title="t('common.switchLanguage')"
    color="neutral"
    variant="ghost"
    icon="i-lucide-languages"
    size="sm"
  />
</template>
