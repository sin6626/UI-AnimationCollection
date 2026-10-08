import { completeFIM } from '../utils/fim'

// Nitro 服务层代理 DeepSeek；浏览器只请求同源接口，不直接连接模型服务。
export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const controller = new AbortController()
  // 用户继续输入或离开页面时，浏览器会取消请求，同时终止上游生成。
  const onClose = () => {
    if (!event.node.res.writableEnded) controller.abort()
  }
  event.node.res.on('close', onClose)
  try {
    const request = toWebRequest(event)
    return await completeFIM(new Request(request, {
      signal: AbortSignal.any([request.signal, controller.signal])
    }))
  } finally {
    event.node.res.off('close', onClose)
  }
})
