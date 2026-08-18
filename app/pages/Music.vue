<script setup lang="ts">
import { LyricPlayer } from '@applemusic-like-lyrics/vue'
import { parseLrc } from '@applemusic-like-lyrics/lyric'
import '@applemusic-like-lyrics/core/style.css'
import { useMeteorSoundwave } from '~/components/SinUI/composables/useMeteorSoundwave'

definePageMeta({
  layout: false
})

type MusicItem = {
  title: string
  name: string
  src: string
  avatar: string
  lrc: string
  order: number
}

type LyricLineClickEvent = {
  lineIndex?: number
  line?: {
    startTime?: number
    getLine?: () => { startTime?: number }
  }
}

type LyricPlayerController = {
  resetScroll: () => void
  setCurrentTime: (time: number, isSeek: boolean) => void
  calcLayout: (force: boolean, reflow: boolean) => void
}

const areaRef = ref<HTMLElement | null>(null)
const lyricPlayerRef = ref<InstanceType<typeof LyricPlayer> | null>(null)
const isPlaying = ref(false)
const hasAudio = ref(false)
const audioName = ref('')
const currentTrackIndex = ref(0)
const playlistOpen = ref(false)
const lyricsVisible = ref(true)
const isRepeat = ref(false)
const lyricsLines = shallowRef<ReturnType<typeof parseLrc>>([])

const { data: musicItems } = await useAsyncData('music-stage-playlist', () => {
  const queryMusicCollection = queryCollection as unknown as (collection: 'music') => {
    all: () => Promise<MusicItem[]>
  }

  return queryMusicCollection('music').all()
})

const playlist = computed(() => [...(musicItems.value ?? [])].sort((a, b) => a.order - b.order))
const currentTrack = computed(() => playlist.value[currentTrackIndex.value])

const {
  currentTime,
  duration,
  volume,
  isMuted,
  loadTrack,
  play,
  togglePlay,
  seek,
  setVolume,
  toggleMute,
  onEnded,
  startVis,
  destroy
} = useMeteorSoundwave({
  areaRef,
  isPlaying,
  hasAudio,
  audioName,
  loop: false
})

const currentTimeMs = computed(() => Math.floor(currentTime.value * 1000))
const progress = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)

let lyricsRequestId = 0
let downX = 0
let downY = 0

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

async function fetchCurrentLyrics() {
  const requestId = ++lyricsRequestId
  const track = currentTrack.value
  if (!track?.lrc) {
    lyricsLines.value = []
    return
  }

  try {
    const response = await fetch(track.lrc)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const text = await response.text()
    if (requestId === lyricsRequestId) lyricsLines.value = parseLrc(text)
  } catch (error) {
    if (requestId === lyricsRequestId) lyricsLines.value = []
    console.warn('歌词加载失败:', error)
  }
}

function switchTrack(index: number, autoPlay = true) {
  const track = playlist.value[index]
  if (!track) return

  currentTrackIndex.value = index
  audioName.value = `${track.name} - ${track.title}`
  void fetchCurrentLyrics()
  loadTrack(track.src, audioName.value, autoPlay)
}

function playPrevious() {
  if (!playlist.value.length) return
  const index = (currentTrackIndex.value - 1 + playlist.value.length) % playlist.value.length
  switchTrack(index)
}

function playNext() {
  if (!playlist.value.length) return
  const index = (currentTrackIndex.value + 1) % playlist.value.length
  switchTrack(index)
}

function handleEnded() {
  if (isRepeat.value) {
    seek(0)
    play()
    return
  }

  playNext()
}

function onProgressInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (!duration.value) return
  seek((Number(target.value) / 100) * duration.value)
}

function onVolumeInput(event: Event) {
  const target = event.target as HTMLInputElement
  setVolume(Number(target.value) / 100)
}

function onPointerDown(event: PointerEvent) {
  downX = event.clientX
  downY = event.clientY
}

function onAreaClick(event: MouseEvent) {
  const moved = Math.hypot(event.clientX - downX, event.clientY - downY)
  if (moved <= 6) togglePlay()
}

function onLyricLineClick(event: LyricLineClickEvent) {
  let startTime: number | undefined

  if (typeof event.lineIndex === 'number') {
    startTime = lyricsLines.value[event.lineIndex]?.startTime
  }
  if (!Number.isFinite(startTime) && typeof event.line?.getLine === 'function') {
    startTime = event.line.getLine()?.startTime
  }
  if (!Number.isFinite(startTime)) startTime = event.line?.startTime

  if (!Number.isFinite(startTime)) return
  seek((startTime as number) / 1000)

  const exposedPlayer = lyricPlayerRef.value?.lyricPlayer
  const player = (exposedPlayer && 'value' in exposedPlayer
    ? exposedPlayer.value
    : exposedPlayer) as LyricPlayerController | undefined
  player?.resetScroll()
  player?.setCurrentTime(startTime as number, true)
  player?.calcLayout(true, true)
}

onMounted(() => {
  startVis()
  if (playlist.value.length) switchTrack(0, false)
  onEnded(handleEnded)
})

