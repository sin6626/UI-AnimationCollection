<script setup lang='ts'>
// 其它未匹配的 slug 兜底为 404
// 已有具名页 (polaroid.vue / color-mode-button.vue) 会优先匹配
throw createError({
  statusCode: 404,
  statusMessage: 'UI component not found',
  fatal: true
})
</script>

<template>
  <div />
</template>
