/**
 * 统一用户鉴权 Composable
 * - 当前实现: 基于 nuxt-auth-utils (方案一)
 * - 架构解耦: 后续切换为后端 (HanniRis) 接口鉴权时, 只需在本文件内部替换请求实现, 上层 UI 组件零改动
 */

/**
 * 用户信息接口定义
 */
export interface AuthUser {
  id?: number
  login?: string
  name?: string
  avatar?: string
  htmlUrl?: string
  email?: string
}

export function useAuth() {
  // useUserSession 是nuxt-auth-utils模块里的
  // loggedIn: 表示用户是否已经登录, 是一个响应式的Ref
  // user: 用户登录的状态, 写在接口里面的, session比user范围更大
  const { loggedIn, user: rawUser, session, fetch: fetchSession, clear: clearSession } = useUserSession()

  // 显式断言类型为 AuthUser，解决 VSCode TS 语言插件类型推断报错问题
  const user = rawUser as ComputedRef<AuthUser | null>

  // console.log( "loggedIn", loggedIn);
  // console.log( "user", user);
  // console.log( "session", session);

  /**
   * 跳转发起 GitHub OAuth 授权登录
   */
  function loginWithGithub() {
    // 判断下是不是在客户端的环境
    if (import.meta.client) {
      // nuxt-auth-utils 自动封装好的, Nitro 服务端拦截后，自动帮你重定向跳去 GitHub 官方授权页
      window.location.href = '/auth/github'
    }
  }

  /**
   * 退出当前登录态
   */
  async function logout() {
    await clearSession()
  }

  return {
    loggedIn,
    user,
    session,
    loginWithGithub,
    logout,
    fetchSession
  }
}
