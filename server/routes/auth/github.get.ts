export default defineOAuthGitHubEventHandler({
  config: {
    // 登录流程要求获取Github用户的Email
    emailRequired: false
  },
  async onSuccess(event, { user }) {
    // console.log("event", event);
    // console.log("user", user);
    
    await setUserSession(event, {
      user: {
        id: user.id,
        login: user.login,
        name: user.name || user.login,
        avatar: user.avatar_url,
        htmlUrl: user.html_url,
        email: user.email || ""
      },
      loggedInAt: Date.now()
    })
    return sendRedirect(event, '/')
  },
  async onError(event, error) {
    console.error('GitHub OAuth 登录授权失败:', error)
    return sendRedirect(event, '/?error=github_auth_failed')
  }
})
