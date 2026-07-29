<script setup lang="ts">
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
 */
const { $gsap: gsap } = useNuxtApp()

// const isLock = scrollStore()
// const isRoute = routeStore()

onMounted(() => {
  const preloaderContainer = document.querySelector(
    '#preloader-container',
  ) as HTMLDivElement
  gsap
    .timeline()
    // 波浪从底部（V 100）升到 70%，呈"水漫过屏幕下半"
    .to('#quadbz2', {
      // svg 不是靠transform, 而是靠他自身的d属性去做动画
      attr: {
        d: 'M 0 0 V 70 Q 50 90 100 70 V 0 z',
      },
      duration: 0.3,
      ease: 'power3.in',
      delay: 2.5, // 等描边 + 填充动画跑完, 然后再稍微等等, 让人看见logo
    })
    // 继续升到顶部 0，盖满
    .to('#quadbz2', {
      attr: {
        d: 'M 0 0 V 0 Q 50 0 100 0 V 0 z',
      },
      duration: 0.8,
      ease: 'power3',
      onComplete: () => {
        preloaderContainer.classList.add('hidden') // 整个容器消失, tailwind的类, 对应display: none
      //   isLock.$patch({
      //     isReady: false, // 解除滚动锁
      //   })
      //   // 也可以这样写, 最直接的写法, $patch是pinia自带的方法, 优点是可以同时修改多个值
      //   // isLock.isReady = false
      //   isRoute.isNewPage++ // 触发 pages 的入场动画
      },
    })
    // LOGO 从位置 0 上飘消失（与波浪并行）
    .fromTo(
      '#logoBO',
      {
        yPercent: 0,
      },
      {
        yPercent: -100,
        duration: 1,
        ease: 'power4.out',
      },
      2.6,
    )
})
</script>

<template>
  <!-- 全屏覆盖层 flex 居中 -->
  <div
    id="preloader-container"
    class="fixed inset-0 z-50 h-full w-full overflow-hidden"
  >
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
        id="quadbz2"
        stroke="transparent"
        vector-effect="non-scaling-stroke"
        d="M 0 0 V 100 Q 50 100 100 100 V 0 z"
      />
    </svg>
    <!-- grid + place-items-center 一种很优雅的居中方式, 水平和垂直居中 -->
    <div class="relative z-10 grid h-full w-full place-items-center">
      <!-- LOGO 容器 overflow:hidden 以配合上飘动画 -->
      <div class="z-30 h-1/4 w-1/2 overflow-hidden">
        <!-- animate-[filldark_0.8s_ease-in-out_1.5s_forwards] tailwind中的自定义属性, _ 表示空格, 最后的forwards是细节, 加了这个表示保持动画的最后一帧 -->
        <SvgLogoSin id="logoBO" class="h-full w-full animate-[filldark_0.8s_ease-in-out_1.5s_forwards] fill-transparent stroke-jet stroke-[20] dark:animate-[fillwhite_0.8s_ease-in-out_1.5s_forwards] dark:stroke-white" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * LogoBO 三个 path 的描边动画（stroke-dashoffset -> 0）：
 * 路径 1（轮廓）-> 路径 2（中间细节）-> 路径 3（最细结构），错序延迟。
 */

 #logoBO:deep() path:nth-child(1) {
  stroke-dasharray: 7413;
  stroke-dashoffset: 7413;
  animation: line-anim 1.5s ease-in-out forwards;
}

#logoBO:deep() path:nth-child(2) {
  stroke-dasharray: 3514;
  stroke-dashoffset: 3514;
  animation: line-anim 1.3s ease-in-out forwards;
  animation-delay: 200ms;
}

#logoBO:deep() path:nth-child(3) {
  stroke-dasharray: 6108;
  stroke-dashoffset: 6108;
  animation: line-anim 1.1s ease-in-out forwards;
  animation-delay: 400ms;
}


@keyframes line-anim {
  to {
    stroke-dashoffset: 0;
  }
}

</style>
