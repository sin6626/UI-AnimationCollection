export default defineNuxtPlugin(() => {
  const router = useRouter()
  router.beforeEach((to) => {
    if (to.fullPath.startsWith('/sw.js')) {
      return false
    }
  })
})
