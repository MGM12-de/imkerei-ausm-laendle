<script setup lang="ts">
import type { PageViewStats } from '~/types/models'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Statistik', robots: 'noindex' })

const stats = usePageViewStats()
const ranges = [
  { label: '7 Tage', value: 7 },
  { label: '30 Tage', value: 30 },
  { label: '90 Tage', value: 90 }
]
const days = ref(30)
const data = ref<PageViewStats | null>(null)
const loading = ref(true)
const failed = ref(false)

async function load() {
  loading.value = true
  try {
    data.value = await stats.load(days.value)
    failed.value = false
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(days, load)

const trend = computed(() => visitTrend(data.value))
const average = computed(() => data.value ? Math.round(data.value.total / data.value.days) : 0)

const deviceLabels: Record<string, string> = { mobile: 'Handy', tablet: 'Tablet', desktop: 'Computer' }
const regions = new Intl.DisplayNames('de', { type: 'region' })
const country = (code: string) => {
  try {
    return regions.of(code) ?? code
  } catch {
    return code
  }
}
</script>

<template>
  <AdminPage title="Statistik">
    <template #actions>
      <UTabs v-model="days" :items="ranges" :content="false" size="sm" />
    </template>

    <UAlert
      v-if="failed"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-x"
      title="Statistik konnte nicht geladen werden"
      description="Ist die Datenbank-Migration 0004_page_views.sql schon eingespielt?"
    />

    <div v-else-if="data" class="space-y-6" :class="{ 'opacity-60': loading }">
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="rounded-xl ring ring-default p-4">
          <p class="text-2xl font-semibold text-highlighted tabular-nums">{{ data.total }}</p>
          <p class="text-sm text-muted">Seitenaufrufe</p>
        </div>
        <div class="rounded-xl ring ring-default p-4">
          <p class="text-2xl font-semibold text-highlighted tabular-nums">{{ average }}</p>
          <p class="text-sm text-muted">Pro Tag (Ø)</p>
        </div>
        <div class="rounded-xl ring ring-default p-4">
          <p class="text-2xl font-semibold text-highlighted tabular-nums">{{ data.today }}</p>
          <p class="text-sm text-muted">Heute</p>
        </div>
        <div class="rounded-xl ring ring-default p-4">
          <p class="text-2xl font-semibold tabular-nums" :class="trend?.up ? 'text-success' : 'text-highlighted'">
            {{ trend?.value ?? '–' }}
          </p>
          <p class="text-sm text-muted">Zum Vorzeitraum</p>
        </div>
      </div>

      <UCard>
        <template #header>
          <h3 class="font-semibold text-highlighted">Aufrufe pro Tag</h3>
        </template>
        <AdminViewsChart :daily="data.daily" />
      </UCard>

      <div class="grid gap-6 lg:grid-cols-2">
        <UCard>
          <template #header>
            <h3 class="font-semibold text-highlighted">Beliebteste Seiten</h3>
          </template>
          <AdminStatsList :items="data.pages" />
        </UCard>
        <UCard>
          <template #header>
            <h3 class="font-semibold text-highlighted">Herkunft</h3>
          </template>
          <AdminStatsList :items="data.referrers" empty="Bisher nur direkte Aufrufe." />
        </UCard>
        <UCard>
          <template #header>
            <h3 class="font-semibold text-highlighted">Geräte</h3>
          </template>
          <AdminStatsList :items="data.devices" :format="l => deviceLabels[l] ?? l" />
        </UCard>
        <UCard>
          <template #header>
            <h3 class="font-semibold text-highlighted">Länder</h3>
          </template>
          <AdminStatsList :items="data.countries" :format="country" />
        </UCard>
      </div>

      <p class="text-xs text-muted">
        Gezählt wird ohne Cookies und ohne IP-Adressen – deshalb gibt es nur Seitenaufrufe, keine „eindeutigen Besucher“.
        Eigene Aufrufe im angemeldeten Zustand werden nicht mitgezählt.
      </p>
    </div>
  </AdminPage>
</template>
