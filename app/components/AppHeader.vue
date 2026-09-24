<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { data: settings } = await useSettings()
const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  { label: 'Honig', to: '/honig', icon: 'i-lucide-droplet', active: route.path.startsWith('/honig') },
  { label: 'Über uns', to: '/ueber-uns', icon: 'i-lucide-heart' },
  { label: 'Aktuelles', to: '/aktuelles', icon: 'i-lucide-newspaper', active: route.path.startsWith('/aktuelles') },
  { label: 'Termine', to: '/termine', icon: 'i-lucide-calendar-days' },
  { label: 'Galerie', to: '/galerie', icon: 'i-lucide-images' },
  { label: 'Kontakt', to: '/kontakt', icon: 'i-lucide-mail' }
])
</script>

<template>
  <UHeader :title="settings?.site_name" :ui="{ root: 'bg-default/80' }">
    <template #title>
      <AppLogo :name="settings?.site_name" />
    </template>

    <UNavigationMenu :items="items" variant="link" :ui="{ link: 'text-[15px] font-medium' }" />

    <template #right>
      <UColorModeButton />
      <UButton
        v-if="settings?.instagram_handle"
        :to="instagramUrl(settings.instagram_handle)"
        target="_blank"
        icon="i-simple-icons-instagram"
        color="neutral"
        variant="ghost"
        aria-label="Instagram"
        class="hidden sm:inline-flex"
      />
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" :ui="{ link: 'text-base py-2.5' }" />
      <USeparator class="my-6" />
      <div class="flex flex-col gap-3">
        <UButton to="/kontakt" size="xl" block icon="i-lucide-message-circle">
          Honig anfragen
        </UButton>
        <UButton
          v-if="settings?.instagram_handle"
          :to="instagramUrl(settings.instagram_handle)"
          target="_blank"
          size="xl"
          block
          color="neutral"
          variant="subtle"
          icon="i-simple-icons-instagram"
        >
          @{{ settings.instagram_handle }}
        </UButton>
      </div>
    </template>
  </UHeader>
</template>
