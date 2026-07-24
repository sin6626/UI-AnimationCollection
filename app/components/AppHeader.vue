/**
 * 顶部浮动导航组件
 * - 固定在顶部居中位置 (左右随机平移到中线)
 * - 使用 UNavigationMenu + 模糊背景胶囊样式
 * - links 由父组件传入 (统一来自 utils/links.ts 的 navLinks)
 * - 带 motion-v spring 滑动的激活指示条,图标跟随指示条过渡
 * - 末尾槽位放颜色模式切换按钮
 */

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { Motion } from 'motion-v'
import { useRoute } from 'vue-router'

// 接收导航菜单项数组 (统一来自 utils/links.ts 的 navLinks)
const props = defineProps<{
  links: NavigationMenuItem[]
}>()

const route = useRoute()
const navRef = ref<HTMLElement | null>(null)
const indicator = reactive({ left: 0, width: 0, opacity: 0 })

// 根据当前路由路径找出在 links 中的索引
function getActiveIndex(): number {
  const path = route.path
  return props.links.findIndex((link) => {
    const to = link.to
    if (!to || typeof to !== 'string') return false
    if (to === '/') return path === '/'
    // /blog 还能匹配 /blog/xxx
    return path === to || path.startsWith(to + '/')
  })
}

// 计算激活项 DOM 位置 → 更新 indicator
function updateIndicator() {
  const root = navRef.value
  if (!root) return

  const idx = getActiveIndex()
  if (idx === -1) {
    indicator.opacity = 0
    return
  }

  // [data-slot="link"] 是按渲染顺序排列的导航链接元素
  const linkEls = root.querySelectorAll<HTMLElement>('[data-slot="link"]')
  const activeEl = linkEls[idx]
  if (!activeEl) {
    indicator.opacity = 0
    return
  }

  const rootRect = root.getBoundingClientRect()
  const elRect = activeEl.getBoundingClientRect()
  indicator.left = elRect.left - rootRect.left
  indicator.width = elRect.width
  indicator.opacity = 1
}

// 路由变化 → 等 DOM 更新后再重新定位指示条
watch(() => route.path, () => nextTick(updateIndicator), { immediate: true })

onMounted(() => window.addEventListener('resize', updateIndicator))
onBeforeUnmount(() => window.removeEventListener('resize', updateIndicator))
</script>

<template>
  <div class="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-10">
    <!-- 外层 relative 容器: 为绝对定位的指示条提供定位基准 -->
    <div
      ref="navRef"
      class="relative"
    >
      <!-- motion-v spring 滑动指示条: left/width 跟随激活项 DOM 位置变化,自动 spring 回弹过渡 -->
      <Motion
        tag="div"
        :initial="false"
        :animate="{
          left: `${indicator.left}px`,
          width: `${indicator.width}px`,
          opacity: indicator.opacity
        }"
        :transition="{ type: 'spring', stiffness: 380, damping: 30 }"
        class="absolute top-1/2 -translate-y-1/2 h-7 rounded-full bg-primary/15 ring-1 ring-primary/30 pointer-events-none"
      />
      <UNavigationMenu
        :items="links"
        variant="link"
        color="neutral"
        :highlight="true"
        class="bg-muted/80 backdrop-blur-sm rounded-full px-2 sm:px-4 border border-muted/50 shadow-lg shadow-neutral-950/5"
        :ui="{
          link: 'px-2 py-1',
          linkLeadingIcon: 'hidden'
        }"
      >
        <!-- 所有项都渲染图标,使 DOM 稳定;激活项显示主色,非激活项完全透明 + 缩小 (通过 transition 产生淡入/淡出效果) -->
        <template #item-leading="{ item, active }">
          <span class="size-4 flex items-center justify-center">
            <UIcon
              :name="item.icon"
              :class="[
                'size-4',
                'transition-all duration-300',
                active
                  ? 'opacity-100 scale-100'
                  : 'text-muted-foreground/20 opacity-0 scale-75'
              ]"
            />
          </span>
        </template>

        <!-- 末尾追加颜色模式切换按钮 -->
        <template #list-trailing>
          <ColorModeButton />
        </template>
      </UNavigationMenu>
    </div>
  </div>
</template>
