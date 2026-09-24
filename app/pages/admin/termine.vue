<script setup lang="ts">
import type { EventItem } from '~/types/models'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Termine', robots: 'noindex' })

const table = useAdminTable('events')
const toast = useToast()
const route = useRoute()
const items = ref<EventItem[]>([])
const loading = ref(true)
const showPast = ref(false)
const today = new Date().toISOString().slice(0, 10)

async function load() {
  items.value = await table.list()
  loading.value = false
}
onMounted(async () => {
  await load()
  if (route.query.neu) edit()
})

const upcoming = computed(() => items.value.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)))
const past = computed(() => items.value.filter(e => e.date < today))

const open = ref(false)
const saving = ref(false)
const form = ref<Partial<EventItem>>({})

function edit(e?: EventItem) {
  form.value = e
    ? { ...e, time_from: e.time_from?.slice(0, 5) ?? null, time_to: e.time_to?.slice(0, 5) ?? null }
    : { title: '', date: today, time_from: '', time_to: '', location: '', description: '', published: true }
  open.value = true
}

function duplicate(e: EventItem) {
  edit({ ...e, id: '' as string })
  form.value.id = undefined
}

async function save() {
  if (!form.value.title?.trim() || !form.value.date) return toast.add({ title: 'Titel und Datum sind Pflicht', color: 'warning' })
  saving.value = true
  try {
    await table.save({ ...form.value, time_from: form.value.time_from || null, time_to: form.value.time_to || null })
    open.value = false
    toast.add({ title: 'Termin gespeichert', color: 'success', icon: 'i-lucide-check' })
    await load()
  } finally {
    saving.value = false
  }
}

const toDelete = ref<EventItem | null>(null)
async function remove() {
  if (!toDelete.value) return
  await table.remove(toDelete.value.id)
  toDelete.value = null
  await load()
}
</script>

<template>
  <AdminPage title="Termine">
    <template #actions>
      <UButton icon="i-lucide-plus" @click="edit()">
        <span class="hidden sm:inline">Neuer Termin</span>
      </UButton>
    </template>

    <div v-if="loading" class="space-y-2">
      <USkeleton v-for="i in 3" :key="i" class="h-16 w-full" />
    </div>

    <template v-else>
      <ul class="space-y-2">
        <li v-for="e in upcoming" :key="e.id" class="flex items-center gap-3 rounded-xl ring ring-default p-3">
          <div class="flex w-12 shrink-0 flex-col items-center rounded-lg bg-primary/10 py-1 text-primary">
            <span class="text-[10px] font-semibold uppercase">{{ formatDate(e.date, { month: 'short' }) }}</span>
            <span class="text-lg font-bold leading-none">{{ formatDate(e.date, { day: 'numeric' }) }}</span>
          </div>
          <button type="button" class="min-w-0 flex-1 text-left" @click="edit(e)">
            <p class="font-semibold text-highlighted truncate">{{ e.title }}</p>
            <p class="text-sm text-muted truncate">{{ formatTimeRange(e.time_from, e.time_to) }}<template v-if="e.location"> · {{ e.location }}</template></p>
          </button>
          <UBadge v-if="!e.published" color="neutral" variant="subtle">Versteckt</UBadge>
          <UDropdownMenu :items="[[{ label: 'Bearbeiten', icon: 'i-lucide-pencil', onSelect: () => edit(e) }, { label: 'Duplizieren', icon: 'i-lucide-copy', onSelect: () => duplicate(e) }], [{ label: 'Löschen', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => { toDelete = e } }]]">
            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Aktionen" />
          </UDropdownMenu>
        </li>
      </ul>
      <UEmpty v-if="!upcoming.length" icon="i-lucide-calendar" title="Keine anstehenden Termine" :actions="[{ label: 'Termin eintragen', icon: 'i-lucide-plus', onClick: () => edit() }]" />

      <div v-if="past.length" class="mt-8">
        <UButton color="neutral" variant="ghost" :trailing-icon="showPast ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" @click="showPast = !showPast">
          Vergangene Termine ({{ past.length }})
        </UButton>
        <ul v-if="showPast" class="mt-2 space-y-1 opacity-70">
          <li v-for="e in past" :key="e.id" class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-elevated/50">
            <span class="w-24 text-sm text-muted">{{ formatDate(e.date, { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</span>
            <span class="flex-1 truncate">{{ e.title }}</span>
            <UButton icon="i-lucide-copy" size="xs" color="neutral" variant="ghost" aria-label="Als Vorlage" @click="duplicate(e)" />
            <UButton icon="i-lucide-trash-2" size="xs" color="error" variant="ghost" aria-label="Löschen" @click="toDelete = e" />
          </li>
        </ul>
      </div>
    </template>

    <USlideover v-model:open="open" :title="form.id ? 'Termin bearbeiten' : 'Neuer Termin'">
      <template #body>
        <form id="event-form" class="space-y-4" @submit.prevent="save">
          <UFormField label="Titel" required>
            <UInput v-model="form.title" size="lg" class="w-full" placeholder="z. B. Wochenmarkt" />
          </UFormField>
          <UFormField label="Datum" required>
            <UInput v-model="form.date" type="date" size="lg" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Von">
              <UInput v-model="form.time_from as string" type="time" size="lg" class="w-full" />
            </UFormField>
            <UFormField label="Bis">
              <UInput v-model="form.time_to as string" type="time" size="lg" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Ort">
            <UInput v-model="form.location as string" size="lg" class="w-full" icon="i-lucide-map-pin" />
          </UFormField>
          <UFormField label="Beschreibung">
            <UTextarea v-model="form.description as string" :rows="3" autoresize class="w-full" />
          </UFormField>
          <USwitch v-model="form.published" label="Auf der Webseite anzeigen" />
        </form>
      </template>
      <template #footer>
        <div class="flex w-full gap-2">
          <UButton color="neutral" variant="ghost" class="flex-1 justify-center" @click="open = false">Abbrechen</UButton>
          <UButton type="submit" form="event-form" icon="i-lucide-save" :loading="saving" class="flex-1 justify-center">Speichern</UButton>
        </div>
      </template>
    </USlideover>

    <AdminConfirm :open="!!toDelete" title="Termin löschen?" :description="toDelete?.title" @update:open="v => { if (!v) toDelete = null }" @confirm="remove" />
  </AdminPage>
</template>
