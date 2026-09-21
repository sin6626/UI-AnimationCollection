type ApiResult<T> = {
  code: string | number
  message: string
  data: T
}

export function useAuth() {
  const { $api } = useNuxtApp()
  const isLoggingIn = useState('auth:logging-in', () => false)

  async function loginWithGithub() {
    if (!import.meta.client || isLoggingIn.value) return

    isLoggingIn.value = true
    try {
      const response = await $api<ApiResult<string>>('/auth/loginGithub', {
        method: 'POST'
      })

      if (String(response.code) !== '200' || !response.data) {
        throw new Error(response.message || 'GitHub 登录地址获取失败')
      }

      window.location.assign(response.data)
    } finally {
      isLoggingIn.value = false
    }
  }

  return {
    isLoggingIn,
    loginWithGithub
  }
}
