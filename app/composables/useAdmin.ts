import type { EventItem, GalleryImage, Message, PageViewStats, Post, Product, Profile, SiteSettings, TeamMember } from '~/types/models'
import { demoEvents, demoGallery, demoPosts, demoProducts, demoSettings } from '~/utils/demo'

type TableMap = {
  products: Product
  posts: Post
  events: EventItem
  gallery_images: GalleryImage
  messages: Message
}
type TableName = keyof TableMap

const demoMessages: Message[] = [
  { id: 'm1', name: 'Anna Beispiel', email: 'anna@example.com', phone: null, subject: 'Anfrage: Sommertracht', message: 'Hallo! Könnt ihr mir 2 Gläser Sommertracht für Samstag zurücklegen? Liebe Grüße', read: false, created_at: new Date(Date.now() - 3600e3).toISOString() },
  { id: 'm2', name: 'Peter Probe', email: 'peter@example.com', phone: '0170 1234567', subject: null, message: 'Gibt es auch Wabenhonig?', read: true, created_at: new Date(Date.now() - 3 * 864e5).toISOString() }
]

// Im Demo-Modus arbeitet der Admin-Bereich mit einer Kopie im Speicher.
const demoStore = () => useState('admin-demo-store', () => structuredClone({
  products: demoProducts,
  posts: demoPosts,
  events: demoEvents,
  gallery_images: demoGallery,
  messages: demoMessages,
  settings: demoSettings
}))

const orderBy: Record<TableName, { column: string, ascending: boolean }[]> = {
  products: [{ column: 'sort', ascending: true }, { column: 'name', ascending: true }],
  posts: [{ column: 'published_at', ascending: false }],
  events: [{ column: 'date', ascending: false }],
  gallery_images: [{ column: 'sort', ascending: true }, { column: 'created_at', ascending: false }],
  messages: [{ column: 'created_at', ascending: false }]
}

/** Einheitlicher Datenzugriff für den Admin-Bereich (CRUD) */
export function useAdminTable<T extends TableName>(table: T) {
  type Row = TableMap[T]
  const supabase = useDb()
  const isDemo = useDemoMode()
  const toast = useToast()

  function fail(error: { message?: string } | null | undefined, title = 'Speichern fehlgeschlagen'): never {
    toast.add({ title, description: error?.message, color: 'error', icon: 'i-lucide-circle-x' })
    throw error
  }

  async function list(): Promise<Row[]> {
    if (isDemo) return [...(demoStore().value[table] as Row[])]
    let q = supabase.from(table).select('*')
    for (const o of orderBy[table]) q = q.order(o.column, { ascending: o.ascending })
    const { data, error } = await q
    if (error) fail(error, 'Laden fehlgeschlagen')
    return data as Row[]
  }

  async function get(id: string): Promise<Row | null> {
    if (isDemo) return (demoStore().value[table] as Row[]).find(r => r.id === id) ?? null
    const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle()
    if (error) fail(error, 'Laden fehlgeschlagen')
    return data as Row | null
  }

  async function save(row: Partial<Row>): Promise<Row> {
    const { id, created_at: _c, updated_at: _u, ...values } = row as Partial<Row> & { created_at?: string, updated_at?: string }
    if (isDemo) {
      const rows = demoStore().value[table] as Row[]
      if (id) {
        const i = rows.findIndex(r => r.id === id)
        rows[i] = { ...rows[i], ...values } as Row
        return rows[i]!
      }
      const created = { ...values, id: crypto.randomUUID(), created_at: new Date().toISOString() } as unknown as Row
      rows.unshift(created)
      return created
    }
    const query = id
      ? supabase.from(table).update(values as never).eq('id', id).select().single()
      : supabase.from(table).insert(values as never).select().single()
    const { data, error } = await query
    if (error) {
      if (error.code === '23505') fail({ message: 'Die URL (Slug) ist schon vergeben – bitte ändern.' })
      fail(error)
    }
    return data as Row
  }

  async function remove(id: string) {
    if (isDemo) {
      const store = demoStore().value as Record<TableName, { id: string }[]>
      store[table] = store[table].filter(r => r.id !== id)
      return
    }
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) fail(error, 'Löschen fehlgeschlagen')
  }

  return { list, get, save, remove }
}

