<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('goldLoop.laboratoryTitle'),
  description: () => t('goldLoop.seoDescription')
})
</script>

<template>
  <SinAniGoldLoop />
</template>
