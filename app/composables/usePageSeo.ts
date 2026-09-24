import type { SiteSettings } from '~/types/models'

type Text = MaybeRefOrGetter<string | null | undefined>

/** Standard-Vorschaubild für Social Media (1200 × 630), liegt in /public */
const DEFAULT_OG_IMAGE = '/og-image.png'

/** Entfernt HTML und kürzt auf eine für Suchmaschinen passende Länge (~160 Zeichen). */
export const seoText = (value: string | null | undefined, max = 160) => {
  const text = (value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

/**
 * Titel, Beschreibung und Vorschaubild einer Seite – für Google, Facebook, WhatsApp & Co.
 * Ohne eigenes Bild wird das Startseiten-Bild bzw. das Standard-Vorschaubild verwendet.
 */
export function usePageSeo(seo: {
  title?: Text
  description?: Text
  image?: Text
  imageAlt?: Text
  type?: 'website' | 'article'
}) {
  const siteUrl = useRuntimeConfig().public.siteUrl
  const route = useRoute()
  const { data: settings } = useNuxtData<SiteSettings>('settings')

  const absolute = (path: string) => new URL(path, siteUrl).href
  const title = () => toValue(seo.title) || undefined
  const description = () => seoText(toValue(seo.description)) || undefined
  const image = () => {
    const own = toValue(seo.image)
    const src = own || settings.value?.hero_image_url
    return src ? absolute(src) : absolute(DEFAULT_OG_IMAGE)
  }
  const imageAlt = () => toValue(seo.image) ? (toValue(seo.imageAlt) || title()) : settings.value?.site_name
  // In Vorschaukarten (WhatsApp, Facebook …) steht der Seitenname mit im Titel
  const shareTitle = () => [title(), settings.value?.site_name].filter(Boolean).join(' · ') || undefined
  const url = () => absolute(route.path)

  useSeoMeta({
    title,
    description,
    ogTitle: shareTitle,
    ogDescription: description,
    ogType: seo.type ?? 'website',
    ogUrl: url,
    ogImage: image,
    ogImageAlt: imageAlt,
    twitterCard: 'summary_large_image',
    twitterTitle: shareTitle,
    twitterDescription: description,
    twitterImage: image,
    twitterImageAlt: imageAlt
  })

  useHead({ link: [{ rel: 'canonical', href: url }] })
}