export function useAdminSettings() {
  const supabase = useDb()
  const isDemo = useDemoMode()

  async function load(): Promise<SiteSettings> {
    if (isDemo) return structuredClone(toRaw(demoStore().value.settings))
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()
    if (error) throw error
    return data as SiteSettings
  }

  async function save(values: Partial<SiteSettings>) {
    const { id: _id, updated_at: _u, ...rest } = values
    if (isDemo) {
      Object.assign(demoStore().value.settings, rest)
      return
    }
    const { error } = await supabase.from('site_settings').update(rest as never).eq('id', 1)
    if (error) throw error
    await refreshNuxtData('settings')
  }

  return { load, save }
}

/** Besucherstatistik der letzten `days` Tage (Tabelle page_views) */
export function usePageViewStats() {
  const supabase = useDb()
  const isDemo = useDemoMode()

  async function load(days = 30): Promise<PageViewStats> {
    if (isDemo) return demoStats(days)
    const { data, error } = await supabase.rpc('page_view_stats', { days })
    if (error) throw error
    return data as PageViewStats
  }

  return { load }
}

function demoStats(days: number): PageViewStats {
  const today = new Date()
  const daily = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (days - 1 - i))
    const weekend = d.getDay() === 0 || d.getDay() === 6
    const views = Math.round((weekend ? 38 : 22) + 12 * Math.sin(i * 1.7))
    return { day: d.toISOString().slice(0, 10), views, visitors: Math.round(views / 2.6) }
  })
  const total = daily.reduce((sum, d) => sum + d.views, 0)
  const visitors = daily.reduce((sum, d) => sum + d.visitors, 0)
  const share = (f: number) => Math.round(total * f)
  return {
    days,
    total,
    visitors,
    previous: Math.round(total * 0.86),
    visitors_previous: Math.round(visitors * 0.88),
    today: daily.at(-1)!.views,
    visitors_today: daily.at(-1)!.visitors,
    daily,
    pages: [
      { label: '/', views: share(0.34) },
      { label: '/honig', views: share(0.22) },
      { label: '/honig/sommertracht', views: share(0.11) },
      { label: '/termine', views: share(0.09) },
      { label: '/kontakt', views: share(0.07) },
      { label: '/ueber-uns', views: share(0.05) }
    ],
    referrers: [
      { label: 'google.com', views: share(0.18) },
      { label: 'instagram.com', views: share(0.09) },
      { label: 'bing.com', views: share(0.02) }
    ],
    devices: [
      { label: 'mobile', views: share(0.68) },
      { label: 'desktop', views: share(0.27) },
      { label: 'tablet', views: share(0.05) }
    ],
    countries: [
      { label: 'DE', views: share(0.88) },
      { label: 'AT', views: share(0.07) },
      { label: 'CH', views: share(0.05) }
    ]
  }
}

