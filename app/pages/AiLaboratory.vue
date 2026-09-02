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
  <div class="flex items-center justify-center min-h-screen w-full gap-4">
    <!-- 胶囊导航外壳：毛玻璃 + 圆润药丸 + 边框微光 -->
    <nav
      class="relative inline-flex items-center rounded-full bg-zinc-900/60 px-3 py-1.5 shadow-lg shadow-black/20 ring-1 ring-white/10 backdrop-blur-md"
    >
      <button
        v-for="(item, index) in navItems"
        :key="item.title"
        type="button"
        class="relative flex items-center px-4 py-1.5 text-sm font-medium transition-colors duration-200 cursor-pointer outline-none select-none"
        :class="[
          isItemActive(index)
            ? 'text-pink-400/80' /* 激活时的高亮强调色 */
            : 'text-zinc-400 hover:text-zinc-200'
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

        <!-- 特效 2：底部 1px 流光激光指示线（两端虚化、中间聚焦高光） -->
        <Motion
          v-if="isItemActive(index)"
          layout-id="active-nav-line"
          as="span"
          class="absolute inset-x-2 -bottom-0.5 h-[1.5px] bg-gradient-to-r from-pink-500/0 via-pink-400 to-pink-500/0 shadow-[0_0_8px_rgba(244,114,182,0.6)]"
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
