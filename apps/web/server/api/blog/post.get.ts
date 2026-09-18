export default defineEventHandler(async () => {
  const targetUrl = 'https://sin6626.me/api/v2/posts/study%26think/react-vs-vue-learning-experience'
  try {
    return await $fetch(targetUrl)
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || 500,
      statusMessage: error?.message || 'Failed to fetch blog post from upstream'
    })
  }
})
