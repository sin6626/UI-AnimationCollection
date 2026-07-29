<script setup lang='ts'>
/**
 * thePreloader.vue —— 首屏预加载器。
 *
 * 显示方式：固定覆盖全屏，z-index: 50。
 * 动画流程：
 * 1. 页面加载后 1.5s 内，LogoBO SVG 做 fill 填充动画 + 三组 path 描边动画（CSS）；
 * 2. 2s 后波浪 #quadbz2 从底部升起（将整屏盖住）；
 * 3. 波浪继续推进到顶部，hidden 隐藏 preloader；
 * 4. 解除滚动锁 -> scrollStore.isReady = false；
 * 5. 触发 isRoute.isNewPage++ 通知页面开始入场。
 *
 * 注意：preloader 在 app.vue 模板中位于 <NuxtPage> 上方，
 * 所以首次加载时也会覆盖首屏内容，preloader 消失后内容才可见。
 *
 * 入库展示版：不再 fixed 全屏、不隐藏页面、不处理滚动锁，只在一个演示框里播放同样的 WaveReveal + Logo Stroke 动画。
 */
const waveRef = useTemplateRef('wave')

let ctx: gsap.Context
let t1: gsap.core.Timeline
let resetAni: () => void

onMounted(() => {
  const root = waveRef.value
  if (!root) {
    return
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  const { $gsap: gsap } = useNuxtApp()

  ctx = gsap.context(() => {
    const wave = root.querySelector('.wave-reveal-path')
    const logo = root.querySelector('.wave-reveal-logo')
    const logoPaths = gsap.utils.toArray('.wave-reveal-logo path')
    if (!wave || !logo) return

    const reset = () => {
      gsap.set(wave, {
        attr: {
          d: 'M 0 0 V 100 Q 50 100 100 100 V 0 z'
        }
      })
      gsap.set(logo, { yPercent: 0, autoAlpha: 1 })
      gsap.set(logoPaths, {
        fillOpacity: 0,
        strokeDashoffset: index => [7413, 3514, 6108][index] ?? 9999
      })
    }
    resetAni = reset

    reset()

    t1 = gsap.timeline({
      onRepeat: reset // onRepeat
    })
      // LogoBO 三个 path 的描边动画（stroke-dashoffset -> 0）
      .to(logoPaths, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power1.inOut',
        stagger: 0.2
      })
      // animate-[filldark_0.8s_ease-in-out_1.5s_forwards] tailwind中的自定义属性, _ 表示空格, 最后的forwards是细节, 加了这个表示保持动画的最后一帧
      .to(logoPaths, {
        fillOpacity: 1,
        duration: 0.8,
        ease: 'power1.inOut'
      }, '-=0.5')
      // 波浪从底部（V 100）升到 70%，呈"水漫过屏幕下半"
      .to(wave, {
        // svg 不是靠transform, 而是靠他自身的d属性去做动画
        attr: {
          d: 'M 0 0 V 70 Q 50 90 100 70 V 0 z'
        },
        duration: 0.3,
        ease: 'power3.in',
        delay: 0.5 // 等描边 + 填充动画跑完, 然后再稍微等等, 让人看见logo
      })
      // 继续升到顶部 0，盖满
      .to(wave, {
        attr: {
          d: 'M 0 0 V 0 Q 50 0 100 0 V 0 z'
        },
        duration: 0.8,
        ease: 'power3'
      })
      // LOGO 从位置 0 上飘消失（与波浪并行）
      .to(logo, {
        yPercent: -100,
        autoAlpha: 0,
        duration: 1,
        ease: 'power4.out'
      }, '<')
  }, root)
})

const restartAni = () => {
  resetAni?.()
  t1?.restart()
}

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section
    ref="wave"
    class="m-auto flex flex-col gap-4 justify-center items-center py-10 px-6 bg-default rounded-3xl"
    aria-label="Wave reveal and logo stroke animation"
  >
    <div class="flex justify-end w-full">
      <UIcon
        name="ic:round-loop"
        class="size-7 cursor-pointer"
        @click="restartAni"
      />
    </div>

    <!-- 全屏覆盖层 flex 居中；展示版改成局部展示框 -->
    <div class="relative aspect-[16/9] max-h-[62vh] w-full overflow-hidden rounded-xl bg-elevated">
      <!-- 波浪 SVG 背景，亮色/暗色分别用浅紫/浅橙 -->
      <!-- 重要属性preserveAspectRatio: 控制svg的缩放方式, 默认是svg会保持比例, 但是对于这里的要全屏的效果肯定不是不要保持比例的, 不然100 * 100 的比例如何让一个长方形的屏幕铺满, 所以要设置为none, 也就是不要保持比例, 直接铺满全屏 -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        class="absolute left-0 top-0 h-full w-full fill-light-orange dark:fill-light-sliver"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <!-- 波浪 -->
        <path
          class="wave-reveal-path"
          stroke="transparent"
          vector-effect="non-scaling-stroke"
          d="M 0 0 V 100 Q 50 100 100 100 V 0 z"
        />
      </svg>
      <!-- grid + place-items-center 一种很优雅的居中方式, 水平和垂直居中 -->
      <div class="relative z-10 grid h-full w-full place-items-center">
        <!-- LOGO 容器 overflow:hidden 以配合上飘动画 -->
        <div class="z-30 h-1/3 w-1/2 overflow-hidden">
          <SvgLogoSin class="wave-reveal-logo h-full w-full fill-jet stroke-jet stroke-20 dark:fill-white dark:stroke-white" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/**
 * LogoBO 三个 path 的描边动画（stroke-dashoffset -> 0）：
 * 路径 1（轮廓）-> 路径 2（中间细节）-> 路径 3（最细结构），错序延迟。
 */
.wave-reveal-logo:deep(path:nth-child(1)) {
  stroke-dasharray: 7413;
  stroke-dashoffset: 7413;
}

.wave-reveal-logo:deep(path:nth-child(2)) {
  stroke-dasharray: 3514;
  stroke-dashoffset: 3514;
}

.wave-reveal-logo:deep(path:nth-child(3)) {
  stroke-dasharray: 6108;
  stroke-dashoffset: 6108;
}
</style>
