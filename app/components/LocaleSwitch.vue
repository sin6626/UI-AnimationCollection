<script setup lang="ts">
const { locale, setLocale, t } = useI18n()

const nextLocale = computed(() => locale.value === 'zh' ? 'en' : 'zh')

async function toggleLocale(): Promise<void> {
  await setLocale(nextLocale.value)
}
</script>

<template>
  <UButton
    :aria-label="t('common.switchLanguage')"
    :title="t('common.switchLanguage')"
    color="neutral"
    variant="ghost"
    icon="i-lucide-languages"
    size="sm"
    @click="toggleLocale"
  />
</template>
