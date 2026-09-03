/**
 * ShiroNav - 灵感源自 Innei Shiro 主题博客的胶囊浮动导航栏
 *
 * 【核心设计与动效技术要点】
 * 1. layout-id (跨组件共享布局动画):
 *    - 当在多个 Tab 间切换时，通过赋予相同的 layout-id，Motion 会自动计算前后元素的几何坐标差异，
 *      实现平滑无缝的共享元素过渡（Shared Element Transition）。
 *    - 特效 1: 小图标通过 layout-id="active-nav-icon" 在 Tab 之间产生弹簧飞跃效果。
 *    - 特效 2: 底部 1px 激光指示线通过 layout-id="active-nav-line" 在不同项之间滑动切换。
 * 2. layout (弹性排版重排):
 *    - 文字标签带有 layout 属性，当激活态图标插入导致宽度发生变化时，文字平滑外移，
 *      配合 mass: 0.8（物体惯性质量），带来物理真实感的跟随。
 * 3. 明暗模式流光配色适配:
 *    - 光明模式: 采用 rgb(138, 194, 187)（灰湖绿/薄荷青）作为主强调色与激光流光阴影。
 *    - 黑暗模式: 采用 pink-400/80（粉红微光）作为主色与柔光投影。
 */

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
</script>

<template>
  <!-- 胶囊导航外壳：毛玻璃 + 圆润药丸 + 边框微光 (明暗模式深度适配) -->
  <nav
    class="relative inline-flex items-center rounded-full bg-white/70 dark:bg-zinc-900/60 px-3 py-1.5 shadow-lg shadow-zinc-300/40 dark:shadow-black/30 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-md transition-colors duration-300"
  >
    <button
      v-for="(item, index) in items"
      :key="item.title"
      type="button"
      class="relative flex items-center px-4 py-1.5 text-sm font-medium transition-colors duration-200 cursor-pointer outline-none select-none"
      :class="[
        isItemActive(index)
          ? 'text-[rgb(138,194,187)] dark:text-pink-400/80 font-semibold' /* 激活高亮：光明模式 138,194,187，黑暗模式粉色 */
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
      ]"
      @click="handleSelect(index, item)"
    >
      <!--  特效 1：左侧小图标（带有 layout-id 跨 Tab 平滑飞跃） -->
      <Motion
        v-if="isItemActive(index)"
        layout-id="active-nav-icon"
        as="span"
        class="mr-1.5 flex items-center text-base"
        :transition="{
          type: 'spring',
          stiffness: 350,
          damping: 25
        }"
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
        :transition="{
          type: 'spring',
          stiffness: 400,
          damping: 28,
          mass: 0.8 // mass: 物体惯性质量，质量越大惯性越强
        }"
        class="whitespace-nowrap"
      >
        {{ item.title }}
      </Motion>

      <!--  特效 2：底部 1px 流光激光指示线（两端虚化、中间聚焦高光，明暗模式自动调整光晕色值） -->
      <Motion
        v-if="isItemActive(index)"
        layout-id="active-nav-line"
        as="span"
        class="absolute inset-x-2 -bottom-0.5 h-[1.5px] bg-gradient-to-r from-transparent via-[rgb(138,194,187)] to-transparent dark:from-pink-500/0 dark:via-pink-400 dark:to-pink-500/0 shadow-[0_0_8px_rgba(138,194,187,0.8)] dark:shadow-[0_0_8px_rgba(244,114,182,0.6)]"
        :transition="{
          type: 'spring',
          stiffness: 350,
          damping: 25
        }"
      />
    </button>
  </nav>
</template>
