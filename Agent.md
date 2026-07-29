# Agent Notes

- 项目：UI & Animation Collection。
- 当前约定：新增资源优先放在 `app/assets/` 下，避免污染项目根目录。
- 字体来源：优先使用 Google Fonts / 官方仓库文件，保留清晰文件名。
- 开发服务：不要主动启动 Nuxt dev server；用户通常会自己常驻启动，先使用已打开的服务。
- Nuxt 组件命名：`app/components/SinAni/AniDemo.vue` 使用时写 `<SinAniDemo>`，不要写重复的 `<SinAniAniDemo>`。
- GSAP 变量类型：创建 `ctx`、`t1`、`resetAni` 等变量时显式标注类型，例如 `let ctx: gsap.Context`、`let t1: gsap.core.Timeline`、`let resetAni: () => void`，避免 VSCode TS 插件报错。
