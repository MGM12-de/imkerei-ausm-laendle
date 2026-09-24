<script setup lang="ts">
usePageSeo({ title: 'Termine', description: 'Markttage, Hofverkauf und Veranstaltungen – hier bekommt ihr unseren regionalen Honig direkt vom Imker und könnt uns persönlich kennenlernen.' })
const { data: events } = await useUpcomingEvents()
const { data: s } = await useSettings()

const grouped = computed(() => {
  const groups = new Map<string, NonNullable<typeof events.value>>()
  for (const e of events.value ?? []) {
    const key = formatDate(e.date, { month: 'long', year: 'numeric' })
    groups.set(key, [...(groups.get(key) ?? []), e])
  }
  return [...groups.entries()]
})
</script>

<template>
  <div>
    <PageIntro eyebrow="Termine" title="Markt, Hof & Veranstaltungen" description="Hier bekommt ihr unseren Honig persönlich – und könnt uns Löcher in den Bauch fragen." />
    <UContainer class="py-8 sm:py-12 grid gap-10 lg:grid-cols-[1fr_320px]">
      <div class="space-y-10">
        <section v-for="[month, list] in grouped" :key="month">
          <h2 class="font-display text-2xl font-semibold text-highlighted mb-4">{{ month }}</h2>
          <div class="space-y-3">
            <EventCard v-for="e in list" :key="e.id" :event="e" />
          </div>
        </section>
        <UEmpty v-if="!grouped.length" icon="i-lucide-calendar-x" title="Gerade keine Termine geplant" description="Folgt uns auf Instagram, dort kündigen wir alles zuerst an." />
      </div>
      <aside class="lg:sticky lg:top-[calc(var(--ui-header-height)+2rem)] lg:self-start">
        <div class="rounded-2xl bg-elevated/70 p-6">
          <UIcon name="i-lucide-store" class="size-7 text-primary" />
          <h2 class="mt-3 font-semibold text-highlighted text-lg">Regelmäßiger Verkauf</h2>
          <p class="mt-2 text-muted whitespace-pre-line">{{ s?.sales_info }}</p>
          <UButton to="/kontakt" class="mt-5" block>Termin vereinbaren</UButton>
        </div>
      </aside>
    </UContainer>
  </div>
</template>
