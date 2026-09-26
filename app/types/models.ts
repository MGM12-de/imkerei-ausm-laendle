export type ProductCategory = 'honig' | 'wachs' | 'geschenk' | 'sonstiges'

export interface SiteSettings {
  id: number
  site_name: string
  tagline: string | null
  hero_title: string | null
  hero_text: string | null
  hero_image_url: string | null
  hero_image_ai?: boolean
  about_title: string | null
  about_intro: string | null
  about_text: string | null
  about_image_url: string | null
  about_image_ai?: boolean
  owner_name: string | null
  street: string | null
  zip: string | null
  city: string | null
  phone: string | null
  email: string | null
  instagram_handle: string | null
  sales_info: string | null
  announcement: string | null
  updated_at?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  category: ProductCategory
  short_description: string | null
  description: string | null
  taste: string | null
  consistency: string | null
  harvest: string | null
  size: string | null
  price: number | null
  image_url: string | null
  /** Bild wurde mit KI erstellt → Hinweis wird angezeigt */
  image_ai?: boolean
  available: boolean
  featured: boolean
  published: boolean
  sort: number
  created_at?: string
  updated_at?: string
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  image_url: string | null
  /** Bild wurde mit KI erstellt → Hinweis wird angezeigt */
  image_ai?: boolean
  published: boolean
  published_at: string
  created_at?: string
  updated_at?: string
}

export interface EventItem {
  id: string
  title: string
  date: string
  time_from: string | null
  time_to: string | null
  location: string | null
  description: string | null
  published: boolean
  created_at?: string
  updated_at?: string
}

export interface GalleryImage {
  id: string
  image_url: string
  image_ai?: boolean
  caption: string | null
  sort: number
  published: boolean
  created_at?: string
}

export interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

export interface StatsEntry {
  label: string
  views: number
}

/** Ergebnis von public.page_view_stats() */
export interface PageViewStats {
  days: number
  total: number
  previous: number
  today: number
  daily: { day: string, views: number }[]
  pages: StatsEntry[]
  referrers: StatsEntry[]
  devices: StatsEntry[]
  countries: StatsEntry[]
}

export const categoryLabels: Record<ProductCategory, string> = {
  honig: 'Honig',
  wachs: 'Bienenwachs',
  geschenk: 'Geschenke',
  sonstiges: 'Sonstiges'
}
