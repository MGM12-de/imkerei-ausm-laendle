<script setup lang="ts">
import { de } from '@nuxt/ui/locale'

const { data: settings } = await useSettings()

useHead({
  link: [{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
  titleTemplate: (t?: string) => t ? `${t} · ${settings.value?.site_name ?? 'Imkerei'}` : (settings.value?.site_name ?? 'Imkerei')
})

useSeoMeta({
  description: 'Regionaler Honig direkt vom Imker aus dem Ländle – schonend kalt geschleudert, von Hand abgefüllt und ohne Zwischenhandel.',
  ogSiteName: () => settings.value?.site_name,
  ogLocale: 'de_DE',
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
