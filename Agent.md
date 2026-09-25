# UI Animation Collection 开发规范与 Agent 指南

> **项目架构**：本仓库使用 pnpm workspace。Nuxt 应用位于 `apps/web/`，仓库根目录负责依赖锁定、命令编排和项目级文档。
> **后端协作**：前端由当前开发者负责，后端由 [HanniRis](https://github.com/HanniRis) 负责。

## 0. Workspace 约定

- 在仓库根目录统一执行 `pnpm install`，只维护根目录的 `pnpm-lock.yaml`。
- 根目录的 `pnpm dev`、`pnpm build`、`pnpm generate`、`pnpm preview`、`pnpm typecheck` 均代理到 `@ui-animation-collection/web`。
- Web 应用源码、Nuxt 配置、公开资源、Content 数据和环境变量分别位于 `apps/web/app/`、`apps/web/*.config.*`、`apps/web/public/`、`apps/web/content/` 和 `apps/web/.env`。
- 可复用包统一放入 `packages/`；没有明确复用边界时，不为满足目录形式而拆包。

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
- **全局背景与演示区透明度**：默认 layout 统一挂载 `PlumGrowthBackground`，Canvas 固定在所有前景内容下方；页面不得重复创建该背景。为了透出底层水墨梅花背景，公共壳组件 (`UIDemo` / `AniDemo`) 统一配置 `bg-transparent`；所有 UI 与动画演示区外层统一封装使用 `<DemoContainer>`（位于 `app/components/DemoContainer.vue`），默认保持 `bg-transparent` 透明背景与 `rounded-3xl` 居中布局。

## 4. 内容与国际化 (Nuxt Content & i18n)
- **内容数据归属**：条目元数据统一存放在 `content/zh|en/ui|animation/*.yml`，标题、描述、截图、date 等均归 Nuxt Content 管理。
- **多语言固定文案**：`i18n/locales/*.json` 仅用于存放导航、按钮、页面外壳等固定 UI 词条。
- **`useAsyncData` 语言绑定**：凡是依赖语言查询的 `useAsyncData`，其 key 必须动态绑定当前语言（如 `` `xxx-${locale.value}` ``），严禁使用静态 key，防止 Payload 缓存串语言。

## 5. 动效、3D 与音频技术规范
- **Nuxt 组件命名**：`app/components/SinAni/AniDemo.vue` 使用时写 `<SinAniDemo>`，不要写重复前缀 `<SinAniAniDemo>`。
- **GSAP 类型安全**：创建 `ctx`、`t1`、`resetAni` 等变量时显式标注类型（如 `let ctx: gsap.Context`、`let t1: gsap.core.Timeline`、`let resetAni: () => void`），避免 TS 检查报错。
- **动画入库流程**：`AiLaboratory.vue` 当前为斐波那契方块与圆弧的黄金螺旋近似动画实验页；SVG `viewBox` 随方块外框逐步扩展，并保持方形展示区域。后续入库时复制实现到 `app/components/SinAni/`，提取后的组件需补齐算法注释。全局梅花背景与动画库单株演示是独立用途，不得替换。
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
- **时间与时区敏感组件**：强依赖客户端本地当前时间/时区（如时钟、作息高亮、`dayOfYear` 等）的组件，必须使用 `<ClientOnly>` 包裹并提供统一的无高亮/占位 fallback。禁止让服务端的 UTC 时间参与初始 HTML 的高亮状态计算，防止部署在 Vercel 等平台时产生 SSR 水合错位。
- **开发服务与构建**：不要主动启动 Nuxt dev server（优先使用用户已常驻启动的服务）；非必要不跑完整 build，优先用文件 lint 或局部检查。
- **Nuxt Studio**：仅启用本地 `/_studio` 编辑，不配置生产发布与外部存储。

## 7. 用户认证与 OAuth 架构约定
- **当前鉴权方案**：基于 `nuxt-auth-utils` 模块实现 GitHub OAuth 与加密 Session 管理。
- **Composable 抽象层**：所有业务组件必须统一调用 `useAuth()`，禁止直接在页面顶层强耦合底层库；当后续切换为 [@HanniRis](https://github.com/HanniRis) 的后端服务时，仅需在 `app/composables/useAuth.ts` 中对接后端接口，确保 UI 层零成本无缝迁移。
- **OAuth 服务端路由**：GitHub 授权回调位于 `server/routes/auth/github.get.ts`。

## 8. Shouping 独立首屏页约定
- **页面路由**：`app/pages/index.vue` 是默认入口 `/`（英文为 `/en`）；原内容首页位于 `app/pages/home.vue`，对应 `/home`（英文为 `/en/home`）。
- **独立布局**：首屏设置 `layout: false`，不继承默认 layout 的侧栏与公共梅花背景，使用独立的全屏居中沉浸式框架。
- **栅格规范**：大屏端严格遵循 1:1 左右对称栅格（`grid-cols-1 lg:grid-cols-2`），小屏响应式折叠为单列。
- **组件拆分**：
  - `app/components/Shouping/HomeLeft.vue`：个人品牌、Logo 头像、一言毛玻璃卡片与社交媒体矩阵。
  - `app/components/Shouping/HomeRight.vue`：每日诗词卡片、实时时间/天气卡片与快捷网站导航矩阵。



