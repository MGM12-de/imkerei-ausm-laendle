<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Anmelden', robots: 'noindex' })

const supabase = useSupabaseClient()
const route = useRoute()
const toast = useToast()
const isDemo = useDemoMode()

const schema = z.object({
  email: z.string().email('Bitte gültige E-Mail eingeben'),
  password: z.string().min(6, 'Mindestens 6 Zeichen')
})
type Schema = z.output<typeof schema>

const state = reactive({ email: '', password: '' })
const loading = ref(false)
const resetSent = ref(false)
const mode = ref<'password' | 'link'>('password')
const linkSent = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (isDemo) return navigateTo('/admin')
  loading.value = true
  const { error } = await supabase.auth.signInWithPassword(event.data)
  loading.value = false
  if (error) {
    toast.add({ title: 'Anmeldung fehlgeschlagen', description: 'E-Mail oder Passwort ist falsch.', color: 'error' })
    return
  }
  useState('is-admin').value = null
  await navigateTo(typeof route.query.redirect === 'string' ? route.query.redirect : '/admin')
}

// Login-Link: kein Passwort nötig, nur bestehende Konten (neue Konten nur per Einladung)
async function sendLoginLink() {
  if (isDemo) return navigateTo('/admin')
  if (!z.string().email().safeParse(state.email).success) {
    toast.add({ title: 'Bitte gültige E-Mail eingeben', color: 'warning' })
    return
  }
  loading.value = true
  const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/admin') ? route.query.redirect : '/admin'
  const { error } = await supabase.auth.signInWithOtp({
    email: state.email,
    options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}${redirect}` }
  })
  loading.value = false
  // Nicht verraten, ob es ein Konto zu der Adresse gibt – nur Wartezeit melden
  if (error?.status === 429) {
    toast.add({ title: 'Bitte kurz warten', description: 'Aus Sicherheitsgründen geht das nur einmal pro Minute.', color: 'warning' })
    return
  }
  linkSent.value = true
}

async function resetPassword() {
  if (!state.email) {
    toast.add({ title: 'Bitte zuerst die E-Mail-Adresse eingeben', color: 'warning' })
    return
  }
  const { error } = await supabase.auth.resetPasswordForEmail(state.email, {
    redirectTo: `${window.location.origin}/admin/passwort`
  })
  if (error) toast.add({ title: 'Fehler', description: error.message, color: 'error' })
  else resetSent.value = true
}
</script>

<template>
  <div class="min-h-dvh bg-honeycomb flex items-center justify-center p-4">
    <UCard class="w-full max-w-sm shadow-xl" :ui="{ body: 'p-6 sm:p-8' }">
      <div class="flex flex-col items-center text-center mb-6">
        <AppLogo compact />
        <h1 class="mt-3 font-display text-2xl font-semibold text-highlighted">Verwaltung</h1>
        <p class="text-sm text-muted">Melde dich an, um Inhalte zu bearbeiten.</p>
      </div>

      <UAlert v-if="route.query.error === 'forbidden'" color="error" variant="subtle" title="Kein Zugriff" description="Dieses Konto ist nicht als Admin freigeschaltet." class="mb-4" />
      <UAlert v-if="isDemo" color="warning" variant="subtle" icon="i-lucide-flask-conical" title="Demo-Modus" description="Keine Datenbank verbunden – einfach auf „Anmelden“ klicken." class="mb-4" />
      <UAlert v-if="resetSent" color="success" variant="subtle" title="E-Mail verschickt" description="Schau in dein Postfach und folge dem Link." class="mb-4" />
      <UAlert v-if="linkSent" color="success" variant="subtle" icon="i-lucide-mail-check" title="Login-Link verschickt" description="Falls ein Konto zu dieser Adresse existiert, bekommst du gleich eine E-Mail. Ein Klick auf den Link meldet dich an." class="mb-4" />

      <UTabs
        v-model="mode"
        :items="[{ label: 'Passwort', value: 'password', icon: 'i-lucide-key-round' }, { label: 'Login-Link', value: 'link', icon: 'i-lucide-mail' }]"
        :content="false"
        size="sm"
        class="mb-4"
      />

      <form v-if="mode === 'link'" class="space-y-4" @submit.prevent="sendLoginLink">
        <UFormField label="E-Mail" name="email" description="Wir schicken dir einen Link, mit dem du dich ohne Passwort anmeldest.">
          <UInput v-model="state.email" type="email" autocomplete="username" size="xl" class="w-full" />
        </UFormField>
        <UButton type="submit" block size="xl" icon="i-lucide-send" :loading="loading">Login-Link senden</UButton>
      </form>

      <UForm v-else :schema="isDemo ? undefined : schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="E-Mail" name="email">
          <UInput v-model="state.email" type="email" autocomplete="username" size="xl" class="w-full" />
        </UFormField>
        <UFormField label="Passwort" name="password">
          <UInput v-model="state.password" type="password" autocomplete="current-password" size="xl" class="w-full" />
        </UFormField>
        <UButton type="submit" block size="xl" :loading="loading">Anmelden</UButton>
      </UForm>

      <div class="mt-4 flex justify-between text-sm">
        <ULink to="/" class="text-muted hover:text-primary">← Zur Webseite</ULink>
        <button v-if="mode === 'password'" type="button" class="text-muted hover:text-primary" @click="resetPassword">Passwort vergessen?</button>
      </div>
    </UCard>
  </div>
</template>