/** Lädt ein Bild (vorher verkleinert) in den Storage-Bucket "media" */
export function useImageUpload() {
  const supabase = useDb()
  const isDemo = useDemoMode()

  async function upload(file: File, folder = 'uploads'): Promise<string> {
    const blob = await resizeImage(file, 2000)
    if (isDemo) return URL.createObjectURL(blob)
    const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.webp`
    const { error } = await supabase.storage.from('media').upload(path, blob, {
      contentType: 'image/webp',
      cacheControl: '31536000'
    })
    if (error) throw error
    return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
  }

  async function removeByUrl(url?: string | null) {
    if (isDemo || !url) return
    const marker = '/storage/v1/object/public/media/'
    const i = url.indexOf(marker)
    if (i === -1) return
    await supabase.storage.from('media').remove([url.slice(i + marker.length)])
  }

  return { upload, removeByUrl }
}

/**
 * Erkennt KI-Bilder an ihren Metadaten (C2PA / IPTC „DigitalSourceType“), wie sie
 * z. B. Google Gemini, ChatGPT oder Adobe Firefly mitschreiben. Muss auf der
 * Originaldatei laufen – beim Verkleinern gehen die Metadaten verloren.
 * Findet nichts, wenn die Metadaten fehlen (Screenshot, Messenger, Midjourney …).
 */
export async function detectAiImage(file: File): Promise<boolean> {
  const text = new TextDecoder('latin1').decode(await file.arrayBuffer())
  return text.includes('trainedAlgorithmicMedia') || text.includes('TrainedAlgorithmicMedia')
}

/** Verkleinert Handyfotos clientseitig und konvertiert sie nach WebP */
async function resizeImage(file: File, maxSize: number): Promise<Blob> {
  if (file.type === 'image/gif') return file
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return await new Promise((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Bild konnte nicht verarbeitet werden')), 'image/webp', 0.85))
}

const demoTeam: TeamMember[] = [
  { user_id: 'demo-1', email: 'imker@example.de', display_name: 'Imker', created_at: new Date(Date.now() - 90 * 864e5).toISOString(), last_sign_in_at: new Date().toISOString(), invited_at: null },
  { user_id: 'demo-2', email: 'helferin@example.de', display_name: 'Helferin', created_at: new Date(Date.now() - 2 * 864e5).toISOString(), last_sign_in_at: null, invited_at: new Date(Date.now() - 2 * 864e5).toISOString() }
]

/** Admin-Team: auflisten, einladen, entfernen */
export function useTeam() {
  const supabase = useDb()
  const isDemo = useDemoMode()
  const team = () => useState('admin-demo-team', () => structuredClone(demoTeam))

  async function list(): Promise<TeamMember[]> {
    if (isDemo) return [...team().value]
    const { data, error } = await supabase.rpc('admin_team')
    if (error) throw error
    return data as TeamMember[]
  }

  async function invite(email: string, name?: string): Promise<{ invited: boolean }> {
    if (isDemo) {
      team().value.push({ user_id: crypto.randomUUID(), email, display_name: name || null, created_at: new Date().toISOString(), last_sign_in_at: null, invited_at: new Date().toISOString() })
      return { invited: true }
    }
    const { data: { session } } = await supabase.auth.getSession()
    return await $fetch('/api/admin/invite', {
      method: 'POST',
      body: { email, name: name || undefined },
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` }
    })
  }

  async function remove(userId: string) {
    if (isDemo) {
      team().value = team().value.filter(m => m.user_id !== userId)
      return
    }
    const { error, count } = await supabase.from('admins').delete({ count: 'exact' }).eq('user_id', userId)
    if (error) throw error
    if (!count) throw new Error('Du kannst dich nicht selbst entfernen.')
  }

  return { list, invite, remove }
}

/** Eigenes Profil (Anzeigename) – gilt später genauso für Kundenkonten */
export function useProfile() {
  const supabase = useDb()
  const isDemo = useDemoMode()
  const demo = () => useState<Profile>('admin-demo-profile', () => ({ user_id: 'demo-1', display_name: 'Imker' }))

  async function load(): Promise<Profile> {
    if (isDemo) return { ...demo().value }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Nicht angemeldet')
    const { data, error } = await supabase.from('profiles').select('user_id, display_name').eq('user_id', user.id).maybeSingle()
    if (error) throw error
    return (data as Profile | null) ?? { user_id: user.id, display_name: null }
  }

  async function save(profile: Profile) {
    const display_name = profile.display_name?.trim() || null
    if (isDemo) {
      demo().value.display_name = display_name
      return
    }
    const { error } = await supabase.from('profiles').upsert({ user_id: profile.user_id, display_name })
    if (error) throw error
  }

  return { load, save }
}
