<script setup lang="ts">
const shutterRef = useTemplateRef<HTMLElement>('shutter')

const panels = Array.from({ length: 5 }, (_, index) => ({
  index,
  fromY: index % 2 === 0 ? 112 : -112,
}))

let ctx: { revert: () => void } | undefined

onMounted(async () => {
  const root = shutterRef.value
  if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])

  gsap.registerPlugin(ScrollTrigger)

  ctx = gsap.context(() => {
    const stageEl = root.querySelector<HTMLElement>('.shutter-stage')
    const panelEls = gsap.utils.toArray<HTMLElement>('.shutter-panel')
    const finalEl = root.querySelector<HTMLElement>('.shutter-final')
    if (!stageEl || !finalEl) return

    gsap.set(panelEls, {
      autoAlpha: 0,
      yPercent: (index) => panels[index]?.fromY ?? 0,
    })
    gsap.set(finalEl, { autoAlpha: 0, scale: 1.03 })

    const timeline = gsap.timeline({
      defaults: { duration: 1, ease: 'none' },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: '+=4200',
        pin: stageEl,
        scrub: true,
        invalidateOnRefresh: true,
      },
    })

    panelEls.forEach((panel) => {
      timeline.to(panel, { autoAlpha: 1, yPercent: 0 })
    })

    timeline.to(finalEl, { autoAlpha: 1, scale: 1, duration: 0.8 })
  }, root)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div class="min-h-screen w-screen -mt-10 bg-[#0f1014] text-[#f7f4ee] [margin-inline:calc(50%_-_50vw)]">
    <section
      ref="shutter"
      class="relative h-screen"
      aria-label="Scroll driven shutter animation"
    >
      <div class="shutter-stage relative h-screen overflow-hidden bg-[#050507] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.12),transparent_36%)]">
        <div
          class="absolute inset-0 z-[2] grid grid-cols-5"
          aria-hidden="true"
        >
          <article
            v-for="panel in panels"
            :key="panel.index"
            class="shutter-panel relative min-w-0 overflow-hidden border-x border-white/15 [will-change:transform,opacity]"
            :style="{ '--image-x': `${panel.index * -20}vw` }"
          >
            <img
              src="/Sin.jpg"
              alt=""
              class="h-full w-screen max-w-none translate-x-[var(--image-x)] object-cover object-center"
            >
          </article>
        </div>

        <img
          class="shutter-final absolute inset-0 z-[3] h-full w-full object-cover will-change-transform"
          src="/Sin.jpg"
          alt="Merged final visual"
        >
      </div>
    </section>
  </div>
</template>
