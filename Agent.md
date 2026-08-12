# Agent Notes

- 项目：UI & Animation Collection。
- 当前约定：新增资源优先放在 `app/assets/` 下，避免污染项目根目录。
- 字体来源：优先使用 Google Fonts / 官方仓库文件，保留清晰文件名。
- 开发服务：不要主动启动 Nuxt dev server；用户通常会自己常驻启动，先使用已打开的服务。
- 页面骨架：默认 layout 统一维护全宽 `UContainer + UMain + UPage` 和全局侧栏；页面级 `UPage` 可以保留，但不得重复创建 `UMain` 或 `UContainer`。
- 构建检查：非必要不要跑完整 build，Nuxt 构建太慢；优先用相关文件 lint、已有 dev server 路由探测或局部检查。
- Nuxt 组件命名：`app/components/SinAni/AniDemo.vue` 使用时写 `<SinAniDemo>`，不要写重复的 `<SinAniAniDemo>`。
- GSAP 变量类型：创建 `ctx`、`t1`、`resetAni` 等变量时显式标注类型，例如 `let ctx: gsap.Context`、`let t1: gsap.core.Timeline`、`let resetAni: () => void`，避免 VSCode TS 插件报错。
- 内容架构：收藏条目统一放在 `content/zh|en/ui|animation/*.yml`，标题/描述/截图/date 都归 Nuxt Content 管；`i18n/locales/*.json` 只放导航、按钮、页面外壳等固定文案。
- 动画入库：从 `AiLaboratory.vue` 复制实现到 `app/components/SinAni/`，不得修改或清空实验室原稿；提取后的组件需保留并补齐算法注释，列表缩略图放在 `public/`。
- Nuxt Studio：本项目先只启用本地 `/_studio` 编辑，不配置生产 OAuth/Git 发布和外部媒体存储。
