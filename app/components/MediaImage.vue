<script setup lang="ts">
// Zeigt ein Bild – oder einen hübschen Waben-Platzhalter, solange keins hochgeladen ist.
withDefaults(defineProps<{
  src?: string | null
  alt?: string
  icon?: string
  eager?: boolean
}>(), { icon: 'i-lucide-hexagon' })
</script>

<template>
  <div class="relative overflow-hidden bg-honey-100 dark:bg-honey-950/60">
    <img
      v-if="src"
      :src="src"
      :alt="alt ?? ''"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      class="absolute inset-0 size-full object-cover"
    >
    <div v-else class="absolute inset-0 bg-honeycomb flex items-center justify-center bg-gradient-to-br from-honey-200/70 via-honey-100 to-honey-300/60 dark:from-honey-900/50 dark:via-honey-950/40 dark:to-honey-800/40">
      <UIcon :name="icon" class="size-12 text-honey-500/70" />
    </div>
    <slot />
  </div>
</template>
