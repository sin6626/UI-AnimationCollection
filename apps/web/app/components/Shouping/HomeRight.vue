<script setup lang="ts">
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import NumberFlow from '@number-flow/vue'
import { useLocalWeather } from '~/Api/weather'

interface NavItem {
  title: string
  icon: string
  url: string
}

const props = defineProps<{
  enter: (path: string) => Promise<void>
}>()

function enterInternal(event: MouseEvent, path: string) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  void props.enter(path)
}

// nuxt/18n 确保跳转不丢语言
const localePath = useLocalePath()

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
const now = ref(dayjs())
const currentDate = computed(() => now.value.locale('zh-cn').format('YYYY 年 MM 月 DD 日 dddd'))
const hours = computed(() => now.value.hour())
const minutes = computed(() => now.value.minute())
const seconds = computed(() => now.value.second())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  now.value = dayjs()
  timer = setInterval(() => {
    now.value = dayjs()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

const { weatherInfo } = useLocalWeather()

// 网站快捷导航列表（按页划分，支持手势滑动轮播）
const navPagesIn = ref<NavItem[][]>([
  [
    { title: '3D音乐', icon: 'ri:disc-line', url: '/Music' },
    { title: '实验室', icon: 'ri:ai', url: '/AiLaboratory' },
    { title: 'UI 合集', icon: 'ri:layout-grid-line', url: '/ui' },
    { title: '动画合集', icon: 'tdesign:animation-1', url: '/animation' },
    { title: '主题切换', icon: 'ri:contrast-2-line', url: '/ui/color-mode-button' },
    { title: '流星音潮', icon: 'ri:music-2-line', url: '/ui/meteor-soundwave' }
  ],
  [
    { title: '虚无 Hero', icon: 'ri:layout-column-line', url: '/ui/nihilistic-hero' },
    { title: '拍立得 UI', icon: 'ri:image-line', url: '/ui/polaroid' },
    { title: 'Shiro 导航', icon: 'ri:navigation-line', url: '/ui/shiro-nav' },
    { title: '图标形变', icon: 'ri:shape-line', url: '/animation/interactive-icon-morph' },
    { title: '梅花生长', icon: 'ri:plant-line', url: '/animation/plum-growth' },
    { title: '快门切片', icon: 'ri:camera-lens-line', url: '/animation/shutter-reveal' }
  ],
  [
    { title: '波浪揭示', icon: 'ri:water-flash-line', url: '/animation/wave-reveal' },
    { title: '主站首页', icon: 'ri:home-4-line', url: '/' }
  ]
])
const navPagesOut = ref<NavItem[][]>([
  [
    { title: '博客', icon: 'ri:quill-pen-line', url: 'https://sin6626.me' },
    { title: 'GitHub', icon: 'ri:github-fill', url: 'https://github.com/sin6626' },
    { title: '', icon: 'ri:twitter-x-fill', url: 'https://x.com/Sins6626' }
  ]
])

// 轮播状态与引用
const internalCarouselRef = ref<{ emblaApi?: any } | null>(null)
const currentNavPageIndex = ref(0)

function onPageSelect(index: number) {
  currentNavPageIndex.value = index
}

function goToPage(index: number) {
  internalCarouselRef.value?.emblaApi?.scrollTo(index)
}
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
          <span class="flex items-center text-3xl sm:text-4xl font-mono font-bold tracking-widest text-white my-1 tabular-nums">
            <NumberFlow :value="hours" :format="{ minimumIntegerDigits: 2 }" />
            <span>:</span>
            <NumberFlow :value="minutes" :format="{ minimumIntegerDigits: 2 }" />
            <span>:</span>
            <NumberFlow :value="seconds" :format="{ minimumIntegerDigits: 2 }" />
          </span>

          <!-- 天气概况 -->
          <div class="flex items-center gap-1.5 text-xs text-neutral-400">
            <UIcon :name="weatherInfo.icon" class="text-sm" />
            <span>当前位置 {{ weatherInfo.temp }} {{ weatherInfo.condition }}</span>
            <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" class="text-[10px] text-neutral-500 hover:text-neutral-300">Open-Meteo</a>
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
        <span>站外列表</span>
      </div>

      <!-- UCarousel 轮播容器（内置 Embla Carousel，全面支持手势与鼠标拖拽滑动） -->
      <UCarousel
        v-slot="{ item }"
        :items="navPagesOut"
        :ui="{
          root: 'w-full',
          viewport: 'overflow-hidden w-full',
          container: 'flex-row -ms-0',
          item: 'ps-0'
        }"
      >
        <!-- 每页最多 3 项，保持一行卡片布局 -->
        <div class="grid grid-cols-2 sm:grid-cols-6 gap-3 w-full">
          <NuxtLink
            v-for="nav in item"
            :key="nav.title"
            :to="nav.url"
            target="_blank"
            rel="noopener noreferrer"
            class="col-span-1 sm:col-span-2 bg-neutral-900/90 text-white rounded-2xl py-3.5 px-4 shadow-xl border border-neutral-700/50 backdrop-blur-md flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.03] hover:bg-neutral-800 hover:border-neutral-500/50 select-none group h-20"
          >
            <UIcon :name="nav.icon" class="text-lg text-neutral-300 group-hover:text-white transition-colors" />
            <span class="text-sm font-medium tracking-wide text-neutral-200 group-hover:text-white transition-colors">
              {{ nav.title }}
            </span>
          </NuxtLink>
        </div>
      </UCarousel>
      <!-- 区域标题 -->
      <div class="flex items-center gap-2 text-white font-medium text-sm">
        <UIcon name="ri:links-line" class="text-base text-white/80" />
        <span>站内列表</span>
      </div>
      <UCarousel
        ref="internalCarouselRef"
        v-slot="{ item }"
        :items="navPagesIn"
        :ui="{
          root: 'w-full',
          viewport: 'overflow-hidden w-full',
          container: 'flex-row -ms-0',
          item: 'ps-0'
        }"
        @select="onPageSelect"
      >
        <!-- 每页最多 3 项，通过轮播覆盖全部站内区域 -->
        <div class="grid grid-cols-2 sm:grid-cols-6 gap-3 w-full">
          <NuxtLink
            v-for="nav in item"
            :key="nav.title"
            :to="localePath(nav.url)"
            class="col-span-1 sm:col-span-2 bg-neutral-900/90 text-white rounded-2xl py-3.5 px-4 shadow-xl border border-neutral-700/50 backdrop-blur-md flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.03] hover:bg-neutral-800 hover:border-neutral-500/50 select-none group h-20"
            @click.capture="enterInternal($event, nav.url)"
          >
            <UIcon :name="nav.icon" class="text-lg text-neutral-300 group-hover:text-white transition-colors" />
            <span class="text-sm font-medium tracking-wide text-neutral-200 group-hover:text-white transition-colors">
              {{ nav.title }}
            </span>
          </NuxtLink>
        </div>
      </UCarousel>

      <!-- 底部轮播/分页指示器（与 UCarousel 状态联动，支持点击与手势跟随） -->
      <div class="flex items-center justify-center gap-1.5 mt-2">
        <button
          v-for="(_, index) in navPagesIn"
          :key="index"
          type="button"
          :class="[
            'h-1 rounded-full transition-all duration-300 cursor-pointer',
            currentNavPageIndex === index
              ? 'w-6 bg-white'
              : 'w-1.5 bg-white/40 hover:bg-white/70'
          ]"
          :aria-label="`切换至第 ${index + 1} 页导航`"
          @click="goToPage(index)"
        />
      </div>
    </div>
  </div>
</template>
