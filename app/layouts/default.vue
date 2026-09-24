<script setup lang="ts">
const { data: settings } = await useSettings()
const isDemo = useDemoMode()
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <UBanner
      v-if="settings?.announcement"
      id="announcement"
      :title="settings.announcement"
      icon="i-lucide-megaphone"
      close
      :ui="{ root: 'bg-primary', title: 'text-inverted font-medium' }"
    />
    <AppHeader />
    <UMain class="flex-1">
      <slot />
    </UMain>
    <AppFooter />
    <div v-if="isDemo" class="fixed bottom-3 left-3 z-50">
      <UBadge color="warning" variant="solid" icon="i-lucide-flask-conical" size="sm">
        Demo-Modus
      </UBadge>
    </div>
  </div>
</template>
