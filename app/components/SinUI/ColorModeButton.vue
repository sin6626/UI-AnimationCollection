<script setup lang='ts'>

const colorMode = useColorMode()
console.log(colorMode);

const nextTheme = computed(() => {
  return colorMode.value === 'dark' ? 'light': 'dark'
})

const swtichTheme = () => {
  colorMode.preference = nextTheme.value 
}

const startViewTransition = (event: MouseEvent) => {
  if ( !document.startViewTransition ) {
    swtichTheme()
    return
  }

  const x = event.clientX
  const y = event.clientY

  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  const transition = document.startViewTransition(() => {swtichTheme()})

  transition.ready.then(() => {
    const durtion = 600
    document.documentElement.animate(
      {
        clipPath:[
          `circle(0px, at, ${x}px, ${y}px)`,
          `circle(${endRadius}px, at, ${x}px, ${y}px)`
        ]
      }, 
      {
        duration: durtion,
        easing: 'cubic-bezier(.76,.32,.29,.99)',
        pseudoElement: '::view::view-transition-new(root)'
      }
    )
  })

}

</script>

<template>
  <ClientOnly>
    <UButton :aria-label="`Switch to ${nextTheme} mode`" :icon="`i-lucide-${nextTheme === 'dark' ? 'sun' : 'moon'}`" color="neutral" variant="ghost" size="sm" class="rounded-full" @click="startViewTransition"></UButton>

    <template #fallback>
      <div class="size-4"></div>
    </template>
  </ClientOnly>
</template>

<style lang="scss" scoped>

</style>