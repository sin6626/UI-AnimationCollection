import { ref } from 'vue'

// 首屏导航共用的双开门过渡；目标地址仍由 Nuxt 路由负责切换。
export function useEnter() {
  const localePath = useLocalePath()
  const isEntering = ref(false)
  const pageRef = ref<HTMLElement | null>(null)
  const dividerRef = ref<HTMLElement | null>(null)

  async function enter(path: string) {
    if (isEntering.value) return
    const to = localePath(path)
    const sourcePage = pageRef.value
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !sourcePage) {
      await navigateTo(to)
      return
    }

    isEntering.value = true

    const overlay = document.createElement('div')
    overlay.className = 'visit-door-overlay'
    overlay.setAttribute('aria-hidden', 'true')

    const dividerRect = dividerRef.value?.getBoundingClientRect()
    const hasDivider = dividerRect && dividerRect.height > 0
    overlay.style.setProperty('--door-line-top', `${hasDivider ? dividerRect.top : 16}px`)
    overlay.style.setProperty('--door-line-height', `${hasDivider ? dividerRect.height : window.innerHeight - 32}px`)

    // 各复制一份当前画面，分别裁成左、右半扇门。
    const panels = (['left', 'right'] as const).map((side) => {
      const panel = document.createElement('div')
      panel.className = `visit-door-panel visit-door-panel--${side}`

      const scene = document.createElement('div')
      scene.className = 'visit-door-scene'
      const snapshot = sourcePage.cloneNode(true) as HTMLElement
      snapshot.style.width = '100vw'
      snapshot.style.minWidth = '100vw'
      snapshot.style.transform = `translateY(-${window.scrollY}px)`
      snapshot.querySelector('[data-visit-divider]')?.remove()
      const clock = snapshot.querySelector<HTMLElement>('[data-door-time]')
      if (clock?.dataset.doorTime) clock.textContent = clock.dataset.doorTime
      scene.append(snapshot)

      const line = document.createElement('div')
      line.className = 'visit-door-line'
      panel.append(scene, line)
      overlay.append(panel)
      return panel
    })

    document.body.append(overlay)

    try {
      // navigateTo 返回时目标页可能仍在加载，尤其是开发环境首次访问。
      await navigateTo(to)
      if (sourcePage.isConnected) {
        await new Promise<void>((resolve, reject) => {
          const observer = new MutationObserver(() => {
            if (!sourcePage.isConnected) {
              clearTimeout(timeout)
              observer.disconnect()
              resolve()
            }
          })
          const timeout = setTimeout(() => {
            observer.disconnect()
            reject(new Error('目标页面渲染超时'))
          }, 15000)
          observer.observe(document.getElementById('__nuxt') ?? document.body, { childList: true, subtree: true })
          if (!sourcePage.isConnected) {
            clearTimeout(timeout)
            observer.disconnect()
            resolve()
          }
        })
      }
      // 旧页面卸载后再等浏览器绘制一帧，门后才会是目标页面。
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

      const animations = panels.map((panel, index) => panel.animate(
        [{ transform: 'translateX(0)' }, { transform: `translateX(${index === 0 ? '-' : ''}100%)` }],
        { duration: 850, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', fill: 'forwards' }
      ))
      await Promise.allSettled(animations.map(animation => animation.finished))
    } catch (error) {
      console.error('进入页面失败', error)
    } finally {
      overlay.remove()
      isEntering.value = false
    }
  }

  return { enter, pageRef, dividerRef }
}
