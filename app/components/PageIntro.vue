<script setup lang="ts">
defineProps<{ title: string, description?: string | null, eyebrow?: string }>()
</script>

<template>
  <section class="relative overflow-hidden border-b border-default">
    <div class="absolute inset-0 bg-honeycomb opacity-60 [mask-image:linear-gradient(to_right,transparent,black)]" />
    <UContainer class="relative py-10 sm:py-14">
      <p v-if="eyebrow" class="text-sm font-semibold uppercase tracking-wider text-primary mb-2">{{ eyebrow }}</p>
      <h1 class="font-display text-4xl sm:text-5xl font-semibold text-highlighted text-balance">{{ title }}</h1>
      <p v-if="description" class="mt-3 max-w-2xl text-lg text-muted text-pretty">{{ description }}</p>
      <slot />
    </UContainer>
  </section>
</template>
