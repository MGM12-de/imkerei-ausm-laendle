<script setup lang="ts">
import type { EventItem, Message, PageViewStats } from '~/types/models'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Übersicht', robots: 'noindex' })

const products = useAdminTable('products')
const posts = useAdminTable('posts')
const events = useAdminTable('events')
const messages = useAdminTable('messages')

const stats = ref({ products: 0, available: 0, posts: 0, events: 0, unread: 0 })
const nextEvents = ref<EventItem[]>([])
const latestMessages = ref<Message[]>([])
const visits = ref<PageViewStats | null>(null)

onMounted(async () => {
  // Statistik separat laden, damit ein Fehler dort den Rest nicht blockiert
  usePageViewStats().load(30)
    .then((v) => {
      visits.value = v
    })
    .catch(() => {})
  const [p, b, e, m] = await Promise.all([products.list(), posts.list(), events.list(), messages.list()])
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = e.filter(x => x.date >= today).sort((a, z) => a.date.localeCompare(z.date))
  stats.value = {
    products: p.length,
    available: p.filter(x => x.available).length,
    posts: b.filter(x => x.published).length,
    events: upcoming.length,
    unread: m.filter(x => !x.read).length
  }
  nextEvents.value = upcoming.slice(0, 3)
  latestMessages.value = m.slice(0, 4)
})

const cards = computed(() => [
  { label: 'Produkte verfügbar', value: `${stats.value.available} / ${stats.value.products}`, icon: 'i-lucide-droplet', to: '/admin/produkte' },
  { label: 'Veröffentlichte Beiträge', value: stats.value.posts, icon: 'i-lucide-newspaper', to: '/admin/beitraege' },
  { label: 'Kommende Termine', value: stats.value.events, icon: 'i-lucide-calendar-days', to: '/admin/termine' },
  { label: 'Ungelesene Nachrichten', value: stats.value.unread, icon: 'i-lucide-inbox', to: '/admin/nachrichten' }
])

const trend = computed(() => visitTrend(visits.value?.visitors, visits.value?.visitors_previous))

const quick = [
  { label: 'Neues Produkt', icon: 'i-lucide-plus', to: '/admin/produkte/neu' },
  { label: 'Neuer Beitrag', icon: 'i-lucide-pen-line', to: '/admin/beitraege/neu' },
  { label: 'Termin eintragen', icon: 'i-lucide-calendar-plus', to: '/admin/termine?neu=1' },
  { label: 'Fotos hochladen', icon: 'i-lucide-image-plus', to: '/admin/galerie' }
]
</script>

<template>
  <AdminPage title="Übersicht">
    <div class="space-y-6">
      <div>
        <h2 class="font-display text-2xl font-semibold text-highlighted">Hallo! 🐝</h2>
        <p class="text-muted">Was möchtest du heute aktualisieren?</p>
      </div>

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <UButton v-for="q in quick" :key="q.label" :to="q.to" :icon="q.icon" size="xl" color="primary" variant="soft" class="justify-center py-4 flex-col gap-1.5 sm:flex-row">
          {{ q.label }}
        </UButton>
      </div>

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <NuxtLink v-for="c in cards" :key="c.label" :to="c.to" class="rounded-xl ring ring-default p-4 hover:bg-elevated/50 transition">
          <UIcon :name="c.icon" class="size-5 text-primary" />
          <p class="mt-2 text-2xl font-semibold text-highlighted">{{ c.value }}</p>
          <p class="text-sm text-muted">{{ c.label }}</p>
        </NuxtLink>
      </div>

      <UCard v-if="visits">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">Besucher der letzten 30 Tage</h3>
            <UButton to="/admin/statistik" variant="link" size="sm">Details</UButton>
          </div>
        </template>
        <div class="grid gap-6 lg:grid-cols-3">
          <div class="lg:col-span-2">
            <div class="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p class="text-3xl font-semibold text-highlighted tabular-nums">{{ visits.visitors }}</p>
              <p class="text-sm text-muted">Besucher · {{ visits.total }} Seitenaufrufe</p>
              <UBadge v-if="trend" :color="trend.up ? 'success' : 'neutral'" variant="subtle" :icon="trend.up ? 'i-lucide-trending-up' : 'i-lucide-trending-down'">
                {{ trend.label }}
              </UBadge>
              <p class="text-sm text-muted sm:ml-auto">Heute: <span class="font-medium text-highlighted">{{ visits.visitors_today }}</span> Besucher</p>
            </div>
            <AdminViewsChart :daily="visits.daily" />
          </div>
          <div>
            <p class="mb-2 text-sm font-medium text-highlighted">Beliebteste Seiten</p>
            <AdminStatsList :items="visits.pages.slice(0, 5)" empty="Noch keine Aufrufe gezählt." />
          </div>
        </div>
      </UCard>

      <div class="grid gap-6 lg:grid-cols-2">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-highlighted">Nächste Termine</h3>
              <UButton to="/admin/termine" variant="link" size="sm">Alle</UButton>
            </div>
          </template>
          <ul class="divide-y divide-default">
            <li v-for="e in nextEvents" :key="e.id" class="py-2.5 flex justify-between gap-3">
              <span class="font-medium text-highlighted truncate">{{ e.title }}</span>
              <span class="text-sm text-muted shrink-0">{{ formatDate(e.date, { day: '2-digit', month: '2-digit' }) }}</span>
            </li>
            <li v-if="!nextEvents.length" class="py-2 text-muted text-sm">Keine anstehenden Termine.</li>
          </ul>
        </UCard>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-highlighted">Neueste Nachrichten</h3>
              <UButton to="/admin/nachrichten" variant="link" size="sm">Alle</UButton>
            </div>
          </template>
          <ul class="divide-y divide-default">
            <li v-for="m in latestMessages" :key="m.id" class="py-2.5">
              <div class="flex items-center gap-2">
                <span v-if="!m.read" class="size-2 rounded-full bg-primary" />
                <span class="font-medium text-highlighted truncate">{{ m.name }}</span>
                <span class="ml-auto text-xs text-muted shrink-0">{{ formatDate(m.created_at, { day: '2-digit', month: '2-digit' }) }}</span>
              </div>
              <p class="text-sm text-muted truncate">{{ m.subject || m.message }}</p>
            </li>
            <li v-if="!latestMessages.length" class="py-2 text-muted text-sm">Noch keine Nachrichten.</li>
          </ul>
        </UCard>
      </div>
    </div>
  </AdminPage>
</template>
