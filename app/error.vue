<script setup lang="ts">
import type { NuxtError } from '#app'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

defineProps({
  error:{
    type: Object as PropType<NuxtError>,
    required: true  
  }
})

</script>

<template>
  <UMain class="relative bg-amber-50 flex flex-col gap-4 min-w-[100vh] min-h-screen">
    <DotLottieVue class="w-full h-full m-auto" autoplay loop src="/404-error.lottie" />
    <UButton to="/" class="absolute top-4/5 left-1/2 -translate-x-1/2 text-gray-600 hover:text-gray-700 hover:bg-amber-100/80" variant="outline" size="xl" icon="i-lucide-rocket" >Back to Home</UButton>
  </UMain>

  <!-- Toast 容器,用于全局消息提示 (错误页可能也会触发 toast) -->
  <!-- 使用useToast中的add方法时触发 -->
  <UToaster />
</template>