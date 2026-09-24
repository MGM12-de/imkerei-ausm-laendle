// Beispielinhalte – werden angezeigt, solange kein Supabase-Projekt verbunden ist,
// und dienen gleichzeitig als Vorlage für supabase/seed.sql.
// ⚠️ Alle Texte, Preise und Kontaktdaten sind PLATZHALTER.
import type { EventItem, GalleryImage, Post, Product, SiteSettings } from '~/types/models'

export const demoSettings: SiteSettings = {
  id: 1,
  site_name: 'Imkerei ausm Ländle',
  tagline: 'Echter Honig aus der Heimat',
  hero_title: 'Honig mit Herkunft – direkt vom Imker aus dem Ländle',
  hero_text: 'Unsere Bienen sammeln zwischen Streuobstwiesen, Waldrändern und blühenden Feldern. Wir schleudern schonend, füllen von Hand ab und verkaufen direkt – ohne Umwege.',
  hero_image_url: null,
  about_title: 'Aus Liebe zur Biene',
  about_intro: 'Was als Hobby mit zwei Völkern begann, ist heute eine kleine Imkerei mit Herz – nachhaltig, regional und mit viel Respekt vor der Natur.',
  about_text: '<p>Unsere Völker stehen an verschiedenen Plätzen rund um unseren Heimatort: an Streuobstwiesen, am Waldrand und zwischen Rapsfeldern. So entstehen je nach Jahreszeit ganz unterschiedliche Honige.</p><h2>Unsere Philosophie</h2><ul><li>Artgerechte Haltung und ruhiger Umgang mit den Bienen</li><li>Schonende Kaltschleuderung, kein Erhitzen über Stocktemperatur</li><li>Kurze Wege: vom Bienenstock direkt ins Glas</li></ul><p>Wir freuen uns über jeden Besuch – schreibt uns einfach vorher kurz an.</p>',
  about_image_url: null,
  owner_name: 'Max Mustermann',
  street: 'Musterstraße 1',
  zip: '70000',
  city: 'Musterstadt',
  phone: '+49 123 456789',
  email: 'info@imkerei-ausm-laendle.de',
  instagram_handle: 'imkerei_ausm_laendle_',
  sales_info: 'Hofverkauf nach Absprache\nSamstags 9–12 Uhr am Wochenmarkt',
  announcement: 'Der neue Sommerhonig ist da! 🍯'
}

const d = (offsetDays: number) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

export const demoProducts: Product[] = [
  {
    id: 'p1', name: 'Frühjahrsblütenhonig', slug: 'fruehjahrsbluetenhonig', category: 'honig',
    short_description: 'Mild, cremig gerührt – aus Obstblüte, Löwenzahn und Raps.',
    description: '<p>Unser erster Honig im Jahr. Die Bienen sammeln ihn in der Obstblüte, im Löwenzahn und im Raps. Durch sorgfältiges Rühren wird er wunderbar cremig und streichzart.</p>',
    taste: 'Mild, blumig', consistency: 'Cremig', harvest: 'Mai', size: '500 g',
    price: 7.5, image_url: null, available: true, featured: true, published: true, sort: 1
  },
  {
    id: 'p2', name: 'Sommertracht', slug: 'sommertracht', category: 'honig',
    short_description: 'Kräftig-aromatisch mit Linde und Wiesenblumen.',
    description: '<p>Im Sommer blühen Linde, Klee und viele Wiesenblumen. Das Ergebnis ist ein aromatischer, flüssiger Honig mit feiner Frische.</p>',
    taste: 'Aromatisch, fruchtig', consistency: 'Flüssig', harvest: 'Juli', size: '500 g',
    price: 8, image_url: null, available: true, featured: true, published: true, sort: 2
  },
  {
    id: 'p3', name: 'Waldhonig', slug: 'waldhonig', category: 'honig',
    short_description: 'Dunkel, würzig und malzig – nicht jedes Jahr verfügbar.',
    description: '<p>Waldhonig entsteht aus Honigtau von Tannen und Fichten. Er ist dunkel, würzig und wenig süß – ein echter Genuss für Kenner.</p>',
    taste: 'Würzig, malzig', consistency: 'Flüssig', harvest: 'August', size: '500 g',
    price: 9.5, image_url: null, available: false, featured: true, published: true, sort: 3
  },
  {
    id: 'p4', name: 'Kleines Probierset', slug: 'probierset', category: 'geschenk',
    short_description: 'Drei Sorten à 250 g – perfekt zum Verschenken.',
    description: '<p>Drei unserer Honige im kleinen Glas, schön verpackt. Ideal als Mitbringsel.</p>',
    taste: null, consistency: null, harvest: null, size: '3 × 250 g',
    price: 14, image_url: null, available: true, featured: false, published: true, sort: 4
  },
  {
    id: 'p5', name: 'Bienenwachskerze', slug: 'bienenwachskerze', category: 'wachs',
    short_description: 'Handgegossen aus eigenem Wachs, duftet dezent nach Honig.',
    description: '<p>Aus reinem Bienenwachs unserer Völker gegossen. Brennt ruhig und lange.</p>',
    taste: null, consistency: null, harvest: null, size: 'ca. 10 cm',
    price: 6, image_url: null, available: true, featured: false, published: true, sort: 5
  }
]

