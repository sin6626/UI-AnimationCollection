<script setup lang="ts">
import NumberFlow from '@number-flow/vue'

const { t } = useI18n()

// 实时时间状态与定时器
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  now.value = new Date()
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

// 顶部自然日与自然年统计计算
const hours = computed(() => now.value.getHours())
const minutes = computed(() => now.value.getMinutes())
const seconds = computed(() => now.value.getSeconds())

const hourStr = computed(() => hours.value.toString().padStart(2, '0'))
const minStr = computed(() => minutes.value.toString().padStart(2, '0'))
const secStr = computed(() => seconds.value.toString().padStart(2, '0'))

// 判断闰年
const isLeapYear = computed(() => {
  const y = now.value.getFullYear()
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
})
const totalDaysInYear = computed(() => isLeapYear.value ? 366 : 365)

// 当年第几天
const dayOfYear = computed(() => {
  const start = new Date(now.value.getFullYear(), 0, 1)
  const diff = now.value.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
})

// 年度进度（整数百分比）
const yearProgress = computed(() => {
  return Math.floor((dayOfYear.value / totalDaysInYear.value) * 100)
})

// 今日秒数与今日进度（保留2位小数）
const secondsToday = computed(() => {
  return hours.value * 3600 + minutes.value * 60 + seconds.value
})

const todayProgress = computed(() => {
  const ratio = (secondsToday.value / 86400) * 100
  return Number(ratio.toFixed(2))
})
</script>

<template>
  <aside class="w-full flex flex-col gap-5 select-none py-1">
    <!-- 顶部时间仪表盘（极简无边框） -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between border-b border-default pb-3">
        <!-- 实时滚动时钟 -->
        <ClientOnly>
          <div class="flex items-baseline gap-0.5 font-mono text-2xl font-bold tracking-tight text-highlighted">
            <NumberFlow
              :value="hours"
              :format="{ minimumIntegerDigits: 2 }"
            />
            <span class="animate-pulse text-primary font-bold">:</span>
            <NumberFlow
              :value="minutes"
              :format="{ minimumIntegerDigits: 2 }"
            />
            <span class="animate-pulse text-primary font-bold">:</span>
            <NumberFlow
              :value="seconds"
              :format="{ minimumIntegerDigits: 2 }"
              class="text-lg text-muted"
            />
          </div>

          <template #fallback>
            <div class="font-mono text-2xl font-bold tracking-tight text-highlighted">
              {{ hourStr }}:{{ minStr }}:<span class="text-lg text-muted">{{ secStr }}</span>
            </div>
          </template>
        </ClientOnly>

        <!-- 当年天数徽章 -->
        <span class="font-mono">
          {{ t('dashboard.dayOfYear', { day: dayOfYear }) }}
        </span>
      </div>

      <!-- 进度指标网格 -->
      <div class="grid grid-cols-2 gap-4 pt-1">
        <!-- 今日进度 -->
        <div class="flex flex-col gap-1.5">
          <span class="text-xs text-muted">{{ t('dashboard.todayProgress') }}</span>
          <div class="flex items-baseline font-mono text-lg font-semibold text-highlighted">
            <ClientOnly>
              <NumberFlow
                :value="todayProgress"
                :format="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
              />
              <template #fallback>
                <span>{{ todayProgress.toFixed(2) }}</span>
              </template>
            </ClientOnly>
            <span class="text-xs text-muted ml-0.5">%</span>
          </div>
          <UProgress
            :model-value="todayProgress"
            color="primary"
            size="xs"
          />
        </div>

        <!-- 年度进度 -->
        <div class="flex flex-col gap-1.5">
          <span class="text-xs text-muted">{{ t('dashboard.yearProgress') }}</span>
          <div class="flex items-baseline font-mono text-lg font-semibold text-highlighted">
            <ClientOnly>
              <NumberFlow :value="yearProgress" />
              <template #fallback>
                <span>{{ yearProgress }}</span>
              </template>
            </ClientOnly>
            <span class="text-xs text-muted ml-0.5">%</span>
          </div>
          <UProgress
            :model-value="yearProgress"
            color="neutral"
            size="xs"
          />
        </div>
      </div>
    </div>

    <!-- 下方作息时间流 (独立封装的 Innei 风格时间轴 x todo: 等完全炼化之后再来重写) -->
    <div class="pt-1">
      <DailyRhythmTimeline />
    </div>
  </aside>
</template>
