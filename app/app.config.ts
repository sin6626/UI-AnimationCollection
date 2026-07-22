/**
 * Nuxt UI 应用配置
 * - 通过 defineAppConfig 暴露全局可在组件中通过 useAppConfig() 访问的配置
 * - 包含三部分: global (站点级全局变量)、ui (Nuxt UI 主题与组件样式覆盖)、footer (页脚配置)
 */

export default defineAppConfig({
  // 站点级全局变量: 头像、会议预约链接、邮箱、是否可接单
  global: {
    // 头像配置,亮/暗模式可使用不同图片
    picture: {
      dark: "https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      light:
        "https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "My profile picture",
    },
    // 访客预约会议的链接 (Cal.com)
    meetingLink: "#",
    // 联系邮箱
    email: "sin6626meo@gmail.com",
    // 是否可接新项目 (影响 Hero 区"接单状态"按钮颜色与文案)
    available: true,
  },
  // Nuxt UI 配置: 主题色与 UPageHero 组件样式覆盖
  ui: {
    colors: {
      primary: "oklch(52.5% 0.223 3.958)",
      neutral: "neutral",
    },
    // 覆盖 UPageHero 组件默认槽位的样式 (容器内边距、标题宽度、描述样式)
    pageHero: {
      slots: {
        container: "py-18 sm:py-24 lg:py-32",
        title: "mx-auto max-w-xl text-pretty text-3xl sm:text-4xl lg:text-5xl",
        description:
          "mt-2 text-md mx-auto max-w-2xl text-pretty sm:text-md text-muted",
      },
    },
  },

  // 页脚配置: 版权信息、是否显示颜色模式切换、社交链接
  footer: {
    credits: `Created on 2026 - ${new Date().getFullYear()}`,
    links: [
      {
        icon: "mingcute:bilibili-line",
        to: "https://space.bilibili.com/514794835?spm_id_from=333.1007.0.0",
        target: "_blank",
        "aria-label": "Sin on Bilibili",
      },
      {
        icon: "i-simple-icons-x",
        to: "https://x.com/Sins6626",
        target: "_blank",
        "aria-label": "Sin on X",
      },
      {
        icon: "i-simple-icons-github",
        to: "https://github.com/sin6626",
        target: "_blank",
        "aria-label": "Nuxt UI on GitHub",
      },
    ],
  },
})
