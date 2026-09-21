function requestHeaders(headers?: HeadersInit) {
  const values = Object.fromEntries(new Headers(headers).entries())
  if (values.authorization) values.authorization = '[REDACTED]'
  return values
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ request, options }) {
      console.info('[API Request]', JSON.stringify({
        method: String(options.method ?? 'GET').toUpperCase(),
        url: `${config.public.apiBase}${request}`,
        params: options.query ?? options.params ?? options.body ?? null,
        headers: requestHeaders(options.headers)
      }, null, 2))
    },
    onResponse({ request, options, response }) {
      console.info('[API Response]', JSON.stringify({
        statusCode: response.status,
        method: String(options.method ?? 'GET').toUpperCase(),
        url: `${config.public.apiBase}${request}`,
        params: options.query ?? options.params ?? options.body ?? null,
        headers: requestHeaders(options.headers),
        response: response._data
      }, null, 2))
    },
    onRequestError({ request, options, error }) {
      console.error('[API Error]', JSON.stringify({
        statusCode: 0,
        method: String(options.method ?? 'GET').toUpperCase(),
        url: `${config.public.apiBase}${request}`,
        params: options.query ?? options.params ?? options.body ?? null,
        headers: requestHeaders(options.headers),
        response: { message: error.message }
      }, null, 2))
    }
  })

  return {
    provide: { api }
  }
})
