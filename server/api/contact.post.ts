import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseClient } from '#supabase/server'
import { contactSchema } from '#shared/contact'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, contactSchema.safeParse)
  if (!body.success) {
    // Honeypot ausgelöst → so tun, als wäre alles gut
    const raw = await readBody(event).catch(() => ({}))
    if (raw?.website) return { ok: true }
    throw createError({ statusCode: 422, statusMessage: 'Ungültige Eingabe', data: body.error.issues })
  }

  const { name, email, phone, subject, message } = body.data
  const url = useRuntimeConfig(event).public.supabase?.url ?? ''

  // Demo-Modus: nichts speichern
  if (!url || url.includes('demo.supabase.co')) return { ok: true, demo: true }

  const supabase = (await serverSupabaseClient(event)) as unknown as SupabaseClient
  const { error } = await supabase.from('messages').insert({
    name,
    email,
    phone: phone || null,
    subject: subject || null,
    message
  })

  if (error) {
    console.error('contact insert failed', error)
    throw createError({ statusCode: 500, statusMessage: 'Nachricht konnte nicht gespeichert werden' })
  }

  return { ok: true }
})
