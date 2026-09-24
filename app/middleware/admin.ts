export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login' || to.path === '/admin/passwort') return
  if (useDemoMode()) return // Demo: Admin-Bereich frei ansehbar

  const supabase = useDb()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return navigateTo({ path: '/admin/login', query: { redirect: to.fullPath } })

  const isAdmin = useState<boolean | null>('is-admin', () => null)
  if (isAdmin.value === null) {
    // RLS: Nur Admins sehen Einträge in "admins" – Nicht-Admins bekommen null
    const { data } = await supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
    isAdmin.value = Boolean(data)
  }
  if (!isAdmin.value) {
    await supabase.auth.signOut()
    isAdmin.value = null
    return navigateTo({ path: '/admin/login', query: { error: 'forbidden' } })
  }
})
