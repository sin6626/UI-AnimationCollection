<script setup lang="ts">
const isPlaying = ref(false)
const progress = 18
const volume = 68
</script>

<template>
  <section class="w-[350px] rounded-[18px] border border-default bg-default/80 text-default shadow-2xl shadow-black/30">
    <div class="px-7 py-5">
      <div class="flex items-start gap-4">
        <img
          src="/Sin.jpg"
          alt=""
          class="size-[72px] shrink-0 rounded-full border border-default object-cover shadow-lg shadow-black/40"
        >

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
              <div
                class="h-full rounded-full bg-inverted"
                :style="{ width: `${volume}%` }"
              />
            </div>
          </div>
        </div>

        <div class="flex items-end gap-4 pt-[52px] text-default/72">
          <UIcon name="i-lucide-captions" class="size-5 text-primary" />
          <UIcon name="i-lucide-list-music" class="size-5" />
        </div>
      </div>

      <div class="mt-4 flex items-center gap-3 font-mono text-sm text-default/72">
        <span>0:00</span>
        <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-inverted/35">
          <div
            class="h-full rounded-full bg-primary"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <span>5:41</span>
      </div>

      <div class="mt-5 flex items-center justify-between px-3 text-default/78">
        <UButton
          icon="i-lucide-repeat-2"
          variant="ghost"
          color="neutral"
          size="lg"
          class="text-default/55 hover:bg-inverted/10 hover:text-default"
          aria-label="Repeat"
        />
        <UButton
          icon="i-lucide-skip-back"
          variant="ghost"
          color="neutral"
          size="lg"
          class="text-default/85 hover:bg-inverted/10 hover:text-default"
          aria-label="Previous"
        />
        <UButton
          :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
          variant="ghost"
          color="neutral"
          size="xl"
          class="text-default hover:bg-inverted/10"
          aria-label="Play"
          @click="isPlaying = !isPlaying"
        />
        <UButton
          icon="i-lucide-skip-forward"
          variant="ghost"
          color="neutral"
          size="lg"
          class="text-default/85 hover:bg-inverted/10 hover:text-default"
          aria-label="Next"
        />
        <UButton
          icon="i-lucide-list-music"
          variant="ghost"
          color="neutral"
          size="lg"
          class="text-default/55 hover:bg-inverted/10 hover:text-default"
          aria-label="Playlist"
        />
        <UButton
          icon="i-lucide-audio-lines"
          variant="ghost"
          color="neutral"
          size="lg"
          class="text-default/55 hover:bg-inverted/10 hover:text-default"
          aria-label="Audio"
        />
      </div>
    </div>
  </section>
</template>
