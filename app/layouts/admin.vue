<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const isDemo = useDemoMode()
const open = ref(false)

const unread = useState<number>('admin-unread', () => 0)
onMounted(async () => {
  const msgs = await useAdminTable('messages').list().catch(() => [])
  unread.value = msgs.filter(m => !m.read).length
})

const displayName = useState<string | null>('admin-display-name', () => null)
onMounted(async () => {
  const profile = await useProfile().load().catch(() => null)
  displayName.value = profile?.display_name ?? null
})

const items = computed<NavigationMenuItem[][]>(() => [[
  { label: 'Übersicht', icon: 'i-lucide-layout-dashboard', to: '/admin', exact: true, onSelect: () => { open.value = false } },
  { label: 'Produkte', icon: 'i-lucide-droplet', to: '/admin/produkte', onSelect: () => { open.value = false } },
  { label: 'Beiträge', icon: 'i-lucide-newspaper', to: '/admin/beitraege', onSelect: () => { open.value = false } },
  { label: 'Termine', icon: 'i-lucide-calendar-days', to: '/admin/termine', onSelect: () => { open.value = false } },
  { label: 'Galerie', icon: 'i-lucide-images', to: '/admin/galerie', onSelect: () => { open.value = false } },
  { label: 'Nachrichten', icon: 'i-lucide-inbox', to: '/admin/nachrichten', badge: unread.value ? String(unread.value) : undefined, onSelect: () => { open.value = false } },
  { label: 'Statistik', icon: 'i-lucide-chart-column', to: '/admin/statistik', onSelect: () => { open.value = false } },
  { label: 'Einstellungen', icon: 'i-lucide-settings', to: '/admin/einstellungen', onSelect: () => { open.value = false } },
  { label: 'Team', icon: 'i-lucide-users', to: '/admin/team', onSelect: () => { open.value = false } }
], [
  { label: 'Webseite ansehen', icon: 'i-lucide-external-link', to: '/', target: '_blank' }
]])

async function logout() {
  await supabase.auth.signOut()
  useState('is-admin').value = null
  await navigateTo('/admin/login')
}
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar v-model:open="open" collapsible :default-size="15" :ui="{ footer: 'border-t border-default' }">
      <template #header="{ collapsed }">
        <NuxtLink to="/admin" class="flex items-center">
          <AppLogo :compact="collapsed" name="Verwaltung" />
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu :collapsed="collapsed" :items="items[0]" orientation="vertical" tooltip />
        <UNavigationMenu :collapsed="collapsed" :items="items[1]" orientation="vertical" class="mt-auto" tooltip />
      </template>

      <template #footer="{ collapsed }">
        <div class="flex w-full items-center gap-2">
          <NuxtLink to="/admin/profil" class="flex min-w-0 flex-1 items-center gap-2 rounded-md hover:text-primary" aria-label="Mein Profil" @click="open = false">
            <UAvatar :text="(displayName || (user?.email as string | undefined))?.[0]?.toUpperCase() ?? 'I'" size="sm" class="bg-primary/15 text-primary" />
            <span v-if="!collapsed" class="min-w-0 flex-1 truncate text-sm text-muted">{{ displayName || user?.email || (isDemo ? 'Demo' : '') }}</span>
          </NuxtLink>
          <UTooltip text="Abmelden">
            <UButton v-if="!collapsed" icon="i-lucide-log-out" color="neutral" variant="ghost" aria-label="Abmelden" @click="logout" />
          </UTooltip>
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
