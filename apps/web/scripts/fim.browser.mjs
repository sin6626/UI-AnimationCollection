// 可复用 Demo 或其他已安装的 Playwright，不给应用增加测试依赖。
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
import assert from 'node:assert/strict'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => { errors.push(error.message); console.log('PAGEERROR', error.message) })
  let text = '    return a + b;'
  let delay = 0
  let responseStatus = 200
  let calls = 0
  let lastRequest
  await page.route('**/api/completion', async route => {
    calls++
    lastRequest = route.request().postDataJSON()
    assert.equal(route.request().headers().authorization, 'Bearer test-key')
    const response = text
    await new Promise(resolve => setTimeout(resolve, delay))
    await route.fulfill({ status: responseStatus, json: responseStatus === 200 ? { completion: response, elapsedMs: 123 } : { error: 'invalidKey' } }).catch(() => {})
  })
  await page.goto(`${process.env.TEST_BASE_URL || 'http://localhost:3000'}/AiLaboratory`)
  await page.locator('.monaco-editor').waitFor()
  await page.getByPlaceholder('DeepSeek API Key').fill('test-key')
  // 从 Vue 开发实例读取已有编辑器，不在产品代码中增加测试全局变量。
  const getEditor = () => {
    let element = document.querySelector('.monaco-editor')
    while (element) {
      const editor = element.__vueParentComponent?.setupState?.editor
      if (editor?.getValue) return editor
      element = element.parentElement
    }
    throw new Error('Editor not found')
  }
  const editorExpr = `(${getEditor.toString()})()`
  const setup = async (value, lineNumber, column) => page.evaluate(`(() => { const e = ${editorExpr}; e.setValue(${JSON.stringify(value)}); e.setPosition({lineNumber:${lineNumber},column:${column}}); e.focus(); })()`)
  const value = () => page.evaluate(`${editorExpr}.getValue()`)
  const position = () => page.evaluate(`${editorExpr}.getPosition()`)
  const switchLanguage = async (name) => {
    await page.getByRole('button', { name: '选择代码语言' }).click()
    await page.getByRole('button', { name, exact: false }).click()
  }
  const draft = 'const add = (a: number, b: number) => {\n\n}'
  await setup(draft, 2, 1)
  await page.getByRole('button', { name: '生成补全' }).click()
  await page.locator('.ghost-text-decoration').first().waitFor()
  assert.equal(await value(), draft)
  await page.keyboard.press('Tab')
  assert.equal(await value(), draft.replace('\n\n', '\n' + text + '\n'))
  assert.equal(lastRequest.suffix, '\n}')
  assert.equal(lastRequest.language, 'typescript')
  await page.keyboard.press('Meta+z')
  assert.equal(await value(), draft)
  await page.keyboard.press('Escape')
  const tsPosition = await position()
  // Python 缩进减少时先展示编辑预览，接受后才改代码，且可整体撤销。
  await page.getByRole('button', { name: '选择代码语言' }).hover()
  await page.getByRole('button', { name: 'Python' }).click()
  assert.equal(await value(), '', '首次切到 Python 应是独立空白模型')
  const pythonDraft = 'def fib(n):\n    if n < 2:\n        return n\n        '
  text = '    return fib(n - 1) + fib(n - 2)'
  await setup(pythonDraft, 4, 9)
  await page.getByRole('button', { name: '生成补全' }).click()
  await page.waitForFunction(`() => ${editorExpr}.getAction('fim.acceptSuggestion').isSupported()`)
  assert.equal(await value(), pythonDraft)
  await page.waitForTimeout(300)
  await page.keyboard.press('Tab')
  assert.equal(await value(), pythonDraft.slice(0, -8) + text)
  await page.keyboard.press('Meta+z')
  assert.equal(await value(), pythonDraft)
  await page.keyboard.press('Escape')
  // 每种语言恢复自己的文档和光标，undo/redo 仍属于原来的模型。
  await page.getByPlaceholder('DeepSeek API Key').fill('')
  const pyPosition = await position()
  await switchLanguage('TypeScript')
  assert.equal(await value(), draft)
  assert.deepEqual(await position(), tsPosition)
  await switchLanguage('Python')
  assert.equal(await value(), pythonDraft)
  assert.deepEqual(await position(), pyPosition)
  await page.evaluate(`${editorExpr}.focus()`)
  await page.keyboard.press('Meta+Shift+z')
  assert.equal(await value(), pythonDraft.slice(0, -8) + text, '切换语言不能丢失重做记录')
  await page.keyboard.press('Meta+z')
  assert.equal(await value(), pythonDraft)
  await switchLanguage('Go')
  assert.equal(await value(), '', '首次切到 Go 应是空白')
  await setup('package main', 1, 13)
  await switchLanguage('TypeScript')
  assert.equal(await value(), draft)
  await switchLanguage('Go')
  assert.equal(await value(), 'package main')
  await switchLanguage('Python')
  await page.getByPlaceholder('DeepSeek API Key').fill('test-key')
  // Python 下粘贴 TS 代码显示语法错误，修正为合法 Python 后错误清除。
  await page.getByPlaceholder('DeepSeek API Key').fill('')
  await setup('// 注释\nfunction add(a: number) { return a; }', 2, 1)
  await page.locator('.squiggly-error').first().waitFor()
  await setup('def add(a):\n    return a\n', 2, 13)
  await page.waitForFunction(() => !document.querySelector('.squiggly-error'))
  // Go 下粘贴 TS、输入错误 Go 都应报错，修正后错误消失。
  await switchLanguage('Go')
  await setup('function add(a: number) { return a; }', 1, 1)
  await page.locator('.squiggly-error').first().waitFor()
  await setup('package main\nfunc main( {', 2, 1)
  await page.locator('.squiggly-error').first().waitFor()
  await setup('package main\nfunc main() {}\n', 2, 15)
  await page.waitForFunction(() => !document.querySelector('.squiggly-error'))
  // TS 使用自身 Worker，分别核对语法错误和类型错误，不增加重复的 TS 解析器。
  await switchLanguage('TypeScript')
  await setup('const x = ;', 1, 1)
  await page.locator('.squiggly-error').first().waitFor()
  await setup('const x: string = 123;', 1, 1)
  await page.waitForFunction(`() => ${editorExpr}.getModel().getAllDecorations().some(d => d.options.className === 'squiggly-error' && d.range.startColumn === 7 && d.range.endColumn === 8)`)
  await setup('const x: string = "valid";', 1, 1)
  await page.waitForFunction(() => !document.querySelector('.squiggly-error'))
  await setup(draft, 2, 1)
  await switchLanguage('Python')
  await page.getByPlaceholder('DeepSeek API Key').fill('test-key')
  // 跨模型切换后，即使切回原模型，也不能显示已经取消的响应。
  text = 'STALE_LANGUAGE_RESULT'
  delay = 900
  await setup('hello', 1, 6)
  await page.getByRole('button', { name: '生成补全' }).click()
  await page.waitForTimeout(150)
  await switchLanguage('TypeScript')
  assert.equal(await value(), draft)
  await switchLanguage('Python')
  await page.waitForTimeout(1100)
  assert.equal(await value(), 'hello')
  assert.equal(await page.locator('.ghost-text-decoration').count(), 0)
  // 过期响应不能展示；继续输入后的新请求允许展示新位置的建议。
  text = 'STALE_RESULT'
  delay = 900
  await setup('hello', 1, 6)
  await page.getByRole('button', { name: '生成补全' }).click()
  await page.waitForTimeout(150)
  await page.keyboard.type('x')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(1200)
  assert.equal(await value(), 'hellox')
  assert.equal(await page.locator('.ghost-text-decoration').count(), 0)
  // 不填 Key 不请求；首次切换到纯文本应是独立空白文档。
  await page.getByPlaceholder('DeepSeek API Key').fill('')
  const before = calls
  await setup('abc', 1, 4)
  await page.keyboard.type('d')
  await page.waitForTimeout(650)
  assert.equal(calls, before)
  await page.getByRole('button', { name: '选择代码语言' }).click()
  await page.getByRole('button', { name: /无/ }).click()
  assert.equal(await page.evaluate(`${editorExpr}.getModel().getLanguageId()`), 'plaintext')
  assert.equal(await value(), '')
  await switchLanguage('Python')
  assert.equal(await value(), 'abcd')
  await switchLanguage(/无/)
  assert.equal(await value(), '')
  // 输入后自动请求；Esc 拒绝后 Tab 仍是普通缩进。
  delay = 0
  text = ' suggestion'
  await page.getByPlaceholder('DeepSeek API Key').fill('test-key')
  await setup('hello', 1, 6)
  await page.keyboard.type('x')
  await page.locator('.ghost-text-decoration').first().waitFor()
  assert.equal(await value(), 'hellox')
  await page.keyboard.press('Escape')
  await page.keyboard.press('Tab')
  assert.ok(!(await value()).includes('suggestion'))
  await page.keyboard.press('Escape')
  // 输入法正在组字时不生成补全，确认输入后才请求。
  await setup('hello', 1, 6)
  await page.keyboard.press('Escape')
  const cdp = await page.context().newCDPSession(page)
  const beforeIME = calls
  await cdp.send('Input.imeSetComposition', { text: '中', selectionStart: 1, selectionEnd: 1 })
  await page.waitForTimeout(650)
  assert.equal(calls, beforeIME)
  await cdp.send('Input.insertText', { text: '中' })
  await page.locator('.ghost-text-decoration').first().waitFor()
  assert.ok(calls > beforeIME)
  await page.getByPlaceholder('DeepSeek API Key').fill('')
  await page.waitForFunction(() => !document.querySelector('.ghost-text-decoration'))
  // API 错误使用本地化提示，不插入代码，也不向用户展示上游正文。
  responseStatus = 502
  await page.getByPlaceholder('DeepSeek API Key').fill('test-key')
  await setup('hello', 1, 6)
  await page.getByRole('button', { name: '生成补全' }).click()
  await page.getByRole('status').filter({ hasText: 'API Key 无效' }).waitFor()
  assert.equal(await value(), 'hello')
  // 纯文本不会因为内容像错误代码而产生语法诊断。
  await page.getByPlaceholder('DeepSeek API Key').fill('')
  await setup('function ??? {', 1, 1)
  await page.waitForTimeout(300)
  assert.equal(await page.locator('.squiggly-error').count(), 0)
  console.log(JSON.stringify({ calls, errors }))
  assert.deepEqual(errors, [])
} finally {
  await browser.close()
}
