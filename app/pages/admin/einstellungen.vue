<script setup lang="ts">
import type { SiteSettings } from '~/types/models'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Einstellungen', robots: 'noindex' })

const { load, save: saveSettings } = useAdminSettings()
const toast = useToast()
const state = ref<Partial<SiteSettings>>({})
const loading = ref(true)
const saving = ref(false)

onMounted(async () => {
  state.value = await load()
  loading.value = false
})

async function save() {
  saving.value = true
  try {
    await saveSettings(state.value)
    toast.add({ title: 'Einstellungen gespeichert', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: 'Speichern fehlgeschlagen', description: (e as Error).message, color: 'error' })
  } finally {
    saving.value = false
  }
}

const tabs = [
  { label: 'Start', icon: 'i-lucide-home', slot: 'start' as const },
  { label: 'Über uns', icon: 'i-lucide-heart', slot: 'about' as const },
  { label: 'Kontakt', icon: 'i-lucide-contact', slot: 'contact' as const }
]
</script>

<template>
  <AdminPage title="Einstellungen">
    <template #actions>
      <UButton icon="i-lucide-save" :loading="saving" :disabled="loading" @click="save">Speichern</UButton>
    </template>

    <USkeleton v-if="loading" class="h-96 w-full" />
    <UTabs v-else :items="tabs" class="w-full pb-24" :ui="{ list: 'w-full sm:w-auto', trigger: 'flex-1 sm:flex-initial' }">
      <template #start>
        <div class="grid gap-6 pt-4 lg:grid-cols-[1fr_320px]">
          <div class="space-y-5">
            <UFormField label="Hinweis-Banner" hint="leer = kein Banner" description="Erscheint ganz oben auf jeder Seite, z. B. „Neuer Honig ist da!“">
              <UInput v-model="state.announcement as string" class="w-full" />
            </UFormField>
            <UFormField label="Name der Imkerei">
              <UInput v-model="state.site_name" class="w-full" />
            </UFormField>
            <UFormField label="Slogan">
              <UInput v-model="state.tagline as string" class="w-full" />
            </UFormField>
            <UFormField label="Große Überschrift">
              <UTextarea v-model="state.hero_title as string" :rows="2" autoresize class="w-full" />
            </UFormField>
            <UFormField label="Einleitungstext">
              <UTextarea v-model="state.hero_text as string" :rows="4" autoresize class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Titelbild Startseite">
            <AdminImageUpload v-model="state.hero_image_url" v-model:ai="state.hero_image_ai" folder="site" aspect="aspect-[4/5]" />
          </UFormField>
        </div>
      </template>

      <template #about>
        <div class="grid gap-6 pt-4 lg:grid-cols-[1fr_320px]">
          <div class="space-y-5">
            <UFormField label="Überschrift">
              <UInput v-model="state.about_title as string" class="w-full" />
            </UFormField>
            <UFormField label="Kurz-Einleitung" description="Wird auch auf der Startseite angezeigt">
              <UTextarea v-model="state.about_intro as string" :rows="3" autoresize class="w-full" />
            </UFormField>
            <UFormField label="Ausführlicher Text">
              <AdminRichEditor v-model="state.about_text" />
            </UFormField>
          </div>
          <UFormField label="Foto">
            <AdminImageUpload v-model="state.about_image_url" v-model:ai="state.about_image_ai" folder="site" aspect="aspect-[4/5]" />
          </UFormField>
        </div>
      </template>

      <template #contact>
        <div class="grid max-w-2xl gap-5 pt-4 sm:grid-cols-2">
          <UFormField label="Inhaber/in" class="sm:col-span-2">
            <UInput v-model="state.owner_name as string" class="w-full" />
          </UFormField>
          <UFormField label="Straße & Nr." class="sm:col-span-2">
            <UInput v-model="state.street as string" class="w-full" />
          </UFormField>
          <UFormField label="PLZ">
            <UInput v-model="state.zip as string" inputmode="numeric" class="w-full" />
          </UFormField>
          <UFormField label="Ort">
            <UInput v-model="state.city as string" class="w-full" />
          </UFormField>
          <UFormField label="Telefon">
            <UInput v-model="state.phone as string" type="tel" class="w-full" />
          </UFormField>
          <UFormField label="E-Mail">
            <UInput v-model="state.email as string" type="email" class="w-full" />
          </UFormField>
          <UFormField label="Instagram-Name" class="sm:col-span-2">
            <UInput v-model="state.instagram_handle as string" class="w-full">
              <template #leading><span class="text-muted">@</span></template>
            </UInput>
          </UFormField>
          <UFormField label="Verkaufszeiten / Hofverkauf" class="sm:col-span-2" description="Zeilenumbrüche werden übernommen">
            <UTextarea v-model="state.sales_info as string" :rows="3" autoresize class="w-full" />
          </UFormField>
        </div>
      </template>
    </UTabs>
  </AdminPage>
</template>
