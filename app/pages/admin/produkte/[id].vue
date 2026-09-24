<script setup lang="ts">
import { categoryLabels, type Product, type ProductCategory } from '~/types/models'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const id = String(route.params.id)
const isNew = id === 'neu'
useSeoMeta({ title: isNew ? 'Neues Produkt' : 'Produkt bearbeiten', robots: 'noindex' })

const table = useAdminTable('products')
const toast = useToast()
const saving = ref(false)
const slugTouched = ref(!isNew)

const state = ref<Partial<Product>>({
  name: '', slug: '', category: 'honig', short_description: '', description: '',
  taste: '', consistency: '', harvest: '', size: '500 g', price: null,
  image_url: null, image_ai: false, available: true, featured: false, published: true, sort: 0
})

onMounted(async () => {
  if (isNew) return
  const row = await table.get(id)
  if (!row) return navigateTo('/admin/produkte')
  state.value = row
})

watch(() => state.value.name, (name) => {
  if (!slugTouched.value && name) state.value.slug = slugify(name)
})

const categories = (Object.keys(categoryLabels) as ProductCategory[]).map(c => ({ label: categoryLabels[c], value: c }))

async function save() {
  if (!state.value.name?.trim()) return toast.add({ title: 'Bitte einen Namen eingeben', color: 'warning' })
  state.value.slug = slugify(state.value.slug || state.value.name)
  saving.value = true
  try {
    const saved = await table.save({ ...state.value, id: isNew ? undefined : id })
    toast.add({ title: 'Gespeichert', color: 'success', icon: 'i-lucide-check' })
    if (isNew) await navigateTo(`/admin/produkte/${saved.id}`, { replace: true })
  } finally {
    saving.value = false
  }
}

const confirmDelete = ref(false)
async function remove() {
  await table.remove(id)
  toast.add({ title: 'Produkt gelöscht', color: 'success' })
  await navigateTo('/admin/produkte')
}
</script>

<template>
  <AdminPage :title="isNew ? 'Neues Produkt' : (state.name || 'Produkt')" back="/admin/produkte">
    <template #actions>
      <UButton v-if="!isNew && state.published" :to="`/honig/${state.slug}`" target="_blank" icon="i-lucide-eye" color="neutral" variant="ghost" aria-label="Ansehen" />
      <UButton icon="i-lucide-save" :loading="saving" @click="save">Speichern</UButton>
    </template>

    <form class="grid gap-6 pb-24 lg:grid-cols-[1fr_320px]" @submit.prevent="save">
      <div class="space-y-5">
        <UFormField label="Name" required>
          <UInput v-model="state.name" size="xl" class="w-full" placeholder="z. B. Frühjahrsblütenhonig" />
        </UFormField>
        <UFormField label="Kurzbeschreibung" hint="erscheint auf der Übersicht">
          <UTextarea v-model="state.short_description as string" :rows="2" autoresize class="w-full" />
        </UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Preis (€)">
            <UInputNumber v-model="state.price as number" :step="0.5" :min="0" :format-options="{ style: 'currency', currency: 'EUR' }" locale="de-DE" class="w-full" />
          </UFormField>
          <UFormField label="Inhalt / Größe">
            <UInput v-model="state.size as string" placeholder="500 g" class="w-full" />
          </UFormField>
          <UFormField label="Geschmack">
            <UInput v-model="state.taste as string" placeholder="mild, blumig" class="w-full" />
          </UFormField>
          <UFormField label="Konsistenz">
            <UInput v-model="state.consistency as string" placeholder="cremig" class="w-full" />
          </UFormField>
          <UFormField label="Ernte">
            <UInput v-model="state.harvest as string" placeholder="Mai 2026" class="w-full" />
          </UFormField>
          <UFormField label="Kategorie">
            <USelect v-model="state.category" :items="categories" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Ausführliche Beschreibung">
          <AdminRichEditor v-model="state.description" />
        </UFormField>
      </div>

      <div class="space-y-5">
        <UFormField label="Produktbild">
          <AdminImageUpload v-model="state.image_url" v-model:ai="state.image_ai" folder="products" aspect="aspect-square" />
        </UFormField>
        <UCard :ui="{ body: 'space-y-4' }">
          <USwitch v-model="state.available" label="Verfügbar" description="Aus = „Ausverkauft“ wird angezeigt" />
          <USwitch v-model="state.published" label="Auf der Webseite sichtbar" />
          <USwitch v-model="state.featured" label="Auf der Startseite zeigen" />
        </UCard>
        <UCollapsible>
          <UButton label="Erweitert" color="neutral" variant="ghost" trailing-icon="i-lucide-chevron-down" size="sm" />
          <template #content>
            <div class="space-y-4 pt-3">
              <UFormField label="URL-Name (Slug)" :hint="`/honig/${state.slug}`">
                <UInput v-model="state.slug" class="w-full" @input="slugTouched = true" />
              </UFormField>
              <UFormField label="Reihenfolge" hint="kleinere Zahl = weiter vorne">
                <UInputNumber v-model="state.sort as number" class="w-full" />
              </UFormField>
            </div>
          </template>
        </UCollapsible>
        <UButton v-if="!isNew" color="error" variant="soft" icon="i-lucide-trash-2" block @click="confirmDelete = true">
          Produkt löschen
        </UButton>
      </div>
    </form>

    <AdminConfirm v-model:open="confirmDelete" title="Produkt löschen?" :description="`„${state.name}“ wird endgültig gelöscht.`" @confirm="remove" />
  </AdminPage>
</template>
