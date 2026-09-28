<script setup lang="ts">
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
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
const { locale, t } = useI18n()

// 与 /home、/ui、/animation 共用内容集合；新作品只需添加对应语言的内容条目。
const { data: internalContent } = await useAsyncData(`landing-internal-${locale.value}`, async () => {
  const [ui, animation] = await Promise.all([
    queryLocalizedContentList('ui', locale.value),
    queryLocalizedContentList('animation', locale.value)
  ])
  return { ui, animation }
}, { watch: [locale] })

const poems = computed(() => [1, 2, 3, 4].map(index => ({
  content: t(`landing.poems.${index}.content`),
  author: t(`landing.poems.${index}.author`)
})))

const currentPoemIndex = ref(0)
const currentPoem = computed(() => poems.value[currentPoemIndex.value] ?? poems.value[0]!)

function nextPoem() {
  currentPoemIndex.value = (currentPoemIndex.value + 1) % poems.value.length
}

// 实时时间计算（使用 ClientOnly 避免 SSR 水合不一致）
const now = ref(dayjs())
const currentDate = computed(() => now.value.locale(locale.value === 'en' ? 'en' : 'zh-cn').format(locale.value === 'en' ? 'dddd, MMMM D, YYYY' : 'YYYY 年 MM 月 DD 日 dddd'))
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
const weatherCondition = computed(() => {
  const conditions: Record<string, string> = {
    '获取位置中…': 'locating', '定位不可用': 'locationUnavailable',
    '天气加载中…': 'loading', '天气不可用': 'unavailable', '未授权定位': 'locationDenied',
    '晴朗': 'clear', '多云': 'partlyCloudy', '阴天': 'cloudy', '有雾': 'fog',
    '毛毛雨': 'drizzle', '有雨': 'rain', '有雪': 'snow', '阵雨': 'showers',
    '阵雪': 'snowShowers', '雷雨': 'thunderstorm'
  }
  return t(`landing.weather.${conditions[weatherInfo.value.condition] ?? 'unavailable'}`)
})

// 固定入口由路由决定；作品入口从内容集合生成，再按每页 6 项分组。
const navPagesIn = computed<NavItem[][]>(() => {
  const fixed: NavItem[] = [
    { title: t('landingLinks.music'), icon: 'ri:disc-line', url: '/Music' },
    { title: t('nav.laboratory'), icon: 'ri:ai', url: '/AiLaboratory' },
    { title: t('landingLinks.uiCollection'), icon: 'ri:layout-grid-line', url: '/ui' },
    { title: t('landingLinks.animationCollection'), icon: 'tdesign:animation-1', url: '/animation' },
    { title: t('landingLinks.mainHome'), icon: 'ri:home-4-line', url: '/home' }
  ]
  const entries: NavItem[] = [
    ...(internalContent.value?.ui ?? []).map(item => ({
      title: item.navTitle, icon: item.navIcon, url: item.path
    })),
    ...(internalContent.value?.animation ?? []).map(item => ({
      title: item.navTitle, icon: item.navIcon, url: item.path
    }))
  ]
  const items = [...fixed, ...entries]
  const pages: NavItem[][] = []
  for (let index = 0; index < items.length; index += 6) pages.push(items.slice(index, index + 6))
  return pages
})
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
        class="sm:col-span-3 bg-neutral-900/90 text-white rounded-2xl p-5 shadow-2xl border border-neutral-700/50 backdrop-blur-md flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-neutral-800/90 select-none group min-h-[160px]"
        :title="t('landing.nextPoem')"
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
          <span
            :data-door-time="now.format('HH:mm:ss')"
            class="flex items-center text-3xl sm:text-4xl font-mono font-bold tracking-widest text-white my-1 tabular-nums"
          >
            <NumberFlow :value="hours" :format="{ minimumIntegerDigits: 2 }" />
            <span>:</span>
            <NumberFlow :value="minutes" :format="{ minimumIntegerDigits: 2 }" />
            <span>:</span>
            <NumberFlow :value="seconds" :format="{ minimumIntegerDigits: 2 }" />
          </span>

          <!-- 天气概况 -->
          <div class="flex items-center gap-1.5 text-xs text-neutral-400">
            <UIcon :name="weatherInfo.icon" class="text-sm" />
            <span>{{ t('landing.currentLocation') }} {{ weatherInfo.temp }} {{ weatherCondition }}</span>
            <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" class="text-[10px] text-neutral-500 hover:text-neutral-300">Open-Meteo</a>
          </div>
        </div>

        <template #fallback>
          <div class="sm:col-span-3 bg-neutral-900/90 text-white rounded-2xl p-5 shadow-2xl border border-neutral-700/50 backdrop-blur-md flex flex-col items-center justify-center min-h-[140px]">
            <span class="text-neutral-500 text-xs">{{ t('landing.loadingTime') }}</span>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- 下半部分：网站列表快捷导航 -->
    <div class="flex flex-col gap-3">
      <!-- 区域标题 -->
      <div class="flex items-center gap-2 text-white font-medium text-sm">
        <UIcon name="ri:links-line" class="text-base text-white/80" />
        <span>{{ t('landing.externalLinks') }}</span>
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
        <span>{{ t('landing.internalLinks') }}</span>
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
          <!-- 这里的NuxtLink为了开屏动画必须要使用@click.capture，让点击时间直接在捕获阶段直接被拦截，并且取消默认的跳转 -->
           <!-- 如果是普通的@click会在冒泡阶段被拦截，但是NuxtLink可能已经跳转了，属于很细节的的防御性编程，做动画讲究这一点差别 -->
          <NuxtLink
            v-for="nav in item"
            :key="nav.url"
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
          :aria-label="t('landing.navigationPage', { page: index + 1 })"
          @click="goToPage(index)"
        />
      </div>
    </div>
  </div>
</template>
