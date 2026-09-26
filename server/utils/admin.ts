import type { H3Event } from 'h3'
import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

/** Server-Client mit Secret Key – umgeht RLS, daher nur nach requireAdmin() verwenden */
export function useServiceClient(event: H3Event) {
  if (!useRuntimeConfig(event).supabase?.secretKey) {
    throw createError({ statusCode: 503, statusMessage: 'Einladen ist noch nicht eingerichtet (NUXT_SUPABASE_SECRET_KEY fehlt).' })
  }
  return serverSupabaseServiceRole(event) as unknown as SupabaseClient
}

/** Prüft das mitgeschickte Zugriffstoken und ob der Benutzer Admin ist */
export async function requireAdmin(event: H3Event) {
  const token = getHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Nicht angemeldet' })

  const supabase = useServiceClient(event)
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Nicht angemeldet' })

  const { data } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!data) throw createError({ statusCode: 403, statusMessage: 'Kein Zugriff' })

  return { user, supabase }
}