onUnmounted(() => {
  destroy()
})
</script>

<template>
  <main class="music-stage fixed inset-0 overflow-hidden bg-[#050810] text-white select-none">
    <div
      ref="areaRef"
      class="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
      @pointerdown="onPointerDown"
      @click="onAreaClick"
    />

    <header class="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-8 pt-7">
      <div>
        <div class="flex items-center gap-3">
          <p class="font-mono text-[12px] tracking-[0.5em] text-[#8ef0de] uppercase">
            3D Audio
          </p>
          <span class="border border-[#8ef0de]/30 bg-[#8ef0de]/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-[#8ef0de]">
            Meteor Tide
          </span>
        </div>
        <h1 class="mt-1.5 text-[40px] leading-none font-black tracking-[0.1em]">
          MUSIC
        </h1>
      </div>

      <div class="flex items-center gap-3">
        <div
          v-if="isPlaying"
          class="flex items-center gap-2.5 border border-[#8ef0de]/40 bg-black/60 px-4 py-2.5 backdrop-blur-md"
        >
          <span class="playing-dot size-2 rounded-full bg-[#8ef0de]" />
          <span class="text-[12px] font-semibold tracking-[0.25em] text-[#8ef0de] uppercase">Playing</span>
        </div>
        <button
          class="pointer-events-auto border px-4 py-2.5 text-[12px] font-bold tracking-[0.18em] uppercase backdrop-blur-md transition-colors"
          :class="lyricsVisible ? 'border-[#8ef0de]/60 bg-[#8ef0de]/15 text-[#8ef0de]' : 'border-white/20 bg-white/5 text-white/60'"
          @click="lyricsVisible = !lyricsVisible"
        >
          Lyrics
        </button>
      </div>
    </header>

    <section
      v-show="lyricsVisible"
      class="pointer-events-none absolute top-28 bottom-32 left-12 z-10 flex w-[480px] flex-col justify-center"
    >
      <div class="amll-glass-wrapper pointer-events-auto h-[480px] w-full overflow-hidden">
        <LyricPlayer
          v-if="lyricsLines.length"
          ref="lyricPlayerRef"
          :lyric-lines="lyricsLines"
          :current-time="currentTimeMs"
          :playing="isPlaying"
          :enable-spring="true"
          :enable-blur="true"
          :enable-scale="true"
          :word-fade-width="0.5"
          align-anchor="center"
          :align-position="0.5"
          class="size-full"
          @line-click="onLyricLineClick"
        />
        <div
          v-else
          class="flex size-full items-center pl-4 font-mono text-sm tracking-widest text-white/30 uppercase"
        >
          [ Instrumental / No Lyrics ]
        </div>
      </div>
    </section>

    <section
      class="absolute inset-x-6 bottom-5 z-20 grid h-[86px] grid-cols-[minmax(220px,1fr)_minmax(420px,1.7fr)_minmax(220px,1fr)] items-center gap-7 rounded-2xl border border-white/12 bg-[#070a12]/88 px-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      @click.stop
    >
      <div class="flex min-w-0 items-center gap-3.5">
        <NuxtImg
          :src="currentTrack?.avatar ?? '/Sin.jpg'"
          :alt="currentTrack?.title ?? ''"
          class="size-14 shrink-0 rounded-xl border border-white/15 object-cover shadow-lg"
        />
        <div class="min-w-0">
          <h2 class="truncate text-[15px] font-bold tracking-wide">
            {{ currentTrack?.title ?? '暂无歌曲' }}
          </h2>
          <p class="mt-1 truncate font-mono text-[11px] text-white/45">
            {{ currentTrack?.name ?? 'Music Stage' }}
          </p>
        </div>
      </div>

      <div class="flex min-w-0 flex-col items-center gap-2">
        <div class="flex items-center gap-5">
          <button
            class="control-button"
            title="循环播放"
            :class="{ active: isRepeat }"
            @click="isRepeat = !isRepeat"
          >
            <UIcon
              name="i-lucide-repeat-2"
              class="size-4"
            />
          </button>
          <button
            class="control-button"
            title="上一首"
            @click="playPrevious"
          >
            <UIcon
              name="i-lucide-skip-back"
              class="size-5"
            />
          </button>
          <button
            class="play-button"
            :title="isPlaying ? '暂停' : '播放'"
            @click="togglePlay"
          >
            <UIcon
              :name="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
              class="size-5"
            />
          </button>
          <button
            class="control-button"
            title="下一首"
            @click="playNext"
          >
            <UIcon
              name="i-lucide-skip-forward"
              class="size-5"
            />
          </button>
          <button
            class="control-button"
            title="播放列表"
            :class="{ active: playlistOpen }"
            @click="playlistOpen = !playlistOpen"
          >
            <UIcon
              name="i-lucide-list-music"
              class="size-5"
            />
          </button>
        </div>

        <div class="flex w-full items-center gap-3">
          <span class="w-10 text-right font-mono text-[10px] text-white/45">{{ formatTime(currentTime) }}</span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.05"
            :value="progress"
            class="stage-range flex-1"
            aria-label="播放进度"
            @input="onProgressInput"
          >
          <span class="w-10 font-mono text-[10px] text-white/45">{{ formatTime(duration) }}</span>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3">
        <button
          class="control-button"
          :title="isMuted ? '取消静音' : '静音'"
          @click="toggleMute"
        >
          <UIcon
            :name="isMuted || volume === 0 ? 'i-lucide-volume-x' : 'i-lucide-volume-2'"
            class="size-5"
          />
        </button>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="isMuted ? 0 : volume * 100"
          class="stage-range w-24"
          aria-label="音量"
          @input="onVolumeInput"
        >
      </div>
    </section>

    <Transition name="playlist-drawer">
      <aside
        v-if="playlistOpen"
        class="absolute top-0 right-0 bottom-[112px] z-30 flex w-[390px] flex-col border-l border-white/10 bg-[#05070d]/92 p-6 shadow-2xl backdrop-blur-2xl"
        @click.stop
      >
        <div class="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p class="text-lg font-black tracking-[0.14em]">
              播放列表
            </p>
            <p class="mt-1 font-mono text-[10px] tracking-widest text-[#8ef0de] uppercase">
              {{ playlist.length }} tracks
            </p>
          </div>
          <button
            class="control-button"
            title="关闭歌单"
            @click="playlistOpen = false"
          >
            <UIcon
              name="i-lucide-x"
              class="size-5"
            />
          </button>
        </div>

        <div class="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          <button
            v-for="(track, index) in playlist"
            :key="track.src"
            class="group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all"
            :class="index === currentTrackIndex ? 'border-[#8ef0de]/45 bg-[#8ef0de]/10' : 'border-white/6 bg-white/4 hover:border-white/18 hover:bg-white/8'"
            @click="switchTrack(index)"
          >
            <span
              class="w-5 shrink-0 text-center font-mono text-[11px]"
              :class="index === currentTrackIndex ? 'text-[#8ef0de]' : 'text-white/30'"
            >
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <NuxtImg
              :src="track.avatar"
              :alt="track.title"
              class="size-11 shrink-0 rounded-lg object-cover"
            />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-semibold">{{ track.title }}</span>
              <span class="mt-1 block truncate font-mono text-[10px] text-white/40">{{ track.name }}</span>
            </span>
            <UIcon
              v-if="index === currentTrackIndex"
              :name="isPlaying ? 'i-lucide-audio-lines' : 'i-lucide-pause'"
              class="size-4 shrink-0 text-[#8ef0de]"
            />
          </button>
        </div>
      </aside>
    </Transition>
  </main>
