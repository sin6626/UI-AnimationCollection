interface ApiResult<T> {
  code: string | number,
  message: string,
  data: T
}

export const loginGithub = () => {
  return useApiFetch<ApiResult<string>>('/auth/loginGithub', {
    method: "post",
    immediate: false
  })
}