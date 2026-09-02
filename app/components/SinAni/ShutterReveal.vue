<script setup lang='ts'>
// 快门动画的根元素引用
// Vue3.5 新版本的Template的Ref引用, 只要useTemplateRef后面字符串跟元素上ref的字符串一样即可, 不用变量名一样了
const shutterRef = useTemplateRef('shutter')

// 生成 5 个切片面板配置：交替从上下方向飞入，每个切片占据 20% 宽度
const panels = Array.from({ length: 5 }, (_, index) => ({
  index,
  // 给了下面的gsap的yPercent设置一个初始值
  // yPercent: 向y轴移动自身元素的%多少, 这里写成100%就是让元素一开始就藏起来
  fromY: index % 2 === 0 ? 100 : -100,
  // inset是给下面css属性中的clip-path设置用的, 四个值的顺序是跟margin一样的上, 右, 下, 左
  // 比如inset(0 80% 0 0)表示, 裁剪右边的80%的部分
  clip: `inset(0 ${100 - (index + 1) * 20}% 0 ${index * 20}%)`
}))

// 存储 GSAP context 实例，用于组件卸载时清理
// Ts的类型声明可以写成 { revert: () => void } | undefined, 表示这个对象有一个 revert(恢复, 还原动画并将其终止，使目标恢复到动画之前的状态，包括移除动画添加的内联样式)方法
let ctx: { revert: () => void } | undefined
let t1: any

onMounted(() => {
  // gsap.context 的第二个参数要是一个HTMLElement. 所以这里要.value出HTMLElement
  const root = shutterRef.value
  if (!root) {
    return
  }
  // 如果用户偏好减少动效，直接跳过
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  // gsap / ScrollTrigger 由 app/plugins/gsap.client.ts 全局注册，此处直接取用
  const { $gsap: gsap } = useNuxtApp()

  // 创建 GSAP context，所有动画与 root 绑定, gsap.context返回的对象中包括了revert方法
  ctx = gsap.context(() => {
    const stage = root.querySelector('.shutter-stage')
    // gsap.utils 提供了很多的使用函数
    // toArray: 允许吧几乎任何类似数组的对象转换为数组，包括选择器文本！（例如： toArray(".class") --> [element1, element2] ）。
    const slices = gsap.utils.toArray('.shutter-slice')
    const final = root.querySelector('.shutter-final')
    // 没有舞台, 或者最后的图片没有, 那么直接return
    if (!stage || !final) return

    // 初始状态：所有切片透明并按奇偶偏移，最终图透明
    // 立即相应地设置目标对象的属性——本质上是一个持续时间为零的 to() Tween(补间动画)，只是名称更直观。因此，以下几行代码会产生相同的结果
    gsap.set(slices, {
      // autoAlpha 是gsap中的一个特殊的属性, 是opacity和visibility的组合属性, 设置为0的时候, opacity: 0, visibility: inherit(这里因为要依靠父组件, 逻辑是父组件hidden, 那么子组件应该也是hidden)
      autoAlpha: 0,
      // yPercent: 向y轴移动自身元素的%多少, 这里写成100%就是让元素一开始就藏起来
      yPercent: index => panels[index]?.fromY ?? 0
    })
    gsap.set(final, { autoAlpha: 0 })

    // 构建滚动驱动的时间线
    // 提前记录下gasp.timeline的实例, 因为后面还要调用他的restart方法
    t1 = gsap.timeline({
      // 后面的动画都是默认下面这个属性, 避免了重复写
      defaults: { ease: 'circ.inOut' }
      // defaults: { ease: 'steps(12)' },
      // 下面的 scrollTrigger 负责把时间线进度和滚动条绑定起来
      // 其实下面的scrollTrigger完全不用, 因为做的动画本来也不涉及的到跟滚动条联动了, 如果加了下面的字段, 然而会因为页面高度不够, 不能展示出发动画
      // scrollTrigger: {
      //   // trigger: 谁触发滚动动画
      //   trigger: root,
      //   start: 'top 96px', // [只读] ScrollTrigger 的起始滚动位置（数值，以像素为单位）。, 滚动到距顶部 96px 时触发
      //   end: '+=900', // [只读] ScrollTrigger 的结束滚动位置（数值，以像素为单位）。, 持续 900px 的滚动距离
      //   pin: stage, // 布尔值 | 字符串 | 元素 - 指定一个元素（或元素的选择器文本），在滚动触发器激活期间将其固定，使其“卡”在初始位置，而其下方的其他内容则继续滚动。只能固定一个元素，但该元素可以包含任意数量的子元素。设置 pin: true 将固定 trigger 元素。, 固定舞台区域
      //   scrub: true, // 动画与ScrollTrigger 的进度绑定, 滚动与动画进度 1:1 绑定, 详细看https://gsap.com/docs/v3/Plugins/ScrollTrigger/#pin
      //   invalidateOnRefresh: true // 布尔值 - 如果为 true ，则与 ScrollTrigger 关联的动画会在每次刷新（通常是调整窗口大小时）时调用其 invalidate() 方法。这将清除所有内部记录的初始值。
      // }
    })
      // 第一阶段：切片飞入并淡入
      .to(slices, { autoAlpha: 1, yPercent: 0, duration: 1 })
      // 第二阶段：最终完整图淡入（覆盖切片）
      .to(final, { autoAlpha: 1, duration: 0.25 })
  }, root)
})

const restartAni = () => {
  t1?.restart()
}

onUnmounted(() => {
  // 组件卸载时恢复所有 GSAP 设置的状态
  ctx?.revert()
})
</script>

<template>
  <section
    ref="shutter"
    class="m-auto flex flex-col gap-4 justify-center items-center py-10 px-6 bg-default rounded-3xl"
    aria-label="滚动触发的快门动画"
  >
    <div class="flex justify-end w-full ">
      <UIcon
        name="ic:round-loop"
        class="size-7 cursor-pointer"
        @click="restartAni"
      />
    </div>
    <div class="shutter-stage relative aspect-[16/9] max-h-[62vh] w-full overflow-hidden rounded-xl bg-default">
      <!-- 5 个切片层：用 clipPath 裁剪成竖条，交错飞入 -->
      <div
        class="absolute inset-0 z-2"
        aria-hidden="true"
      >
        <div
          v-for="panel in panels"
          :key="panel.index"
          class="shutter-slice absolute inset-0 overflow-hidden ring-1 ring-inset ring-white/15"
          :style="{ clipPath: panel.clip }"
        >
          <img
            src="/Sin.jpg"
            alt=""
            class="h-full w-full object-cover object-center"
          >
        </div>
      </div>

      <!-- 最终完整图：切片归位后淡出覆盖，形成完整画面 -->
      <img
        class="shutter-final absolute inset-0 z-3 h-full w-full object-cover object-center"
        src="/Sin.jpg"
        alt="合并后的最终视觉"
      >
    </div>
  </section>
</template>