export const demoPosts: Post[] = [
  {
    id: 'b1', title: 'Die Sommerernte ist im Glas', slug: 'sommerernte-im-glas',
    excerpt: 'Nach einem warmen Juli konnten wir endlich schleudern – und die Ausbeute kann sich sehen lassen.',
    content: '<p>Nach einem warmen Juli konnten wir endlich schleudern. Die Linde hat dieses Jahr besonders gut gehonigt, entsprechend aromatisch ist die Sommertracht geworden.</p><p>Ab sofort gibt es den neuen Honig bei uns am Hof und auf dem Wochenmarkt.</p>',
    image_url: null, published: true, published_at: new Date(Date.now() - 5 * 864e5).toISOString()
  },
  {
    id: 'b2', title: 'Warum schwärmen Bienen?', slug: 'warum-schwaermen-bienen',
    excerpt: 'Im Frühjahr teilt sich ein Volk – ein faszinierendes Naturschauspiel. Wir erklären, was dahintersteckt.',
    content: '<p>Schwärmen ist die natürliche Vermehrung eines Bienenvolkes. Die alte Königin verlässt mit etwa der Hälfte der Bienen den Stock und sucht sich ein neues Zuhause.</p><p>Wenn ihr einen Schwarm seht: Ruhe bewahren und gerne bei uns melden!</p>',
    image_url: null, published: true, published_at: new Date(Date.now() - 40 * 864e5).toISOString()
  },
  {
    id: 'b3', title: 'Einwinterung: So kommen die Bienen durch die kalte Zeit', slug: 'einwinterung',
    excerpt: 'Futter, Varroa-Behandlung und Ruhe – so bereiten wir unsere Völker auf den Winter vor.',
    content: '<p>Im Spätsommer beginnt für uns Imker die Vorbereitung auf den Winter. Die Völker bekommen Futter, werden gegen die Varroamilbe behandelt und dann in Ruhe gelassen.</p>',
    image_url: null, published: true, published_at: new Date(Date.now() - 90 * 864e5).toISOString()
  }
]

export const demoEvents: EventItem[] = [
  { id: 'e1', title: 'Wochenmarkt', date: d(2), time_from: '08:00', time_to: '12:00', location: 'Marktplatz Musterstadt', description: 'Frischer Honig und Kerzen an unserem Stand.', published: true },
  { id: 'e2', title: 'Tag der offenen Imkerei', date: d(16), time_from: '14:00', time_to: '17:00', location: 'Am Bienenhaus', description: 'Blick in den Bienenstock (mit Schutzausrüstung), Honigverkostung und Kaffee.', published: true },
  { id: 'e3', title: 'Weihnachtsmarkt', date: d(70), time_from: '11:00', time_to: '19:00', location: 'Rathausplatz', description: 'Honig, Geschenksets und Bienenwachskerzen.', published: true }
]

export const demoGallery: GalleryImage[] = [
  { id: 'g1', image_url: '', caption: 'Blick in die Beute', sort: 1, published: true },
  { id: 'g2', image_url: '', caption: 'Frisch geschleudert', sort: 2, published: true },
  { id: 'g3', image_url: '', caption: 'Bienenstand an der Streuobstwiese', sort: 3, published: true },
  { id: 'g4', image_url: '', caption: 'Wabe mit verdeckeltem Honig', sort: 4, published: true },
  { id: 'g5', image_url: '', caption: 'Unsere Gläser', sort: 5, published: true },
  { id: 'g6', image_url: '', caption: 'Die Königin', sort: 6, published: true }
]
