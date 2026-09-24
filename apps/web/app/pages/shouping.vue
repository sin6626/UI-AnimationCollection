<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>

<template>
  <div class="relative min-h-screen w-full bg-white text-neutral-800 flex flex-col justify-between">
    <!-- 顶部留白缓冲区 -->
    <div class="h-4 sm:h-8" />

    <!-- 主体内容承载区：最大宽度居中 + 垂直居中 -->
    <main class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center py-6">
      <div class="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <!-- 左侧个人名片区（1:1 平分） -->
        <div class="w-full">
          <ShoupingHomeLeft />
        </div>

        <!-- 右侧信息展板与导航区（1:1 平分） -->
        <div class="w-full">
          <ShoupingHomeRight />
        </div>
      </div>
    </main>

    <!-- 底部版权信息 -->
    <footer class="w-full py-4 text-center text-xs text-neutral-400">
      <!-- &copy是版本符号   -->
      <p>Copyright &copy; {{ new Date().getFullYear() }} &bull; Made with &hearts;</p>
    </footer>
  </div>
</template>
