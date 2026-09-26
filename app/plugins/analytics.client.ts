// Zählt Seitenaufrufe für die Statistik im Admin-Bereich (ohne Cookies).
// Admin-Seiten und angemeldete Nutzer (= die Imker selbst) werden nicht gezählt.
export default defineNuxtPlugin(() => {
  if (useDemoMode()) return

  const router = useRouter()
  const user = useSupabaseUser()
  let referrer: string | undefined = document.referrer || undefined
  let ready = false

  function track(path: string) {
    if (path.startsWith('/admin') || user.value) return
    const body = JSON.stringify({ path, referrer })
    referrer = undefined // nur beim Einstieg relevant
    const blob = new Blob([body], { type: 'application/json' })
    if (!navigator.sendBeacon?.('/api/track', blob)) {
      $fetch('/api/track', { method: 'POST', body, headers: { 'content-type': 'application/json' } }).catch(() => {})
    }
  }

  onNuxtReady(() => {
    ready = true
    track(router.currentRoute.value.path)
  })

  router.afterEach((to, from, failure) => {
    if (ready && !failure && to.path !== from.path) track(to.path)
  })
})
