# 项目协作约定

- 使用中文沟通；Git 提交采用 Conventional Commits，描述用中文。
- 禁止批量删除文件或目录。删除时一次只指定一个明确的文件路径；临时文件和临时工作树放在项目内。
- 前端按设计稿 1:1 还原。需要图片或切图不足时向用户索取，不用 CSS 或 SVG 臆造设计素材。
- 后端接口文档缺少必要的参数定义时，先向用户确认细节；接口响应拦截器应记录请求与响应信息。
- 优先使用 Codex 的 GitHub 插件管理仓库；插件不可用时再考虑本机 GitHub CLI。
- 上下文压缩时检查并更新此文件。

## AI 实验室 FIM 补全

- 编辑器按语言保存独立 Monaco 文本模型和视图状态；首次打开为空白，切回恢复内容、光标、滚动与撤销历史。模型切换时取消旧补全请求，卸载时释放所有模型。
- TypeScript 使用 Monaco 自带 tsWorker 检查语法与类型；Python/Go 使用 `@lezer/python`/`@lezer/go` 在浏览器内解析语法并设置错误标记，不执行代码；Python/Go 暂不提供变量类型、导入包等语义诊断，纯文本不做诊断。
- Monaco 的补全实现位于 `apps/web/app/pages/ui/MonacoEditor.client.vue`：450ms 防抖，独立取消请求，通过模型版本和光标快照排除过期建议；支持 Tab 接受、Esc 拒绝、中文输入法与缩进替换。
- 同源接口为 Nuxt 的 `apps/web/server/api/completion.post.ts`，调用 DeepSeek `/beta/completions`；不使用 `apps/server`，模型沿用 Demo 的 `deepseek-flash`。前端必须传入 `language`（typescript/python/go/plaintext）；服务端为代码语言添加文件名与语言提示到 prompt，纯文本保持原样。提示不写入编辑器，也不能将已经存在的其他语言代码自动转换。
- API Key 由页面内存通过 Authorization 请求头传递，不持久化、不写入日志；接口日志中的 Key 必须脱敏。
- `patches/monaco-editor@0.57.0.patch` 修复 Monaco 的局部取消异常并关闭有初始化问题的首次编辑预览引导。升级 Monaco 时必须复查补丁并运行浏览器回归。
- 校验：`pnpm typecheck`、`git diff --check`、`node --test apps/web/scripts/fim.test.ts apps/web/scripts/codeSyntax.test.ts`。浏览器回归：运行开发服务后执行 `node apps/web/scripts/fim.browser.mjs`，可通过 `PLAYWRIGHT_MODULE` 指定已有 Playwright 的 `index.mjs` 路径，通过 `TEST_BASE_URL` 指定服务地址。
- 模拟接口的浏览器回归不代表真实 DeepSeek 调用成功；未提供真实 Key 时不得声称真实补全已验证。
