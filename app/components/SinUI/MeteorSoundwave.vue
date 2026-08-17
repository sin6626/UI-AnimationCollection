<script setup lang="ts">
import { useMeteorSoundwave } from './composables/useMeteorSoundwave'

const areaRef = ref<HTMLElement | null>(null)
const isPlaying = ref(false)
const hasAudio = ref(false)
const audioName = ref('')

const { setAudio, togglePlay, startVis, destroy } = useMeteorSoundwave({
  areaRef,
  isPlaying,
  hasAudio,
  audioName
})

let downX = 0
let downY = 0

function onPointerDown(event: PointerEvent) {
  downX = event.clientX
  downY = event.clientY
}

function onAreaClick(event: MouseEvent) {
  const moved = Math.hypot(event.clientX - downX, event.clientY - downY)
  // 如果位移超过 6px 视为拖拽旋转相机，不触发播放/暂停切换
  if (moved > 6) return
  togglePlay()
}

onMounted(() => {
  startVis()
})

onUnmounted(() => {
  destroy()
})
</script>

<template>
  <div class="relative w-full max-w-5xl mx-auto aspect-[16/10] md:aspect-[16/9] min-h-[480px] overflow-hidden rounded-3xl border border-white/10 bg-[#050810] shadow-2xl shadow-cyan-950/20 select-none">
    <!-- HUD 顶部状态栏 -->
    <header class="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-4 p-5 md:p-7">
      <div class="pointer-events-none flex flex-col">
        <p class="font-mono text-[11px] font-semibold tracking-[0.35em] text-[#8ef0de] uppercase">
          3D Audio Visualizer
        </p>
        <h2 class="mt-1 font-mono text-2xl md:text-3xl font-bold tracking-[0.12em] text-white">
          METEOR SOUNDWAVE
        </h2>
        <p v-if="audioName" class="mt-1 font-mono text-xs text-white/50 truncate max-w-xs md:max-w-sm">
          ♫ {{ audioName }}
        </p>
      </div>

      <div class="pointer-events-auto flex flex-col items-end gap-2.5">
        <div class="flex items-center gap-3">
          <!-- 播放状态标识 -->
          <div
            class="flex items-center gap-2 rounded-full border px-3.5 py-1.5 backdrop-blur-md transition-all duration-300"
            :class="[
              isPlaying
                ? 'border-[#8ef0de]/60 bg-[#8ef0de]/15 text-[#8ef0de]'
                : hasAudio
                  ? 'border-amber-400/50 bg-amber-400/10 text-amber-300'
                  : 'border-white/20 bg-white/5 text-white/60'
            ]"
          >
            <span
              class="size-2 rounded-full transition-colors"
              :class="[
                isPlaying
                  ? 'bg-[#8ef0de] animate-ping'
                  : hasAudio
                    ? 'bg-amber-400'
                    : 'bg-white/40'
              ]"
            />
            <span class="font-mono text-xs font-semibold tracking-[0.18em] uppercase">
              {{ isPlaying ? 'Playing' : (hasAudio ? 'Paused' : 'Standby') }}
            </span>
          </div>

          <!-- 上传 MP3 按钮 -->
          <label
            for="meteor-audio-input"
            class="group flex cursor-pointer items-center gap-2 rounded-xl border border-[#8ef0de]/40 bg-[#8ef0de]/10 px-4 py-2 backdrop-blur-md transition-all duration-200 hover:border-[#8ef0de] hover:bg-[#8ef0de]/25 hover:shadow-[0_0_20px_rgba(142,240,222,0.25)] active:scale-95"
          >
            <UIcon name="lucide:upload" class="size-4 text-[#8ef0de] transition-transform group-hover:-translate-y-0.5" />
            <span class="font-mono text-sm font-semibold tracking-[0.12em] text-[#8ef0de]">
              Load MP3
            </span>
          </label>
        </div>

        <input
          id="meteor-audio-input"
          type="file"
          accept=".mp3"
          class="hidden"
          @change="setAudio"
        >
      </div>
    </header>

    <!-- 底部操作提示 -->
    <div class="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
      <div class="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-center backdrop-blur-md">
        <p class="font-mono text-[11px] tracking-[0.15em] text-white/60 uppercase">
          {{ hasAudio ? 'Click: Play / Pause' : 'Upload MP3 & Click to Play' }} · Drag: Rotate · Scroll: Zoom · Tap Block: Ripple
        </p>
      </div>
    </div>

    <!-- Three.js 舞台画布挂载容器 -->
    <div
      ref="areaRef"
      class="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
      @pointerdown="onPointerDown"
      @click="onAreaClick"
    />
  </div>
</template>
