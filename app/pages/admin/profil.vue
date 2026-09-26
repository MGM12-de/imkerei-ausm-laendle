<script setup lang="ts">
import type { Profile } from '~/types/models'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Mein Profil', robots: 'noindex' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const isDemo = useDemoMode()
const profileApi = useProfile()
const toast = useToast()

const profile = ref<Profile>({ user_id: '', display_name: '' })
const loading = ref(true)
const savingName = ref(false)

onMounted(async () => {
  try {
    profile.value = await profileApi.load()
  } catch (e) {
    toast.add({ title: 'Laden fehlgeschlagen', description: (e as Error).message, color: 'error' })
  } finally {
    loading.value = false
  }
})

async function saveName() {
  savingName.value = true
  try {
    await profileApi.save(profile.value)
    useState('admin-display-name').value = profile.value.display_name?.trim() || null
    toast.add({ title: 'Profil gespeichert', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: 'Speichern fehlgeschlagen', description: (e as Error).message, color: 'error' })
  } finally {
    savingName.value = false
  }
}

const email = ref('')
const savingEmail = ref(false)
async function changeEmail() {
  if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) return toast.add({ title: 'Bitte gültige E-Mail eingeben', color: 'warning' })
  if (isDemo) return toast.add({ title: 'Im Demo-Modus nicht möglich', color: 'warning' })
  savingEmail.value = true
  const { error } = await supabase.auth.updateUser({ email: email.value.trim() }, { emailRedirectTo: `${window.location.origin}/admin/profil` })
  savingEmail.value = false
  if (error) return toast.add({ title: 'Fehler', description: error.message, color: 'error' })
  email.value = ''
  toast.add({ title: 'Bestätigung verschickt', description: 'Bitte bestätige die Änderung über den Link in der E-Mail.', color: 'success', icon: 'i-lucide-mail-check' })
}

const password = ref('')
const savingPassword = ref(false)
async function changePassword() {
  if (password.value.length < 8) return toast.add({ title: 'Mindestens 8 Zeichen', color: 'warning' })
  if (isDemo) return toast.add({ title: 'Im Demo-Modus nicht möglich', color: 'warning' })
  savingPassword.value = true
  const { error } = await supabase.auth.updateUser({ password: password.value })
  savingPassword.value = false
  if (error) return toast.add({ title: 'Fehler', description: error.message, color: 'error' })
  password.value = ''
  toast.add({ title: 'Passwort geändert', color: 'success', icon: 'i-lucide-check' })
}
</script>

<template>
  <AdminPage title="Mein Profil">
    <USkeleton v-if="loading" class="h-64 w-full max-w-xl" />

    <div v-else class="max-w-xl space-y-6 pb-24">
      <UCard>
        <template #header>
          <h2 class="font-semibold text-highlighted">Anzeigename</h2>
        </template>
        <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="saveName">
          <UFormField label="Name" description="Wird im Admin-Bereich und in der Team-Liste angezeigt" class="flex-1">
            <UInput v-model="profile.display_name as string" size="lg" class="w-full" autocomplete="name" />
          </UFormField>
          <UButton type="submit" icon="i-lucide-save" size="lg" :loading="savingName">Speichern</UButton>
        </form>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold text-highlighted">E-Mail-Adresse</h2>
          <p class="text-sm text-muted">Aktuell: {{ user?.email ?? (isDemo ? 'imker@example.de' : '') }}</p>
        </template>
        <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="changeEmail">
          <UFormField label="Neue E-Mail" class="flex-1">
            <UInput v-model="email" type="email" size="lg" class="w-full" autocomplete="email" />
          </UFormField>
          <UButton type="submit" icon="i-lucide-mail" size="lg" :loading="savingEmail">Ändern</UButton>
        </form>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold text-highlighted">Passwort</h2>
          <p class="text-sm text-muted">Alternativ kannst du dich beim Anmelden jederzeit einen Login-Link per E-Mail schicken lassen.</p>
        </template>
        <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="changePassword">
          <UFormField label="Neues Passwort" hint="min. 8 Zeichen" class="flex-1">
            <UInput v-model="password" type="password" size="lg" class="w-full" autocomplete="new-password" />
          </UFormField>
          <UButton type="submit" icon="i-lucide-key-round" size="lg" :loading="savingPassword">Ändern</UButton>
        </form>
      </UCard>
    </div>
  </AdminPage>
</template>
