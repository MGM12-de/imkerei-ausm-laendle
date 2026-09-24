<script setup lang="ts">
// Grundgerüst jeder Admin-Seite: Navbar (mit Mobile-Menü-Button) + Inhalt
defineProps<{ title: string, back?: string }>()
const isDemo = useDemoMode()
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="title">
        <template #leading>
          <UDashboardSidebarCollapse />
          <UButton v-if="back" :to="back" icon="i-lucide-arrow-left" color="neutral" variant="ghost" aria-label="Zurück" />
        </template>
        <template #right>
          <slot name="actions" />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <UAlert
        v-if="isDemo"
        color="warning"
        variant="subtle"
        icon="i-lucide-flask-conical"
        title="Demo-Modus"
        description="Es ist noch keine Datenbank verbunden. Änderungen werden nur vorübergehend im Browser gespeichert."
        class="mb-4 shrink-0"
      />
      <slot />
    </template>
  </UDashboardPanel>
</template>
