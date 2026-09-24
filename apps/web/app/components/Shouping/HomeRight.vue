<script setup lang="ts">
interface NavItem {
  title: string
  icon: string
  url: string
}

// 诗词数据池
const poems = [
  {
    content: '黑云翻墨未遮山，白雨跳珠乱入船。',
    author: '「六月二十七日望湖楼醉书」'
  },
  {
    content: '长风破浪会有时，直挂云帆济沧海。',
    author: '「行路难·其一」'
  },
  {
    content: '落霞与孤鹜齐飞，秋水共长天一色。',
    author: '「滕王阁序」'
  },
  {
    content: '山重水复疑无路，柳暗花明又一村。',
    author: '「游山西村」'
  }
]

const currentPoemIndex = ref(0)
const currentPoem = computed(() => poems[currentPoemIndex.value] ?? poems[0]!)

function nextPoem() {
  currentPoemIndex.value = (currentPoemIndex.value + 1) % poems.length
}

// 实时时间计算（使用 ClientOnly 避免 SSR 水合不一致）
const currentDate = ref('')
const currentTime = ref('00:00:00')
const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
let timer: ReturnType<typeof setInterval> | null = null

function updateDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const day = weekdays[now.getDay()]
  currentDate.value = `${year} 年 ${month} 月 ${date} 日 ${day}`

  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

// 天气概况状态
const weatherInfo = ref({
  city: '长沙',
  temp: '32°C',
  condition: '晴朗',
  icon: 'i-lucide-sun-medium'
})

// 网站快捷导航列表
const navList = ref<NavItem[]>([
  { title: '博客', icon: 'ri:quill-pen-line', url: '#' },
  { title: '网盘', icon: 'ri:cloud-line', url: '#' },
  { title: '音乐', icon: 'ri:disc-line', url: '/Music' },
  { title: '起始页', icon: 'ri:compass-3-line', url: '#' },
  { title: '网址集', icon: 'ri:book-read-line', url: '#' },
  { title: '今日热榜', icon: 'ri:fire-line', url: '#' }
])
</script>

<template>
  <div class="flex flex-col gap-6 w-full max-w-xl mx-auto lg:mx-0">
    <!-- 上半部分：2 个信息卡片（6 栅格：各占 3 列，共 6 列） -->
    <div class="grid grid-cols-1 sm:grid-cols-6 gap-4">
      <!-- 诗词卡片（占 3 列） -->
      <div
        class="sm:col-span-3 bg-neutral-900/90 text-white rounded-2xl p-5 shadow-2xl border border-neutral-700/50 backdrop-blur-md flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-neutral-800/90 select-none group min-h-[140px]"
        title="点击切换下一首诗词"
        @click="nextPoem"
      >
        <p class="text-sm sm:text-base font-serif leading-relaxed line-clamp-3 text-neutral-200">
          {{ currentPoem.content }}
        </p>
        <p class="text-xs text-neutral-400 font-serif text-right mt-3 group-hover:text-neutral-300 transition-colors">
          - {{ currentPoem.author }}
        </p>
      </div>

      <!-- 时钟与天气卡片（占 3 列） -->
      <ClientOnly>
        <div class="sm:col-span-3 bg-neutral-900/90 text-white rounded-2xl p-5 shadow-2xl border border-neutral-700/50 backdrop-blur-md flex flex-col items-center justify-between min-h-[140px] select-none">
          <!-- 日期与星期 -->
          <span class="text-xs text-neutral-300 tracking-wide font-sans">
            {{ currentDate }}
          </span>

          <!-- LED 数码时钟 -->
          <span class="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-white my-1 tabular-nums">
            {{ currentTime }}
          </span>

          <!-- 天气概况 -->
          <div class="flex items-center gap-1.5 text-xs text-neutral-400">
            <UIcon :name="weatherInfo.icon" class="text-sm" />
            <span>{{ weatherInfo.city }} {{ weatherInfo.temp }} {{ weatherInfo.condition }}</span>
          </div>
        </div>

        <template #fallback>
          <div class="sm:col-span-3 bg-neutral-900/90 text-white rounded-2xl p-5 shadow-2xl border border-neutral-700/50 backdrop-blur-md flex flex-col items-center justify-center min-h-[140px]">
            <span class="text-neutral-500 text-xs">加载时间中...</span>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- 下半部分：网站列表快捷导航 -->
    <div class="flex flex-col gap-3">
      <!-- 区域标题 -->
      <div class="flex items-center gap-2 text-white font-medium text-sm">
        <UIcon name="ri:links-line" class="text-base text-white/80" />
        <span>网站列表</span>
      </div>

      <!-- 快捷导航网格（6 栅格：每项占 2 列，刚好一行 3 项，共 2 行 6 项） -->
      <div class="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <NuxtLink
          v-for="item in navList"
          :key="item.title"
          :to="item.url"
          class="col-span-1 sm:col-span-2 bg-neutral-900/90 text-white rounded-2xl py-3.5 px-4 shadow-xl border border-neutral-700/50 backdrop-blur-md flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.03] hover:bg-neutral-800 hover:border-neutral-500/50 select-none group h-3 0"
        >
          <UIcon :name="item.icon" class="text-lg text-neutral-300 group-hover:text-white transition-colors" />
          <span class="text-sm font-medium tracking-wide text-neutral-200 group-hover:text-white transition-colors">
            {{ item.title }}
          </span>
        </NuxtLink>
      </div>

      <!-- 底部轮播/分页指示器 -->
      <div class="flex items-center justify-center gap-1.5 mt-2">
        <span class="w-6 h-1 rounded-full bg-white" />
        <span class="w-1.5 h-1 rounded-full bg-white/40" />
      </div>
    </div>
  </div>
</template>
