# UI Animation Collection

基于 Nuxt 的 UI 与动画效果收藏项目，采用 pnpm workspace 管理。

## 项目结构

```text
.
├─ apps/
│  └─ web/          # Nuxt Web 应用
├─ dev-tools/       # 项目开发辅助工具
├─ docs/            # 项目文档
├─ package.json     # Workspace 命令入口
└─ pnpm-workspace.yaml
```

`packages/*` 已在 workspace 中预留，当前尚未拆分共享包。

## 环境要求

- Node.js 22.5.0 或更高版本
- pnpm 11.20.0

## 安装依赖

```bash
pnpm install
```

## 常用命令

在仓库根目录执行：

```bash
pnpm dev
pnpm build
pnpm generate
pnpm preview
pnpm typecheck
```

这些命令会代理到 `@ui-animation-collection/web`。也可以显式执行：

```bash
pnpm --filter @ui-animation-collection/web dev
```

本地环境变量写入 `apps/web/.env`，可参考 `apps/web/.env.example`。
