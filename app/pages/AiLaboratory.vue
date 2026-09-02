<script setup lang="ts">
import { Motion } from 'motion-v'

// 1. 定义导航菜单项数据
interface NavItem {
  title: string
  icon: string // Nuxt Icon / Iconify 图标名称
}

const navItems: NavItem[] = [
  { title: '首页', icon: 'i-mingcute-home-3-line' },
  { title: '文稿', icon: 'i-mingcute-quill-pen-line' },
  { title: '手记', icon: 'i-mingcute-notebook-line' },
  { title: '时光', icon: 'i-mingcute-time-line' },
  { title: '友链', icon: 'i-fa6-solid-user-group' }
]

// 2. 当前激活项索引（默认第 0 项）
const activeIndex = ref(0)

// 3. 判定当前项是否激活
const isItemActive = (index: number) => activeIndex.value === index
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen w-full gap-6">
    <!-- 胶囊导航外壳：毛玻璃 + 圆润药丸 + 边框微光 (明暗模式适配) -->
    <nav
      class="relative inline-flex items-center rounded-full bg-white/70 dark:bg-zinc-900/60 px-3 py-1.5 shadow-lg shadow-zinc-300/40 dark:shadow-black/30 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-md transition-colors duration-300"
    >
      <button
        v-for="(item, index) in navItems"
        :key="item.title"
        type="button"
        class="relative flex items-center px-4 py-1.5 text-sm font-medium transition-colors duration-200 cursor-pointer outline-none select-none"
        :class="[
          isItemActive(index)
            ? 'text-[rgb(138,194,187)] dark:text-pink-400/80 font-semibold' /* 激活时高亮：光明模式 138,194,187，黑暗模式粉色 */
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
        ]"
        @click="activeIndex = index"
      >
        <!-- 特效 1：左侧小图标（带有 layout-id 跨 Tab 平滑飞跃） -->
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

        <Motion
          as="span"
          layout
          :transition="{
            type: 'spring',
            stiffness: 400,
            damping: 28,
            mass: 0.8 // mass: 指的是物体的质量, 质量大的物品惯性大
          }"
          class="whitespace-nowrap"
        >
          {{ item.title }}
        </Motion>

        <!-- 特效 2：底部 1px 流光激光指示线（明暗模式流光色彩适配） -->
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
  </div>
</template>
