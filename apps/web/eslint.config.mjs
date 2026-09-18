// @ts-check
/**
 * ESLint 配置
 * - 基于由 `nuxt prepare` 生成的 .nuxt/eslint.config.mjs
 * - 在其基础上仅覆盖一条规则: 允许显式 any
 */

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // 关闭 "禁止显式 any" 规则,允许在需要灵活类型的场景使用 any
    '@typescript-eslint/no-explicit-any': 'off'
  }
})
