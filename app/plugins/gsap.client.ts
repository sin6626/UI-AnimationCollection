// GSAP 客户端插件：全局注册一次，提供 gsap / ScrollTrigger 供全项目复用
// 文件名带 .client 后缀，确保只在浏览器端执行（GSAP 依赖 DOM）

import gsap from "gsap"
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger"

// 显式注册插件，避免不同打包环境下未被 GSAP 识别
export default defineNuxtPlugin(() => {
  // 通过 nuxtApp.provide 把 gsap 和 ScrollTrigger 注入全局
  gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin)
  // 组件中可用 useGsap() / useScrollTrigger() 取用，也可直接用自动导入的 gsap
  return {
    provide: {
      gsap,
      ScrollTrigger,
      MorphSVGPlugin,
    },
  }
})
