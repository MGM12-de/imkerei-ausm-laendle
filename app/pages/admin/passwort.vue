<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Neues Passwort', robots: 'noindex' })

const supabase = useSupabaseClient()
const route = useRoute()
const toast = useToast()
const welcome = computed(() => route.query.willkommen !== undefined)
const password = ref('')
const loading = ref(false)

async function save() {
  if (password.value.length < 8) {
    toast.add({ title: 'Mindestens 8 Zeichen', color: 'warning' })
    return
  }
  loading.value = true
  const { error } = await supabase.auth.updateUser({ password: password.value })
  loading.value = false
  if (error) return toast.add({ title: 'Fehler', description: error.message, color: 'error' })
  toast.add({ title: 'Passwort gespeichert', color: 'success' })
  await navigateTo('/admin')
}
</script>

<template>
  <div class="min-h-dvh bg-honeycomb flex items-center justify-center p-4">
    <UCard class="w-full max-w-sm shadow-xl">
      <h1 class="font-display text-2xl font-semibold text-highlighted mb-2">{{ welcome ? 'Willkommen im Team!' : 'Neues Passwort festlegen' }}</h1>
      <p v-if="welcome" class="mb-4 text-sm text-muted">Lege ein Passwort fest, mit dem du dich künftig in der Verwaltung anmeldest. Alternativ geht das Anmelden auch per Login-Link.</p>
      <div v-else class="mb-2" />
      <form class="space-y-4" @submit.prevent="save">
        <UFormField label="Neues Passwort" hint="min. 8 Zeichen">
          <UInput v-model="password" type="password" autocomplete="new-password" size="xl" class="w-full" />
        </UFormField>
        <UButton type="submit" block size="xl" :loading="loading">Speichern</UButton>
      </form>
    </UCard>
  </div>
</template>
