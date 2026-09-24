<script setup lang="ts">
defineProps<{ eyebrow?: string, title: string, description?: string | null, center?: boolean }>()
</script>

<template>
  <div :class="['max-w-2xl', center && 'mx-auto text-center']">
    <p v-if="eyebrow" class="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
      {{ eyebrow }}
    </p>
    <h2 class="font-display text-3xl sm:text-4xl font-semibold text-highlighted text-balance">
      {{ title }}
    </h2>
    <p v-if="description" class="mt-3 text-lg text-muted text-pretty">
      {{ description }}
    </p>
  </div>
</template>
