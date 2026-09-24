import type { EventItem, GalleryImage, Message, Post, Product, SiteSettings } from '~/types/models'
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
