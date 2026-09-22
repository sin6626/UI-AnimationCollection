export const useApiFetch = createUseFetch(() => {
  const config = useRuntimeConfig()
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
      const requestPath = String(request)
      const baseURL = String(options.baseURL ?? '').replace(/\/$/, '')

      requestLog = {
        method: options.method ?? 'GET',
        url: requestPath.startsWith('http') ? requestPath : `${baseURL}/${requestPath.replace(/^\//, '')}`,
        params: options.query ?? options.params ?? null,
        body: options.body ?? null,
        headers: Object.fromEntries(new Headers(options.headers).entries())
      }

      console.log('[API Request]', JSON.stringify(requestLog, null, 2))
    },
    onRequestError({ error }) {
      console.error('[API Error]', JSON.stringify({
        statusCode: null,
        ...requestLog,
        response: {
          message: error.message
        }
      }, null, 2))
    },
    onResponse({ response }) {
      console.log('[API Response]', JSON.stringify({
        statusCode: response.status,
        ...requestLog,
        url: response.url || requestLog.url,
        response: response._data
      }, null, 2))
    },
    onResponseError({ response }) {
      console.error('[API Error]', JSON.stringify({
        statusCode: response.status,
        ...requestLog,
        url: response.url || requestLog.url,
        response: response._data
      }, null, 2))
    }
  }
})
