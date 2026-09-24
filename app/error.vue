<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
useSeoMeta({ title: props.error.statusCode === 404 ? 'Seite nicht gefunden' : 'Fehler' })
</script>

<template>
  <UApp>
    <NuxtLayout>
      <UContainer class="py-24 text-center">
        <p class="font-display text-7xl font-bold text-primary">{{ error.statusCode }}</p>
        <h1 class="mt-4 font-display text-3xl font-semibold text-highlighted">
          {{ error.statusCode === 404 ? 'Hier summt leider nichts' : 'Da ist etwas schiefgelaufen' }}
        </h1>
        <p class="mt-3 text-muted">{{ error.statusCode === 404 ? 'Die Seite gibt es nicht (mehr).' : error.statusMessage }}</p>
        <UButton class="mt-8" size="lg" icon="i-lucide-home" @click="clearError({ redirect: '/' })">Zur Startseite</UButton>
      </UContainer>
    </NuxtLayout>
  </UApp>
</template>
