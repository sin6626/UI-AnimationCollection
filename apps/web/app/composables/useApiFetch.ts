export const useApiFetch = createUseFetch(() => {
  // 获取在nuxt.config里面的对于useRuntime的配置
  const config = useRuntimeConfig()
  // console.log(config);
  let requestLog = {
    method: 'GET',
    url: '',
    params: null as unknown,
    body: null as unknown,
    headers: {} as Record<string, string>
  }

  return {
    baseURL: config.public.apiBase,
    onRequest({ request, options }) {
      // 接口信息只在客户端打印
      if (!import.meta.client ) return

      const requestPath = String(request)
      const baseURL = String(options.baseURL ?? '').replace(/\/$/, '')

      requestLog = {
        method: options.method ?? 'GET',
        url: requestPath.startsWith('http') ? requestPath : `${baseURL}/${requestPath.replace(/^\//, '')}`,
        params: options.query ?? options.params ?? null,
        body: options.body ?? null,
        headers: Object.fromEntries(new Headers(options.headers).entries())
      }

      console.log('[API Request]', requestLog)
    },
    onRequestError({ error }) {
      if (!import.meta.client ) return
      
      console.error('[API Error]', JSON.stringify({
        statusCode: null,
        ...requestLog,
        response: {
          message: error.message
        }
      }, null, 2))
    },
    onResponse({ response }) {
      if (!import.meta.client ) return

      console.log('[API Response]', JSON.stringify({
        statusCode: response.status,
        ...requestLog,
        url: response.url || requestLog.url,
        response: response._data
      }, null, 2))
    },
    onResponseError({ response }) {
      if (!import.meta.client ) return

      console.error('[API Error]', JSON.stringify({
        statusCode: response.status,
        ...requestLog,
        url: response.url || requestLog.url,
        response: response._data
      }, null, 2))
    }
  }
})
