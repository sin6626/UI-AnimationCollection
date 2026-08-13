<script setup lang="ts">
import { createPlumGrowth, type PlumGrowthController } from '~/utils/plumGrowth'

/** 指向全屏装饰 Canvas。 */
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
let controller: PlumGrowthController | null = null

onMounted(() => {
  if (!canvas.value) return
  controller = createPlumGrowth(canvas.value)
})

onBeforeUnmount(() => {
  controller?.dispose()
  controller = null
})
</script>

<template>
  <div
    class="pointer-events-none fixed inset-0 z-0"
    aria-hidden="true"
  >
    <canvas
      ref="canvas"
      class="block size-full opacity-90 mix-blend-difference transition-opacity duration-180 ease-[ease] motion-reduce:transition-none"
    />
  </div>
</template>
