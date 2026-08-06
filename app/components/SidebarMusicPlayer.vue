<script setup lang="ts">

const isPlaying = ref(false)
const progress = 18
const volume = 68

const isExpand = ref(false)
const openExpand = () => {
  isExpand.value = !isExpand.value
}

const songs = ref([
  {
    title: '十年',
    name: '陈奕迅',
    avatar: {
      src: '/Devil.png',
      alt: '十年',
      loading: 'lazy' as const
    }
  },
  {
    title: '十年',
    name: '陈奕迅',
    avatar: {
      src: '/Devil.png',
      alt: '十年',
      loading: 'lazy' as const
    }
  },
  {
    title: '十年',
    name: '陈奕迅',
    avatar: {
      src: '/Devil.png',
      alt: '十年',
      loading: 'lazy' as const
    }
  },
  {
    title: '十年',
    name: '陈奕迅',
    avatar: {
      src: '/Devil.png',
      alt: '十年',
      loading: 'lazy' as const
    }
  },
  {
    title: '十年',
    name: '陈奕迅',
    avatar: {
      src: '/Devil.png',
      alt: '十年',
      loading: 'lazy' as const
    }
  },
  {
    title: '十年',
    name: '陈奕迅',
    avatar: {
      src: '/Devil.png',
      alt: '十年',
      loading: 'lazy' as const
    }
  },
  {
    title: '十年',
    name: '陈奕迅',
    avatar: {
      src: '/Devil.png',
      alt: '十年',
      loading: 'lazy' as const
    }
  },
  {
    title: '十年',
    name: '陈奕迅',
    avatar: {
      src: '/Devil.png',
      alt: '十年',
      loading: 'lazy' as const
    }
  },
  {
    title: '十年',
    name: '陈奕迅',
    avatar: {
      src: '/Devil.png',
      alt: '十年',
      loading: 'lazy' as const
    }
  },
  {
    title: '十年',
    name: '陈奕迅',
    avatar: {
      src: '/Devil.png',
      alt: '十年',
      loading: 'lazy' as const
    }
  },
  {
    title: '十年',
    name: '陈奕迅',
    avatar: {
      src: '/Devil.png',
      alt: '十年',
      loading: 'lazy' as const
    }
  },
])


</script>

<template>
  <section
    class="w-[350px] rounded-[18px] border border-default dark:bg-jet-blue light:bg-white text-default shadow-2xl light:shadow-black/30 dark:shadow-white/10">

    <div class="px-7 py-5">
      <div class="flex items-start gap-4">
        <NuxtImg src="/Sin.jpg" alt=""
          class="size-[72px] shrink-0 rounded-full border border-default object-cover shadow-lg shadow-black/40" />

        <div class="min-w-0 flex-1 pt-1">
          <h3 class="truncate text-2xl font-black leading-7 tracking-tight text-default/90">
            后来
          </h3>
          <p class="mt-0.5 truncate text-base leading-5 text-default/90">
            刘若英
          </p>

          <div class="mt-3 flex items-center gap-3">
            <UIcon name="i-lucide-volume-2" class="size-5 text-default/75" />
            <div class="h-1.5 w-[76px] overflow-hidden rounded-full bg-inverted/30">
              <div class="h-full rounded-full bg-inverted/80" :style="{ width: `${volume}%` }" />
            </div>
          </div>
        </div>

        <div class="flex items-end gap-4 pt-[52px] text-default/72">
          <UTooltip text="歌词">
            <UButton icon="i-lucide-captions" variant="ghost" class="hover:bg-inverted/10 hover:text-default" />
          </UTooltip>
          <!-- 下面这个功能感觉多余了, 先隐藏起来 -->
          <UTooltip v-if="false" text="歌曲胶囊">
            <UButton icon="i-lucide-list-music" variant="ghost" class="hover:bg-inverted/10 hover:text-default" />
          </UTooltip>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-3 font-mono text-sm text-default/72">
        <span>0:00</span>
        <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-inverted/35">
          <div class="h-full rounded-full bg-primary" :style="{ width: `${progress}%` }" />
        </div>
        <span>5:41</span>
      </div>

      <div class="mt-5 flex items-center justify-between px-3 text-default/78">
        <UTooltip text="循环播放">
          <UButton icon="i-lucide-repeat-2" variant="ghost" color="neutral" size="lg"
            class="text-default/55 hover:bg-inverted/10 hover:text-default" aria-label="Repeat" />
        </UTooltip>
        <UTooltip text="上一首">
          <UButton icon="i-lucide-skip-back" variant="ghost" color="neutral" size="lg"
            class="text-default/85 hover:bg-inverted/10 hover:text-default" aria-label="Previous" />
        </UTooltip>
        <UTooltip :text="isPlaying ? '暂停' : '播放'">
          <UButton :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'" variant="ghost" color="neutral" size="xl"
            class="text-default hover:bg-inverted/10" aria-label="Play" @click="isPlaying = !isPlaying" />
        </UTooltip>
        <UTooltip text="下一首">
          <UButton icon="i-lucide-skip-forward" variant="ghost" color="neutral" size="lg"
            class="text-default/85 hover:bg-inverted/10 hover:text-default" aria-label="Next" />
        </UTooltip>
        <UTooltip text="播放列表">
          <UButton @click="openExpand" icon="i-lucide-list-music" variant="ghost" color="neutral" size="lg"
            class="text-default/55 hover:bg-inverted/10 hover:text-default" aria-label="Playlist" />
        </UTooltip>
        <UTooltip text="可视化">
          <UButton icon="i-lucide-audio-lines" variant="ghost" color="neutral" size="lg"
            class="text-default/55 hover:bg-inverted/10 hover:text-default" aria-label="Audio" />
        </UTooltip>
      </div>
    </div>

    <div class="overflow-hidden transition-all text-default dark:bg-jet-blue light:bg-white" :class="isExpand ? 'max-h-[600px]' : 'max-h-0'">
      <LazyUPageList class="overflow-auto max-h-[600px]">
        <UPageCard v-for="(song, index) in songs" :key="index" variant="ghost" class="dark:hover:bg-jethover-blue light:hover:bg-blue-50">
          <template #body>
            <UUser class="relative" :name="song.title" :description="song.name" :avatar="song.avatar" size="xl" />
          </template>
        </UPageCard>
      </LazyUPageList>
    </div>

  </section>
</template>
