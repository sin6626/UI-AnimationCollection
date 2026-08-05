<script setup lang='ts'>
const { t } = useI18n()
</script>

<template>
  <SinUIDemo
    :title="t('items.nihilistic-hero.title')"
    :description="t('items.nihilistic-hero.description')"
  >
    <SinUINihilisticHero />
  </SinUIDemo>
</template>
