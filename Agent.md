# SinFrontend 开发规范与 Agent 指南

> **全局协作与 Monorepo 规范**：请参阅根目录 [Agent.md](file:///h:/Sin6626/SinUA/Agent.md)。  
> **架构分工**：本项目为 Monorepo，前端由当前开发者负责（`SinFrontend/`），后端由 [HanniRis](https://github.com/HanniRis) 负责。

---

## 1. 前后端协作与接口调用
- **接口文档严谨性**：严格依照后端 [HanniRis](https://github.com/HanniRis) 的接口文档开发。若遇入参/出参不明确、缺少枚举定义等问题，**严禁猜测，必须暂停并向用户提出具体疑问以确认**。
- **请求/响应日志打印**：网络请求/响应拦截器必须全量在控制台输出标准 JSON 格式日志（含 `statusCode`、`method`、`url`、`params`/请求头、`response`）。
- **外部跨域 API 代理**：若前端需请求第三方/外部严格限制 CORS 的接口（如外部博客 API），统一在 `server/api/` 下创建 Nitro 服务端 API 代理路由转发，禁止前端直连引发浏览器 CORS 阻断。

## 2. 静态资源与样式规范
- **UI 1:1 还原**：严格 1:1 还原设计图，缺少图片资源时必须直接索要切图，**严禁使用 CSS/SVG 强行手绘替代**。
- **资源存放**：新增资源优先放在 `app/assets/` 下，避免污染项目根目录；缩略图等公共资源放在 `public/`。
- **字体来源**：优先使用 Google Fonts / 官方仓库文件，保留清晰语义的文件名。

## 3. 页面骨架与背景体系
- **页面骨架**：默认 layout 统一维护全宽 `UContainer + UMain + UPage` 和全局侧栏；页面级 `UPage` 可以保留，但**严禁在页面内重复创建 `UMain` 或 `UContainer`**。
- **全局背景**：默认 layout 统一挂载 `PlumGrowthBackground`，Canvas 固定在所有前景内容下方；页面不得重复创建该背景。

## 4. 内容与国际化 (Nuxt Content & i18n)
- **内容数据归属**：条目元数据统一存放在 `content/zh|en/ui|animation/*.yml`，标题、描述、截图、date 等均归 Nuxt Content 管理。
- **多语言固定文案**：`i18n/locales/*.json` 仅用于存放导航、按钮、页面外壳等固定 UI 词条。
- **`useAsyncData` 语言绑定**：凡是依赖语言查询的 `useAsyncData`，其 key 必须动态绑定当前语言（如 `` `xxx-${locale.value}` ``），严禁使用静态 key，防止 Payload 缓存串语言。

## 5. 动效、3D 与音频技术规范
- **Nuxt 组件命名**：`app/components/SinAni/AniDemo.vue` 使用时写 `<SinAniDemo>`，不要写重复前缀 `<SinAniAniDemo>`。
- **GSAP 类型安全**：创建 `ctx`、`t1`、`resetAni` 等变量时显式标注类型（如 `let ctx: gsap.Context`、`let t1: gsap.core.Timeline`、`let resetAni: () => void`），避免 TS 检查报错。
- **动画入库流程**：从 `AiLaboratory.vue` 复制实现到 `app/components/SinAni/`，**不得修改或清空实验室原稿**；提取后的组件需补齐算法注释。全局梅花背景与动画库单株演示是独立用途，不得替换。
- **3D 音频可视化组件 (Meteor Soundwave / Three.js)**：
  - 着色器统一在 `app/components/SinUI/shaders/`（如 `stageVertex.glsl`, `stageFragment.glsl`），使用 `?raw` 导入。
  - Web Audio 与 Three.js 逻辑封装在 `app/components/SinUI/composables/useMeteorSoundwave.ts`。
  - 组件在 `app/components/SinUI/MeteorSoundwave.vue`，页面在 `app/pages/ui/meteor-soundwave.vue`。
  - 缩略图置于 `public/`，元数据分别在 `content/zh|en/ui/meteor-soundwave.yml`。
- **ShiroNav 胶囊导航栏组件 (SinUI / Motion)**：
  - 组件位于 `app/components/SinUI/ShiroNav.vue`，页面在 `app/pages/ui/shiro-nav.vue`，缩略图置于 `public/ShiroNav.png`。
  - 运用 Motion 的 `layout-id` 实现跨 Tab 的图标跳跃飞跃（`layout-id="active-nav-icon"`）与底部激光指示线平滑流动（`layout-id="active-nav-line"`）。
  - 文字通过 `layout` 属性与 `mass: 0.8` 惯性质量参数实现随图标插入的平滑重排。
  - 深度适配明暗双色模式：光明模式主色为 `rgb(138, 194, 187)`（薄荷青/灰湖绿），黑暗模式为 `pink-400/80`（粉红流光）。
- **Music 沉浸页 (`app/pages/Music.vue`)**：
  - `layout: false`，不挂默认导航、侧栏、页脚和全局梅花背景；入口仅在 `SidebarMusicPlayer.vue` 的 3D 可视化按钮。
  - 顶部 HUD 提供 Back 返回主页入口；进度条与音量条采用流光渐变（`from #2255ff via #8ef0de to #44ddff`）。

## 6. SSR / Prerender 兼容与构建规范
- **纯客户端库**：强依赖 DOM/Browser API（如 `MouseEvent`, `AudioContext`）的第三方组件（如 `@applemusic-like-lyrics`）严禁在页面顶层静态 import；必须通过 `onMounted` 动态 `import()` 或 `defineAsyncComponent` 加载并配合 `<ClientOnly>` 包裹。
- **开发服务与构建**：不要主动启动 Nuxt dev server（优先使用用户已常驻启动的服务）；非必要不跑完整 build，优先用文件 lint 或局部检查。
- **Nuxt Studio**：仅启用本地 `/_studio` 编辑，不配置生产发布与外部存储。

## 7. 用户认证与 OAuth 架构约定
- **当前鉴权方案**：基于 `nuxt-auth-utils` 模块实现 GitHub OAuth 与加密 Session 管理。
- **Composable 抽象层**：所有业务组件必须统一调用 `useAuth()`，禁止直接在页面顶层强耦合底层库；当后续切换为 [@HanniRis](https://github.com/HanniRis) 的后端服务时，仅需在 `app/composables/useAuth.ts` 中对接后端接口，确保 UI 层零成本无缝迁移。
- **OAuth 服务端路由**：GitHub 授权回调位于 `server/routes/auth/github.get.ts`。


