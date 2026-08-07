<script setup lang="ts">
import { Motion } from 'motion-v'

const isPlaying = ref(false)
const currentIndex = ref(0)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
const volume = ref(68)
const isRepeat = ref(false)

const isExpand = ref(false)
const openExpand = () => {
  isExpand.value = !isExpand.value
}

const audio = ref<HTMLAudioElement | null>(null)

type MusicItem = {
  title: string
  name: string
  src: string
  avatar: string
  order: number
}

const { data: musicItems } = await useAsyncData('sidebar-music', () => {
  const queryMusicCollection = queryCollection as unknown as (collection: 'music') => {
    all: () => Promise<MusicItem[]>
  }

  return queryMusicCollection('music').all()
})

const songs = computed(() => [...(musicItems.value ?? [])].sort((a, b) => a.order - b.order))

const currentSong = computed(() => songs.value[currentIndex.value])
const currentLabel = computed(() => currentSong.value?.title ?? '暂无歌曲')
const artistLabel = computed(() => currentSong.value?.name ?? '请在 public/music 中添加歌曲')

function formatTime(value: number) {
  if (!Number.isFinite(value)) return '0:00'

  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

async function playCurrent() {
  if (!audio.value || !currentSong.value) return

  await audio.value.play()
  isPlaying.value = true
}

async function togglePlay() {
  if (!audio.value || !currentSong.value) return

  if (isPlaying.value) {
    audio.value.pause()
    isPlaying.value = false
    return
  }

  await playCurrent()
}

async function selectSong(index: number) {
  currentIndex.value = index
  await nextTick()
  audio.value?.load()

  if (isPlaying.value) await playCurrent()
}

async function playPrevious() {
  if (!songs.value.length) return

  const nextIndex = (currentIndex.value - 1 + songs.value.length) % songs.value.length
  await selectSong(nextIndex)
}

async function playNext() {
  if (!songs.value.length) return

  const nextIndex = (currentIndex.value + 1) % songs.value.length
  await selectSong(nextIndex)
}

async function handleEnded() {
  if (isRepeat.value) {
    if (audio.value) audio.value.currentTime = 0
    await playCurrent()
    return
  }

  await playNext()
}

function updateTime() {
  if (!audio.value) return

  currentTime.value = audio.value.currentTime
  duration.value = audio.value.duration || 0
  progress.value = duration.value ? (currentTime.value / duration.value) * 100 : 0
}

function sliderValue(value: number | number[] | undefined, fallback = 0) {
  return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback
}

function seek(value: number | number[] | undefined) {
  if (!audio.value || !duration.value) return

  audio.value.currentTime = (sliderValue(value, progress.value) / 100) * duration.value
  updateTime()
}

function changeVolume(value: number | number[] | undefined) {
  if (!audio.value) return

  const nextValue = sliderValue(value, volume.value)
  volume.value = nextValue
  audio.value.volume = nextValue / 100
}

onMounted(() => {
  if (audio.value) audio.value.volume = volume.value / 100
})
</script>

<template>
  <section
    class="w-[280px] max-w-full rounded-[16px] border border-default dark:bg-jet-blue light:bg-white text-default shadow-2xl light:shadow-black/30 dark:shadow-white/10">

    <div class="p-3">
      <audio
        ref="audio"
        :src="currentSong?.src"
        @loadedmetadata="updateTime"
        @timeupdate="updateTime"
        @ended="handleEnded"
      />
      <div class="flex items-center gap-2">
        <NuxtImg
          :src="currentSong?.avatar ?? '/Sin.jpg'"
          :alt="currentSong?.title ?? ''"
          class="size-10 shrink-0 rounded-full border border-default object-cover shadow-lg dark:shadow-amber-50/40 light:shadow-black/40 animate-[spin_18s_linear_infinite] motion-reduce:animate-none"
          :style="{ animationPlayState: isPlaying ? 'running' : 'paused' }"
        />

        <div class="min-w-0 flex-1">
          <h3 class="truncate text-base font-black leading-5 tracking-tight text-default/90">
            {{ currentLabel }}
          </h3>
          <p class="truncate text-xs leading-4 text-default/75">
            {{ artistLabel }}
          </p>
        </div>

        <UTooltip text="歌词-还没做">
          <UButton icon="i-lucide-captions" variant="ghost" color="neutral" size="xs"
            class="text-default/55 hover:bg-inverted/10 hover:text-default" aria-label="Lyrics" />
        </UTooltip>
      </div>

      <div class="mt-3 flex items-center gap-2">
        <UIcon name="i-lucide-volume-2" class="size-4 shrink-0 text-default/75" />
        <USlider
          :model-value="volume"
          class="min-w-0 flex-1"
          size="xs"
          color="neutral"
          @update:model-value="changeVolume"
        />
      </div>

      <div class="mt-3 flex items-center gap-2 font-mono text-xs text-default/72">
        <span>{{ formatTime(currentTime) }}</span>
        <USlider
          :model-value="progress"
          class="flex-1"
          size="xs"
          @update:model-value="seek"
        />
        <span>{{ formatTime(duration) }}</span>
      </div>

      <div class="mt-3 grid grid-cols-3 place-items-center gap-1 text-default/78">
        <UTooltip :text="isRepeat ? '关闭循环' : '循环播放'">
          <UButton icon="i-lucide-repeat-2" variant="ghost" color="neutral" size="xs"
            :class="isRepeat
              ? 'text-default bg-inverted/10 shadow-sm shadow-primary/20'
              : 'text-default/55 hover:bg-inverted/10 hover:text-default'"
            aria-label="Repeat"
            :aria-pressed="isRepeat"
            @click="isRepeat = !isRepeat"
          />
        </UTooltip>
        <UTooltip text="上一首">
          <UButton icon="i-lucide-skip-back" variant="ghost" color="neutral" size="xs" :disabled="songs.length === 0"
            class="text-default/85 hover:bg-inverted/10 hover:text-default" aria-label="Previous" @click="playPrevious" />
        </UTooltip>
        <UTooltip :text="isPlaying ? '暂停' : '播放'">
          <UButton @click="togglePlay" :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'" variant="ghost"
            color="neutral" size="sm" class="text-default hover:bg-inverted/10" aria-label="Play" :disabled="songs.length === 0" />
        </UTooltip>
        <UTooltip text="下一首">
          <UButton icon="i-lucide-skip-forward" variant="ghost" color="neutral" size="xs" :disabled="songs.length === 0"
            class="text-default/85 hover:bg-inverted/10 hover:text-default" aria-label="Next" @click="playNext" />
        </UTooltip>
        <UTooltip text="播放列表">
          <UButton @click="openExpand" icon="i-lucide-list-music" variant="ghost" color="neutral" size="xs"
            class="text-default/55 hover:bg-inverted/10 hover:text-default" aria-label="Playlist" />
        </UTooltip>
        <UTooltip text="可视化-还没做">
          <UButton icon="i-lucide-audio-lines" variant="ghost" color="neutral" size="xs"
            class="text-default/55 hover:bg-inverted/10 hover:text-default" aria-label="Audio visualization" />
        </UTooltip>
      </div>
    </div>

    <Motion
      tag="div"
      :initial="{ height: 0, opacity: 0 }"
      :animate="{ height: isExpand ? 'auto' : 0, opacity: isExpand ? 1 : 0 }"
      :transition="{ type: 'spring', stiffness: 260, damping: 30 }"
      :aria-hidden="!isExpand"
      :class="[
        'overflow-hidden text-default dark:bg-jet-blue light:bg-white',
        isExpand ? 'pointer-events-auto' : 'h-0 opacity-0 pointer-events-none'
      ]"
    >
      <LazyUPageList class="max-h-[50vh] overflow-auto">
        <UPageCard v-for="(song, index) in songs" :key="song.src" variant="ghost"
          :class="index === currentIndex ? 'bg-inverted/10' : 'dark:hover:bg-inverted/10 light:hover:bg-blue-50'" class="mt-1"
          @click="selectSong(index)">
          <template #body>
            <UUser class="relative min-w-0" :name="song.title" :description="song.name" :avatar="{ src: song.avatar, alt: song.title, loading: 'lazy' }" size="md" />
          </template>
        </UPageCard>
        <p v-if="songs.length === 0" class="px-7 py-6 text-sm text-muted">
          public/music 里还没有可播放的音频。
        </p>
      </LazyUPageList>
    </Motion>

  </section>
</template>
