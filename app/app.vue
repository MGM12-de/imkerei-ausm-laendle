<script setup lang="ts">
import { de } from '@nuxt/ui/locale'

const { data: settings } = await useSettings()

useHead({
  titleTemplate: (t?: string) => t ? `${t} · ${settings.value?.site_name ?? 'Imkerei'}` : (settings.value?.site_name ?? 'Imkerei')
})

useSeoMeta({
  description: () => settings.value?.tagline ?? 'Regionaler Honig direkt vom Imker',
  ogSiteName: () => settings.value?.site_name,
  ogType: 'website',
  themeColor: '#f8b91c'
})
</script>

<template>
  <UApp :toast="{ position: 'top-center' }" :locale="de">
    <NuxtLoadingIndicator color="var(--color-honey-400)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
