// FIM 根据上下文续写；文件名和语言注释只发送给模型，不写入用户文档。
const languageHints: Record<string, string> = {
  typescript: '// File: main.ts\n// Language: TypeScript. Complete using TypeScript syntax only.\n',
  python: '# File: main.py\n# Language: Python. Complete using Python syntax only.\n',
  go: '// File: main.go\n// Language: Go. Complete using Go syntax only.\n',
  plaintext: ''
}

// 与 Demo 一样使用原生 fetch；Key 来自页面请求头，不读取或保存到环境文件。
export async function completeFIM(request: Request): Promise<Response> {
  let body: unknown
  try {
    const text = await request.text()
    if (Buffer.byteLength(text) > 128_000) {
      return Response.json({ error: 'invalidInput' }, { status: 413 })
    }
    body = JSON.parse(text)
  } catch {
    return Response.json({ error: 'invalidInput' }, { status: 400 })
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)
    || Object.keys(body).some(key => key !== 'prefix' && key !== 'suffix' && key !== 'language')
    || !('prefix' in body) || typeof body.prefix !== 'string' || !body.prefix.trim() || body.prefix.length > 24000
    || !('suffix' in body) || typeof body.suffix !== 'string' || body.suffix.length > 12000
    || !('language' in body) || typeof body.language !== 'string' || !Object.hasOwn(languageHints, body.language)) {
    return Response.json({ error: 'invalidInput' }, { status: 400 })
  }
  const apiKey = request.headers.get('authorization')?.match(/^Bearer ([^\s]{1,512})$/)?.[1]
  if (!apiKey) return Response.json({ error: 'missingKey' }, { status: 401 })

  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(25_000)])
  const started = performance.now()
  const params = { model: 'deepseek-flash', prompt: languageHints[body.language] + body.prefix, suffix: body.suffix, max_tokens: 128, temperature: 0 }
  const url = 'https://api.deepseek.com/beta/completions'
  try {
    const response = await fetch(url, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(params)
    })
    // 保留接口调用记录，但绝不打印真实 Key 或上游原始错误正文。
    if (!response.ok) {
      console.info('[FIM upstream]', { statusCode: response.status, method: 'POST', url, headers: { Authorization: 'Bearer [REDACTED]' }, params, response: { error: 'upstreamError' } })
      const error = response.status === 401 ? 'invalidKey' : response.status === 402 ? 'insufficientBalance' : response.status === 429 ? 'rateLimited' : 'upstreamError'
      return Response.json({ error }, { status: 502 })
    }
    const data = await response.json()
    const completion = data?.choices?.[0]?.text
    if (typeof completion !== 'string') {
      console.info('[FIM upstream]', { statusCode: response.status, method: 'POST', url, headers: { Authorization: 'Bearer [REDACTED]' }, params, response: { error: 'invalidResponse' } })
      return Response.json({ error: 'invalidResponse' }, { status: 502 })
    }
    const result = { completion, elapsedMs: Math.round(performance.now() - started) }
    console.info('[FIM upstream]', { statusCode: response.status, method: 'POST', url, headers: { Authorization: 'Bearer [REDACTED]', 'Content-Type': 'application/json' }, params, response: result })
    return Response.json(result)
  } catch {
    const error = signal.aborted ? 'timeout' : 'networkError'
    console.info('[FIM upstream]', { statusCode: null, method: 'POST', url, headers: { Authorization: 'Bearer [REDACTED]' }, params, response: { error } })
    return Response.json({ error }, { status: 502 })
  }
}
