declare module '#auth-utils' {
  interface User {
    id: number
    login: string
    name: string
    avatar: string
    htmlUrl: string
    email?: string
  }

  interface UserSession {
    user: User
    loggedInAt: number
  }
}

export {}
