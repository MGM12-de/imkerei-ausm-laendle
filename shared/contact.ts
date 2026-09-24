import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Bitte gib deinen Namen an').max(120),
  email: z.string().trim().email('Bitte gib eine gültige E-Mail-Adresse an').max(200),
  phone: z.string().trim().max(60).optional().or(z.literal('')),
  subject: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Deine Nachricht ist etwas kurz').max(5000),
  privacy: z.literal(true, { message: 'Bitte stimme der Datenverarbeitung zu' }),
  // Honeypot – muss leer bleiben
  website: z.string().max(0).optional()
})

export type ContactInput = z.input<typeof contactSchema>
