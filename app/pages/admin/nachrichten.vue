<script setup lang="ts">
import type { Message } from '~/types/models'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Nachrichten', robots: 'noindex' })

const table = useAdminTable('messages')
const unread = useState<number>('admin-unread')
const items = ref<Message[]>([])
const loading = ref(true)
const selected = ref<Message | null>(null)
const open = computed({ get: () => !!selected.value, set: (v) => { if (!v) selected.value = null } })

async function load() {
  items.value = await table.list()
  unread.value = items.value.filter(m => !m.read).length
  loading.value = false
}
onMounted(load)

async function show(m: Message) {
  selected.value = m
  if (!m.read) {
    m.read = true
    unread.value = Math.max(0, unread.value - 1)
    await table.save({ id: m.id, read: true })
  }
}

async function markUnread(m: Message) {
  m.read = false
  unread.value++
  selected.value = null
  await table.save({ id: m.id, read: false })
}

const toDelete = ref<Message | null>(null)
async function remove() {
  if (!toDelete.value) return
  await table.remove(toDelete.value.id)
  toDelete.value = null
  selected.value = null
  await load()
}

const replyLink = (m: Message) => `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Deine Anfrage'}`)}`
</script>

<template>
  <AdminPage title="Nachrichten">
    <div v-if="loading" class="space-y-2">
      <USkeleton v-for="i in 4" :key="i" class="h-16 w-full" />
    </div>
    <ul v-else class="divide-y divide-default rounded-xl ring ring-default overflow-hidden">
      <li v-for="m in items" :key="m.id">
        <button type="button" :class="['flex w-full items-start gap-3 p-3 sm:p-4 text-left hover:bg-elevated/50 transition', !m.read && 'bg-primary/5']" @click="show(m)">
          <span :class="['mt-2 size-2 shrink-0 rounded-full', m.read ? 'bg-transparent' : 'bg-primary']" />
          <span class="min-w-0 flex-1">
            <span class="flex items-baseline gap-2">
              <span :class="['truncate', m.read ? 'text-toned' : 'font-semibold text-highlighted']">{{ m.name }}</span>
              <span class="ml-auto shrink-0 text-xs text-muted">{{ formatDate(m.created_at, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</span>
            </span>
            <span v-if="m.subject" class="block truncate text-sm text-highlighted">{{ m.subject }}</span>
            <span class="block truncate text-sm text-muted">{{ m.message }}</span>
          </span>
        </button>
      </li>
    </ul>
    <UEmpty v-if="!loading && !items.length" icon="i-lucide-inbox" title="Keine Nachrichten" description="Anfragen über das Kontaktformular landen hier." />

    <USlideover v-model:open="open" :title="selected?.subject || 'Nachricht'" :description="selected ? `von ${selected.name}` : ''">
      <template #body>
        <div v-if="selected" class="space-y-4">
          <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt class="text-muted">Name</dt><dd>{{ selected.name }}</dd>
            <dt class="text-muted">E-Mail</dt><dd><ULink :to="`mailto:${selected.email}`" class="text-primary break-all">{{ selected.email }}</ULink></dd>
            <template v-if="selected.phone"><dt class="text-muted">Telefon</dt><dd><ULink :to="`tel:${selected.phone}`" class="text-primary">{{ selected.phone }}</ULink></dd></template>
            <dt class="text-muted">Datum</dt><dd>{{ formatDate(selected.created_at, { dateStyle: 'medium', timeStyle: 'short' }) }}</dd>
          </dl>
          <p class="whitespace-pre-line rounded-lg bg-elevated/60 p-4">{{ selected.message }}</p>
        </div>
      </template>
      <template #footer>
        <div v-if="selected" class="flex w-full flex-wrap gap-2">
          <UButton :to="replyLink(selected)" icon="i-lucide-reply" class="flex-1 justify-center">Antworten</UButton>
          <UButton color="neutral" variant="outline" icon="i-lucide-mail" aria-label="Als ungelesen markieren" @click="markUnread(selected)" />
          <UButton color="error" variant="soft" icon="i-lucide-trash-2" aria-label="Löschen" @click="toDelete = selected" />
        </div>
      </template>
    </USlideover>

    <AdminConfirm :open="!!toDelete" title="Nachricht löschen?" @update:open="v => { if (!v) toDelete = null }" @confirm="remove" />
  </AdminPage>
</template>
