import assert from 'node:assert/strict'
import { test } from 'node:test'
import { completeFIM } from '../server/utils/fim.ts'

test('FIM 参数、原始空白、Key 转发、超时信号和错误隔离', async (context) => {
  const input = { prefix: 'def fib(n):\n    ', suffix: '\nprint(fib(10))', language: 'python' }
  const request = (body: unknown, key = 'test-key') => new Request('http://localhost/api/completion', {
    method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: JSON.stringify(body)
  })
  let calls = 0
  const logs: string[] = []
  context.mock.method(console, 'info', (...args: unknown[]) => logs.push(JSON.stringify(args)))
  const upstream = context.mock.method(globalThis, 'fetch', async (_url: unknown, options: RequestInit) => {
    calls++
    assert.equal(_url, 'https://api.deepseek.com/beta/completions')
    const body = JSON.parse(options.body as string)
    assert.equal(body.prompt, '# File: main.py\n# Language: Python. Complete using Python syntax only.\n' + input.prefix)
    assert.equal(body.suffix, input.suffix)
    assert.equal(body.model, 'deepseek-flash')
    assert.equal((options.headers as Record<string, string>).Authorization, 'Bearer test-key')
    assert.ok(options.signal)
    return Response.json({ choices: [{ text: 'return fib(n-1) + fib(n-2)\n' }] })
  })
  for (const body of [null, [], { prefix: '', suffix: '' }, { prefix: 'a', suffix: 1 }, { prefix: 'a' }, { prefix: 'a'.repeat(24001), suffix: '' }, { ...input, model: 'other' }, { ...input, language: 'c' }, { ...input, language: 1 }, { prefix: 'a', suffix: '' }]) {
    assert.equal((await completeFIM(request(body))).status, 400)
  }
  assert.equal((await completeFIM(request(input, ''))).status, 401)
  assert.equal(calls, 0)
  const result = await completeFIM(request(input))
  assert.equal(result.status, 200)
  assert.equal((await result.json()).completion, 'return fib(n-1) + fib(n-2)\n')
  assert.ok(logs.every(log => !log.includes('test-key')))
  // 仅有自然语言注释时也必须带语言提示；纯文本不注入代码注释。
  for (const [language, hint] of [
    ['typescript', '// File: main.ts\n// Language: TypeScript. Complete using TypeScript syntax only.\n'],
    ['go', '// File: main.go\n// Language: Go. Complete using Go syntax only.\n'],
    ['plaintext', '']
  ]) {
    upstream.mock.mockImplementation(async (_url: unknown, options: RequestInit) => {
      const params = JSON.parse(options.body as string)
      assert.equal(params.prompt, hint + '// 写一个二分查找的函数\n')
      assert.equal(params.suffix, '')
      assert.ok(!('language' in params), '语言提示放入 prompt，不虚构 DeepSeek 字段')
      return Response.json({ choices: [{ text: 'completion' }] })
    })
    assert.equal((await completeFIM(request({ prefix: '// 写一个二分查找的函数\n', suffix: '', language }))).status, 200)
  }
  upstream.mock.mockImplementation(async () => new Response('secret upstream data', { status: 401 }))
  const failed = await completeFIM(request(input))
  assert.equal(failed.status, 502)
  assert.deepEqual(await failed.json(), { error: 'invalidKey' })
  upstream.mock.mockImplementation(async () => Response.json({ choices: [{}] }))
  assert.deepEqual(await (await completeFIM(request(input))).json(), { error: 'invalidResponse' })
  upstream.mock.mockImplementation(async (_url: unknown, options: RequestInit) => {
    assert.equal(options.signal?.aborted, true)
    throw new Error('secret transport error')
  })
  const controller = new AbortController()
  controller.abort()
  const canceled = await completeFIM(new Request(request(input), { signal: controller.signal }))
  assert.deepEqual(await canceled.json(), { error: 'timeout' })
})
