// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ["@nuxt/content"],

  css: ["~/assets/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  // Nuxt Content 配置
  content: {
    experimental: {
      // 使用原生 sqlite 连接器 (实验性,性能更好)
      sqliteConnector: "native",
    },
  },

  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
})
