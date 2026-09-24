<script setup lang="ts">
interface SocialItem {
  name: string
  icon: string
  url: string
}

const siteTitle = ref('SinのUI＆Animation')
const greeting = ref('Welcome to the my little world')
const description = ref('一个建立于 21 世纪的小站，存活于互联网的边缘')

const socialList = ref<SocialItem[]>([
  { name: 'GitHub', icon: 'ri:github-fill', url: '#' },
  { name: 'Bilibili', icon: 'ri:bilibili-fill', url: '#' },
  { name: 'QQ', icon: 'ri:qq-fill', url: '#' },
  { name: 'Email', icon: 'ri:mail-fill', url: '#' },
  { name: 'Twitter', icon: 'ri:twitter-x-fill', url: '#' },
  { name: 'Telegram', icon: 'ri:telegram-fill', url: '#' }
])
</script>

<template>
  <div class="flex flex-col gap-6 sm:gap-8 w-full max-w-lg mx-auto lg:mx-0">
    <!--站点 Logo 与标题 -->
    <div class="flex items-center gap-4 sm:gap-6">
      <!-- 头像 / 圆形 Logo shrink-0 禁止压缩, 保证图标大小 -->
      <div class="relative group cursor-pointer shrink-0">
        <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-neutral-800/10 shadow-xl ring-4 ring-neutral-900/5 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6">
          <!-- select-none 用户禁止选择 -->
          <NuxtImg
            src="/Sin.jpg"
            alt="Site Avatar"
            class="w-full h-full object-cover select-none"
            loading="lazy"
          />
        </div>
      </div>

      <!-- 站点标题 -->
      <div class="flex flex-col">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white select-none font-serif italic">
          {{ siteTitle }}
        </h1>
      </div>
    </div>

    <!-- 个人介绍卡片 (毛玻璃质感) -->
    <div class="relative bg-neutral-900/90 text-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-neutral-700/50 backdrop-blur-md transition-all duration-300 hover:shadow-neutral-900/20 hover:-translate-y-1">
      <!-- 左上双引号 -->
      <div class="text-2xl sm:text-6xl leading-none text-white/40 font-serif select-none mb-1">
        &ldquo;
      </div>

      <!-- 卡片文本主体 -->
      <div class="px-2 sm:px-3">
        <h2 class="text-xl sm:text-2xl font-bold tracking-wide italic font-serif text-white/95">
          {{ greeting }}
        </h2>
        <p class="mt-2 text-sm sm:text-base text-neutral-300 leading-relaxed font-sans">
          {{ description }}
        </p>
      </div>

      <!-- 右下双引号 -->
      <div class="flex justify-end text-2xl sm:text-6xl leading-none text-white/40 font-serif select-none mt-1">
        &rdquo;
      </div>
    </div>

    <!--社交图标矩阵 -->
    <div class="flex items-center gap-3 sm:gap-4 flex-wrap">
      <a
        v-for="item in socialList"
        :key="item.name"
        :href="item.url"
        :title="item.name"
        target="_blank"
        rel="noopener noreferrer"
        class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-neutral-900/90 text-white/80 hover:text-white hover:bg-neutral-800 border border-neutral-700/50 shadow-md transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <UIcon :name="item.icon" class="text-lg sm:text-xl" />
      </a>
    </div>
  </div>
</template>
