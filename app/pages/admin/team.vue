<script setup lang="ts">
import type { TeamMember } from '~/types/models'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Team', robots: 'noindex' })

const team = useTeam()
const user = useSupabaseUser()
const toast = useToast()
const members = ref<TeamMember[]>([])
const loading = ref(true)

async function load() {
  try {
    members.value = await team.list()
  } catch (e) {
    toast.add({ title: 'Laden fehlgeschlagen', description: (e as Error).message, color: 'error' })
  } finally {
    loading.value = false
  }
}
onMounted(load)

const isMe = (m: TeamMember) => m.user_id === (user.value?.sub ?? 'demo-1')

const open = ref(false)
const sending = ref(false)
const form = reactive({ email: '', name: '' })

function openInvite() {
  form.email = ''
  form.name = ''
  open.value = true
}

async function invite() {
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return toast.add({ title: 'Bitte gültige E-Mail eingeben', color: 'warning' })
  sending.value = true
  try {
    const { invited } = await team.invite(form.email.trim(), form.name.trim())
    open.value = false
    toast.add(invited
      ? { title: 'Einladung verschickt', description: `${form.email} bekommt eine E-Mail mit einem Link zum Passwort-Festlegen.`, color: 'success', icon: 'i-lucide-mail-check' }
      : { title: 'Admin-Rechte vergeben', description: `${form.email} hatte schon ein Konto und kann sich jetzt im Admin-Bereich anmelden.`, color: 'success', icon: 'i-lucide-check' })
    await load()
  } catch (e) {
    const err = e as { data?: { statusMessage?: string }, message?: string }
    toast.add({ title: 'Einladen fehlgeschlagen', description: err.data?.statusMessage ?? err.message, color: 'error' })
  } finally {
    sending.value = false
  }
}

const toRemove = ref<TeamMember | null>(null)
async function remove() {
  if (!toRemove.value) return
  try {
    await team.remove(toRemove.value.user_id)
    toast.add({ title: 'Admin-Rechte entfernt', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: 'Entfernen fehlgeschlagen', description: (e as Error).message, color: 'error' })
  }
  toRemove.value = null
  await load()
}
</script>

<template>
  <AdminPage title="Team">
    <template #actions>
      <UButton icon="i-lucide-user-plus" @click="openInvite">
        <span class="hidden sm:inline">Admin einladen</span>
      </UButton>
    </template>

    <p class="mb-4 text-sm text-muted">
      Alle hier aufgeführten Personen können die Webseite bearbeiten. Eingeladene bekommen eine E-Mail mit einem Link, über den sie ihr Passwort festlegen.
    </p>

    <div v-if="loading" class="space-y-2">
      <USkeleton v-for="i in 2" :key="i" class="h-16 w-full" />
    </div>

    <ul v-else class="space-y-2">
      <li v-for="m in members" :key="m.user_id" class="flex items-center gap-3 rounded-xl ring ring-default p-3">
        <UAvatar :text="(m.display_name || m.email)[0]?.toUpperCase()" class="bg-primary/15 text-primary" />
        <div class="min-w-0 flex-1">
          <p class="truncate font-semibold text-highlighted">
            {{ m.display_name || m.email }}
            <span v-if="isMe(m)" class="font-normal text-muted">(du)</span>
          </p>
          <p class="truncate text-sm text-muted">
            <template v-if="m.display_name">{{ m.email }} · </template>
            <template v-if="m.last_sign_in_at">zuletzt angemeldet {{ formatDate(m.last_sign_in_at) }}</template>
            <template v-else>eingeladen {{ formatDate(m.invited_at || m.created_at) }}</template>
          </p>
        </div>
        <UBadge v-if="!m.last_sign_in_at" color="warning" variant="subtle">Einladung offen</UBadge>
        <UButton v-if="!isMe(m)" icon="i-lucide-user-minus" color="error" variant="ghost" aria-label="Admin-Rechte entfernen" @click="toRemove = m" />
      </li>
    </ul>

    <UModal v-model:open="open" title="Admin einladen" description="Die Person bekommt eine E-Mail und kann danach alles im Admin-Bereich bearbeiten.">
      <template #body>
        <form id="invite-form" class="space-y-4" @submit.prevent="invite">
          <UFormField label="E-Mail" required>
            <UInput v-model="form.email" type="email" size="lg" class="w-full" autocomplete="off" placeholder="name@example.de" />
          </UFormField>
          <UFormField label="Name" hint="optional">
            <UInput v-model="form.name" size="lg" class="w-full" autocomplete="off" />
          </UFormField>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="open = false">Abbrechen</UButton>
          <UButton type="submit" form="invite-form" icon="i-lucide-send" :loading="sending">Einladung senden</UButton>
        </div>
      </template>
    </UModal>

    <AdminConfirm
      :open="!!toRemove"
      title="Admin-Rechte entfernen?"
      :description="`${toRemove?.display_name || toRemove?.email} kann danach nichts mehr im Admin-Bereich bearbeiten. Das Konto selbst bleibt bestehen.`"
      confirm-label="Entfernen"
      @update:open="v => { if (!v) toRemove = null }"
      @confirm="remove"
    />
  </AdminPage>
</template>
