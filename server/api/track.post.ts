import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { serverSupabaseClient } from '#supabase/server'

// Cookielose Besucherzählung: IP und User-Agent werden nicht gespeichert, nur ein täglich wechselnder Hash
const trackSchema = z.object({
  path: z.string().startsWith('/').max(300),
  referrer: z.string().max(500).optional()
})

const BOTS = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pagespeed|monitor|curl|wget|python|axios/i

function deviceOf(ua: string) {
  if (/ipad|tablet/i.test(ua)) return 'tablet'
  if (/mobi|android|iphone/i.test(ua)) return 'mobile'
  return 'desktop'
}

function referrerHost(referrer: string | undefined, ownHost: string) {
  if (!referrer) return null
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '')
    return host && host !== ownHost.replace(/^www\./, '').replace(/:\d+$/, '') ? host.slice(0, 200) : null
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  setResponseStatus(event, 204)

  const body = await readValidatedBody(event, trackSchema.safeParse)
  const ua = getHeader(event, 'user-agent') ?? ''
  if (!body.success || !ua || BOTS.test(ua) || body.data.path.startsWith('/admin')) return null

  const url = useRuntimeConfig(event).public.supabase?.url ?? ''
  if (!url || url.includes('demo.supabase.co')) return null

  const country = getHeader(event, 'cf-ipcountry')
  const ip = getHeader(event, 'cf-connecting-ip') || getRequestIP(event, { xForwardedFor: true }) || ''
  const supabase = (await serverSupabaseClient(event)) as unknown as SupabaseClient
  // IP + Browser verlassen den Server nur für den Tages-Hash in der DB und werden nicht gespeichert
  const { error } = await supabase.rpc('track_page_view', {
    p_path: body.data.path,
    p_referrer_host: referrerHost(body.data.referrer, getRequestHost(event, { xForwardedHost: true })),
    p_device: deviceOf(ua),
    p_country: country && /^[A-Z]{2}$/.test(country) && country !== 'XX' ? country : null,
    p_visitor: ip ? `${ip}|${ua}` : null
  })
  if (error) console.error('page view insert failed', error)
  return null
})
