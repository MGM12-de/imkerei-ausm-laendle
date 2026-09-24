<script setup lang="ts">
import type { Post } from '~/types/models'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const id = String(route.params.id)
const isNew = id === 'neu'
useSeoMeta({ title: isNew ? 'Neuer Beitrag' : 'Beitrag bearbeiten', robots: 'noindex' })

const table = useAdminTable('posts')
const toast = useToast()
const saving = ref(false)
const slugTouched = ref(!isNew)

const state = ref<Partial<Post>>({
  title: '', slug: '', excerpt: '', content: '', image_url: null,
  published: false, published_at: new Date().toISOString()
})

// datetime-local <-> ISO
const publishedAtLocal = computed({
  get: () => {
    const d = new Date(state.value.published_at ?? Date.now())
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  },
  set: (v: string) => { state.value.published_at = new Date(v).toISOString() }
})

onMounted(async () => {
  if (isNew) return
  const row = await table.get(id)
  if (!row) return navigateTo('/admin/beitraege')
  state.value = row
})

watch(() => state.value.title, (t) => {
  if (!slugTouched.value && t) state.value.slug = slugify(t)
})

async function save(publish?: boolean) {
  if (!state.value.title?.trim()) return toast.add({ title: 'Bitte einen Titel eingeben', color: 'warning' })
  if (publish !== undefined) state.value.published = publish
  state.value.slug = slugify(state.value.slug || state.value.title)
  saving.value = true
  try {
    const saved = await table.save({ ...state.value, id: isNew ? undefined : id })
    toast.add({ title: state.value.published ? 'Veröffentlicht' : 'Entwurf gespeichert', color: 'success', icon: 'i-lucide-check' })
    if (isNew) await navigateTo(`/admin/beitraege/${saved.id}`, { replace: true })
  } finally {
    saving.value = false
  }
}

const confirmDelete = ref(false)
async function remove() {
  await table.remove(id)
  toast.add({ title: 'Beitrag gelöscht', color: 'success' })
  await navigateTo('/admin/beitraege')
}
</script>

<template>
  <AdminPage :title="isNew ? 'Neuer Beitrag' : 'Beitrag bearbeiten'" back="/admin/beitraege">
    <template #actions>
      <UButton v-if="!state.published" color="neutral" variant="outline" :loading="saving" class="hidden sm:inline-flex" @click="save(false)">Entwurf speichern</UButton>
      <UButton icon="i-lucide-send" :loading="saving" @click="save(true)">{{ state.published ? 'Speichern' : 'Veröffentlichen' }}</UButton>
    </template>

    <div class="grid gap-6 pb-24 lg:grid-cols-[1fr_320px]">
      <div class="space-y-5">
        <UFormField label="Titel" required>
          <UInput v-model="state.title" size="xl" class="w-full" placeholder="Worum geht's?" />
        </UFormField>
        <UFormField label="Kurztext / Teaser" hint="erscheint in der Übersicht">
          <UTextarea v-model="state.excerpt as string" :rows="2" autoresize class="w-full" />
        </UFormField>
        <UFormField label="Inhalt">
          <AdminRichEditor v-model="state.content" placeholder="Erzähl, was bei den Bienen los ist …" />
        </UFormField>
      </div>
      <div class="space-y-5">
        <UFormField label="Titelbild">
          <AdminImageUpload v-model="state.image_url" folder="posts" aspect="aspect-[16/9]" />
        </UFormField>
        <UCard :ui="{ body: 'space-y-4' }">
          <USwitch v-model="state.published" label="Veröffentlicht" />
          <UFormField label="Datum" hint="in der Zukunft = geplant">
            <UInput v-model="publishedAtLocal" type="datetime-local" class="w-full" />
          </UFormField>
          <UFormField label="URL-Name (Slug)" :hint="`/aktuelles/${state.slug}`">
            <UInput v-model="state.slug" class="w-full" @input="slugTouched = true" />
          </UFormField>
        </UCard>
        <UButton v-if="!state.published" color="neutral" variant="outline" block class="sm:hidden" :loading="saving" @click="save(false)">Als Entwurf speichern</UButton>
        <UButton v-if="!isNew" color="error" variant="soft" icon="i-lucide-trash-2" block @click="confirmDelete = true">Beitrag löschen</UButton>
      </div>
    </div>

    <AdminConfirm v-model:open="confirmDelete" title="Beitrag löschen?" :description="`„${state.title}“ wird endgültig gelöscht.`" @confirm="remove" />
  </AdminPage>
</template>
