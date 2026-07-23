/**
 * 顶部导航菜单项定义
 * - 统一导出 navLinks,在 AppHeader / 搜索浮层中复用
 * - 类型遵循 Nuxt UI 的 NavigationMenuItem
 */

import type { NavigationMenuItem } from '@nuxt/ui'

// 顶部导航菜单项 (label / 图标 / 路由路径)
export const navLinks: NavigationMenuItem[] = [{
  label: 'Home',
  icon: 'i-lucide-home',
  to: '/'
}, {
  label: 'UI',
  icon: 'tabler:components',
  to: '/ui'
}, {
  label: 'Animation',
  icon: 'tdesign:animation-1',
  to: '/animation'
},
{
  label: 'Ai Laboratory',
  icon: 'ri:ai',
  to: '/AiLaboratory'
}
]
