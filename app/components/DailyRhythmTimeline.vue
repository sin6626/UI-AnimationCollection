<script setup lang="ts">
type RhythmKey = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night'

type RhythmMeta = {
  key: RhythmKey
  time: string
  startHour: number
  endHour: number
}

const rhythmConfig: RhythmMeta[] = [
  { key: 'dawn', time: '05:00 - 08:00', startHour: 5, endHour: 8 },
  { key: 'morning', time: '08:00 - 12:00', startHour: 8, endHour: 12 },
  { key: 'noon', time: '12:00 - 14:00', startHour: 12, endHour: 14 },
  { key: 'afternoon', time: '14:00 - 18:00', startHour: 14, endHour: 18 },
  { key: 'evening', time: '18:00 - 22:00', startHour: 18, endHour: 22 },
  { key: 'night', time: '22:00 - 05:00', startHour: 22, endHour: 5 }
]

const { t } = useI18n()

// 实时时间状态与计算
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

const hours = computed(() => now.value.getHours())

// 判断当前激活的时段索引 (0 ~ 5)
const currentActiveIndex = computed(() => {
  const h = hours.value
  // 清晨 05:00 - 07:59
  if (h >= 5 && h < 8) return 0
  // 上午 08:00 - 11:59
  if (h >= 8 && h < 12) return 1
  // 午休 12:00 - 13:59
  if (h >= 12 && h < 14) return 2
  // 下午 14:00 - 17:59
  if (h >= 14 && h < 18) return 3
  // 晚上 18:00 - 21:59
  if (h >= 18 && h < 22) return 4
  // 深夜 22:00 - 次日 04:59
  return 5
})
</script>

<template>
  <div class="flex flex-col select-none py-1">
    <div
      v-for="(item, index) in rhythmConfig"
      :key="item.key"
      class="group relative flex gap-3.5"
    >
      <!-- 左侧时间轴 (微型索引方框 + 贯穿连接线) -->
      <div class="relative flex flex-col items-center">
        <!-- 顶部引线 (第一项顶部短线) -->
        <div
          v-if="index === 0"
          class="w-px h-2 -mt-2 transition-colors duration-300"
          :class="currentActiveIndex >= 0 ? 'bg-primary' : 'bg-border/40'"
        />

        <!-- Innei 风格数字索引方框 (仅当前时段变色高亮，走过的时段保持低调不抢戏) -->
        <div
          class="z-10 flex items-center justify-center font-mono text-[10px] px-1.5 py-0.5 rounded-[3px] border transition-all duration-300 shadow-xs"
          :class="[
            index === currentActiveIndex
              ? 'border-primary text-primary bg-primary/10 ring-2 ring-primary/20 font-bold scale-105 shadow-primary/20'
              : 'border-border/60 text-muted/70 bg-muted/10'
          ]"
        >
          {{ String(index + 1).padStart(2, '0') }}
        </div>

        <!-- 向下延伸的连接竖线 (走过的历程全量点亮高亮色，未走过的保持暗灰) -->
        <div
          v-if="index !== rhythmConfig.length - 1"
          class="w-px flex-1 my-1 transition-colors duration-500"
          :class="[
            index < currentActiveIndex
              ? 'bg-primary shadow-[0_0_6px_var(--ui-primary)]'
              : 'bg-border/30'
          ]"
        />
      </div>

      <!-- 右侧内容排版 (仅当前时段焦点放大高亮) -->
      <div
        class="flex flex-col flex-1 transition-all duration-300"
        :class="[
          index !== rhythmConfig.length - 1 ? 'pb-4 sm:pb-5' : 'pb-1',
          index === currentActiveIndex ? 'pt-0' : 'pt-0.5'
        ]"
      >
        <!-- Meta 行: 时间区间与进行中微标 -->
        <div class="flex items-center gap-2">
          <span
            class="font-mono text-[11px] tracking-tight transition-colors duration-300"
            :class="index === currentActiveIndex ? 'text-primary font-medium' : 'text-muted/60'"
          >
            {{ item.time }}
          </span>

          <UBadge
            v-if="index === currentActiveIndex"
            color="primary"
            variant="subtle"
            size="xs"
            class="text-[9px] px-1 py-0 rounded-xs font-mono animate-pulse"
          >
            NOW
          </UBadge>
        </div>

        <!-- 标题行: 仅当前项焦点放大加粗 -->
        <div
          class="mt-1 transition-all duration-300"
          :class="index === currentActiveIndex ? 'mt-1.5' : 'mt-0.5'"
        >
          <div class="flex items-baseline gap-1.5">
            <span
              class="tracking-tight transition-colors duration-300"
              :class="[
                index === currentActiveIndex
                  ? 'text-sm font-bold text-highlighted'
                  : 'text-xs font-medium text-muted-foreground'
              ]"
            >
              {{ t(`rhythm.${item.key}.title`) }}
            </span>

            <span
              class="text-[11px] transition-colors duration-300"
              :class="[
                index === currentActiveIndex
                  ? 'text-primary font-medium'
                  : 'text-muted/50'
              ]"
            >
              · {{ t(`rhythm.${item.key}.tag`) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
