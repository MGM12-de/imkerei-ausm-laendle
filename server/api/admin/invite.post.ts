import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  name: z.string().trim().max(80).optional()
})

/** Lädt eine Person per E-Mail als Admin ein (oder macht ein bestehendes Konto zum Admin) */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, inviteSchema.safeParse)
  if (!body.success) throw createError({ statusCode: 422, statusMessage: 'Bitte gültige E-Mail eingeben' })

  const { supabase } = await requireAdmin(event)
  const { email, name } = body.data

  let userId: string
  const { data: existing } = await supabase.rpc('user_id_by_email', { p_email: email })

  if (existing) {
    userId = existing as string
  } else {
    const origin = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: name ? { display_name: name } : undefined,
      redirectTo: `${origin}/admin/passwort?willkommen=1`
    })
    if (error || !data.user) {
      console.error('invite failed', error)
      throw createError({ statusCode: 502, statusMessage: error?.message || 'Einladung konnte nicht verschickt werden' })
    }
    userId = data.user.id
  }

  const { error } = await supabase.from('admins').upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true })
  if (error) {
    console.error('admin insert failed', error)
    throw createError({ statusCode: 500, statusMessage: 'Admin-Rechte konnten nicht gespeichert werden' })
  }

  return { ok: true, invited: !existing }
})