</template>

<style scoped>
.music-stage {
  min-width: 1024px;
  font-family: 'Instrument Sans', sans-serif;
}

.playing-dot {
  box-shadow: 0 0 0 0 rgba(142, 240, 222, 0.65);
  animation: playing-pulse 1.6s infinite;
}

.control-button,
.play-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.62);
  transition: color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.control-button {
  width: 32px;
  height: 32px;
  border-radius: 9px;
}

.control-button:hover,
.control-button.active {
  color: #8ef0de;
  background: rgba(142, 240, 222, 0.1);
}

.play-button {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  color: #07100f;
  background: #8ef0de;
  box-shadow: 0 0 22px rgba(142, 240, 222, 0.34);
}

.control-button:active,
.play-button:active {
  transform: scale(0.92);
}

.stage-range {
  height: 4px;
  cursor: pointer;
  appearance: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  accent-color: #8ef0de;
}

.stage-range::-webkit-slider-thumb {
  width: 12px;
  height: 12px;
  appearance: none;
  border-radius: 999px;
  background: #8ef0de;
  box-shadow: 0 0 10px rgba(142, 240, 222, 0.55);
}

.amll-glass-wrapper :deep(.amll-lyric-player) {
  --amll-lp-font-size: max(max(2.5vh, 1.25vw), 12px);
  --amll-lyric-text-color: rgba(255, 255, 255, 0.45);
  --amll-lyric-active-text-color: #8ef0de;
  --amll-lyric-active-gradient-color: #44ddff;
  --amll-lyric-blur: 3px;
  background: transparent !important;
}

.amll-glass-wrapper :deep([class*='_lyricLineWrapper']:not([class*='_bottomLine'])) {
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 180ms ease, box-shadow 180ms ease;
}

.amll-glass-wrapper :deep([class*='_lyricLineWrapper']:not([class*='_bottomLine']):hover) {
  opacity: 1 !important;
  filter: none !important;
  background: rgba(142, 240, 222, 0.14) !important;
  box-shadow: inset 3px 0 0 rgba(142, 240, 222, 0.85);
}

.playlist-drawer-enter-active,
.playlist-drawer-leave-active {
  transition: transform 260ms ease, opacity 260ms ease;
}

.playlist-drawer-enter-from,
.playlist-drawer-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@keyframes playing-pulse {
  70% { box-shadow: 0 0 0 8px rgba(142, 240, 222, 0); }
  100% { box-shadow: 0 0 0 0 rgba(142, 240, 222, 0); }
}
</style>
