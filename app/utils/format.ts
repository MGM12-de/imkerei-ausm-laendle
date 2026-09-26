export const formatPrice = (value: number | null | undefined) =>
  value == null ? '' : new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)

export const formatDate = (value: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  value ? new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', ...opts }).format(new Date(value.length === 10 ? `${value}T12:00:00` : value)) : ''

export const formatTime = (value: string | null | undefined) => value ? value.slice(0, 5) : ''

export const formatTimeRange = (from: string | null, to: string | null) => {
  if (!from) return ''
  return to ? `${formatTime(from)} – ${formatTime(to)} Uhr` : `ab ${formatTime(from)} Uhr`
}

export const slugify = (text: string) =>
  text.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 80)

export const instagramUrl = (handle?: string | null) =>
  handle ? `https://www.instagram.com/${handle.replace(/^@/, '')}` : ''

/** Veränderung gegenüber dem Zeitraum davor (z. B. Besucher) */
export const visitTrend = (current: number | undefined, previous: number | undefined) => {
  if (current == null || !previous) return null
  const pct = Math.round(((current - previous) / previous) * 100)
  const value = `${pct >= 0 ? '+' : ''}${pct} %`
  return { up: pct >= 0, value, label: `${value} zum Vorzeitraum` }
}
