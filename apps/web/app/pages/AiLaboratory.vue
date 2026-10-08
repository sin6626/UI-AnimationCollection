<script setup lang="ts">
import MonacoEditor from './ui/MonacoEditor.client.vue'

// 页面保存代码内容；编辑器通过 v-model 将用户修改同步回来。
const code = ref('')
</script>

<template>
  <!-- 客户端组件放在 ClientOnly 内，服务端渲染时不执行 Monaco 的浏览器代码。 -->
  <ClientOnly>
    <MonacoEditor v-model="code" language="typescript" />
  </ClientOnly>
</template>
