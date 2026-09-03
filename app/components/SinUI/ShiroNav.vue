<!--
 * ShiroNav - 灵感源自 Innei Shiro 主题博客的胶囊浮动导航栏
 *
 * 【核心设计与动效技术要点】
 * 1. layout-id (跨组件共享布局动画):
 *    - 当在多个 Tab 间切换时，通过赋予相同的 layout-id，Motion 会自动计算前后元素的几何坐标差异，
 *      实现平滑无缝的共享元素过渡（Shared Element Transition）。
 *    - 特效 1: 小图标通过 layout-id="active-nav-icon" 在 Tab 之间产生弹簧飞跃效果。
 *    - 特效 2: 底部 1.5px 激光指示线通过 layout-id="active-nav-line" 在不同项之间滑动切换。
 * 2. layout / layout="size" (弹性排版与外壳果冻伸缩):
 *    - 胶囊外壳带有 layout="size"，当选项宽度变化时，整个胶囊外壳平滑拉长/回弹。
 *    - 文字标签带有 layout 属性，当激活态图标插入导致宽度发生变化时，文字平滑外移，配合 mass: 0.8。
 * 3. Spotlight (探照灯鼠标跟随光晕):
 *    - 监听鼠标在胶囊内部的相对坐标 (mouseX, mouseY)，生成动态径向渐变 (radial-gradient)。
 *    - 鼠标悬浮时以 300ms 平滑淡入，并在胶囊内随鼠标移动照亮底板。
 * 4. 明暗模式流光配色深度适配:
 *    - 光明模式: 采用 rgb(138, 194, 187)（灰湖绿/薄荷青）作为强调色、激光流光与光晕。
 *    - 黑暗模式: 采用 pink-400/80（粉红微光）作为强调色、激光流光与柔光投影。
-->

<script setup lang="ts">
import { Motion } from 'motion-v'

export interface ShiroNavItem {
  title: string
  icon: string // Nuxt Icon / Iconify 图标名称
}

const props = withDefaults(
  defineProps<{
    /** 导航项列表（默认提供 Shiro 经典预设） */
    items?: ShiroNavItem[]
    /** 默认选中的索引 */
    defaultIndex?: number
  }>(),
  {
    items: () => [
      { title: '首页', icon: 'i-mingcute-home-3-line' },
      { title: '文稿', icon: 'i-mingcute-quill-pen-line' },
      { title: '手记', icon: 'i-mingcute-notebook-line' },
      { title: '时光', icon: 'i-mingcute-time-line' },
      { title: '友链', icon: 'i-fa6-solid-user-group' }
    ],
    defaultIndex: 0
  }
)

const emit = defineEmits<{
  (e: 'change', index: number, item: ShiroNavItem): void
}>()

// 当前激活的项索引
const activeIndex = ref(props.defaultIndex)

// 判定当前项是否激活
const isItemActive = (index: number) => activeIndex.value === index

// 点击切换项
const handleSelect = (index: number, item: ShiroNavItem) => {
  activeIndex.value = index
  emit('change', index, item)
}

// ====================  Spotlight 探照灯鼠标跟随逻辑 ====================
const mouseX = ref(0)
const mouseY = ref(0)
const radius = ref(100) // 光晕扩散半径 (px)

const onMouseMove = (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  mouseX.value = e.clientX - rect.left
  mouseY.value = e.clientY - rect.top
  radius.value = Math.hypot(rect.width, rect.height) / 2.5
}

// 统一的物理弹簧参数 (果冻弹性手感)
const springTransition = {
  type: 'spring',
  stiffness: 380,
  damping: 26,
  mass: 0.8
}
</script>

<template>
  <!-- 胶囊导航外壳：layout="size" 弹性果冻拉伸 + 毛玻璃 + 边框微光 + group 悬浮光晕 -->
  <Motion
    as="nav"
    layout="size"
    :transition="springTransition"
    class="group relative inline-flex items-center rounded-full bg-white/70 dark:bg-zinc-900/60 px-3 py-1.5 shadow-lg shadow-zinc-300/40 dark:shadow-black/30 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-md transition-colors duration-300 select-none"
    @mousemove="onMouseMove"
  >
    <!--  Spotlight 探照灯光晕层：以鼠标坐标为圆心，明暗模式自适应光色 -->
    <div
      class="pointer-events-none absolute -inset-px rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 overflow-hidden dark:hidden"
      :style="{
        background: `radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, rgba(138, 194, 187, 0.2), transparent 65%)`
      }"
      style="--spotlight-color: rgba(138, 194, 187, 0.22);"
    />
    <!-- 深色模式下的 Spotlight 光晕颜色覆盖 (粉色柔光) -->
    <div
      class="pointer-events-none absolute -inset-px rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden dark:block overflow-hidden"
      :style="{
        background: `radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, rgba(244, 114, 182, 0.1), transparent 65%)`
      }"
    />

    <!-- 导航按钮列表 -->
    <button
      v-for="(item, index) in items"
      :key="item.title"
      type="button"
      class="relative z-10 flex items-center px-4 py-1.5 text-sm font-medium transition-colors duration-200 cursor-pointer outline-none select-none"
      :class="[
        isItemActive(index)
          ? 'text-[rgb(138,194,187)] dark:text-pink-400/80 font-semibold'
          : 'text-zinc-600 hover:text-[rgb(138,194,187)] dark:text-zinc-400 dark:hover:text-pink-400/80'
      ]"
      @click="handleSelect(index, item)"
    >
      <!-- 特效 1：左侧小图标（带有 layout-id 跨 Tab 平滑飞跃） -->
      <Motion
        v-if="isItemActive(index)"
        layout-id="active-nav-icon"
        as="span"
        class="mr-1.5 flex items-center text-base"
        :transition="springTransition"
      >
        <UIcon
          :name="item.icon"
          class="size-4"
        />
      </Motion>

      <!-- 文本标签：使用 layout 属性平滑处理由图标显隐带来的宽度伸缩动画 -->
      <Motion
        as="span"
        layout
        :transition="springTransition"
        class="whitespace-nowrap"
      >
        {{ item.title }}
      </Motion>

      <!-- 特效 2：底部 1.5px 流光激光指示线（两端虚化、中间聚焦高光，明暗模式自动调整光晕色值） -->
      <Motion
        v-if="isItemActive(index)"
        layout-id="active-nav-line"
        as="span"
        class="absolute inset-x-2 -bottom-0.5 h-[1.5px] bg-gradient-to-r from-transparent via-[rgb(138,194,187)] to-transparent dark:from-pink-500/0 dark:via-pink-400 dark:to-pink-500/0 shadow-[0_0_8px_rgba(138,194,187,0.8)] dark:shadow-[0_0_8px_rgba(244,114,182,0.6)]"
        :transition="springTransition"
      />
    </button>
  </Motion>
</template>