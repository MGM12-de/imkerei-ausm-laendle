import type { EventItem, GalleryImage, Post, Product, SiteSettings } from '~/types/models'
import { demoEvents, demoGallery, demoPosts, demoProducts, demoSettings } from '~/utils/demo'

/** true, solange kein echtes Supabase-Projekt konfiguriert ist */
export const useDemoMode = () => {
  const url = useRuntimeConfig().public.supabase?.url || ''
  return !url || url.includes('demo.supabase.co')
}

function useQuery<T>(key: string, demo: () => T, query: () => PromiseLike<{ data: unknown, error: unknown }>) {
  const isDemo = useDemoMode()
  return useAsyncData<T>(key, async () => {
    if (isDemo) return demo()
    const { data, error } = await query()
    if (error) throw createError({ statusCode: 500, statusMessage: 'Daten konnten nicht geladen werden' })
    return data as T
  })
}

export const useSettings = () => {
  const supabase = useDb()
  return useQuery<SiteSettings>('settings', () => demoSettings,
    () => supabase.from('site_settings').select('*').eq('id', 1).single())
}

export const useProducts = (opts: { featured?: boolean } = {}) => {
  const supabase = useDb()
  return useQuery<Product[]>(`products-${opts.featured ? 'featured' : 'all'}`,
    () => demoProducts.filter(p => !opts.featured || p.featured),
    () => {
      let q = supabase.from('products').select('*').eq('published', true)
      if (opts.featured) q = q.eq('featured', true)
      return q.order('sort').order('name')
    })
}

export const useProduct = (slug: string) => {
  const supabase = useDb()
  return useQuery<Product | null>(`product-${slug}`,
    () => demoProducts.find(p => p.slug === slug) ?? null,
    () => supabase.from('products').select('*').eq('slug', slug).eq('published', true).maybeSingle())
}

export const usePosts = (limit?: number) => {
  const supabase = useDb()
  return useQuery<Post[]>(`posts-${limit ?? 'all'}`,
    () => demoPosts.slice(0, limit ?? undefined),
    () => {
      let q = supabase.from('posts')
        .select('id,title,slug,excerpt,image_url,image_ai,published,published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
      if (limit) q = q.limit(limit)
      return q
    })
}

export const usePost = (slug: string) => {
  const supabase = useDb()
  return useQuery<Post | null>(`post-${slug}`,
    () => demoPosts.find(p => p.slug === slug) ?? null,
    () => supabase.from('posts').select('*').eq('slug', slug).eq('published', true).maybeSingle())
}

export const useUpcomingEvents = (limit?: number) => {
  const supabase = useDb()
  const today = new Date().toISOString().slice(0, 10)
  return useQuery<EventItem[]>(`events-${limit ?? 'all'}`,
    () => demoEvents.slice(0, limit ?? undefined),
    () => {
      let q = supabase.from('events').select('*').eq('published', true).gte('date', today).order('date')
      if (limit) q = q.limit(limit)
      return q
    })
}

export const useGallery = (limit?: number) => {
  const supabase = useDb()
  return useQuery<GalleryImage[]>(`gallery-${limit ?? 'all'}`,
    () => demoGallery.slice(0, limit ?? undefined),
    () => {
      let q = supabase.from('gallery_images').select('*').eq('published', true)
        .order('sort').order('created_at', { ascending: false })
      if (limit) q = q.limit(limit)
      return q
    })
}
