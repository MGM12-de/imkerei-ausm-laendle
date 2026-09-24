<script setup lang="ts">
defineProps<{ name?: string, compact?: boolean }>()
</script>

<template>
  <span class="flex items-center gap-2.5">
    <svg viewBox="0 0 64 64" class="size-9 shrink-0" aria-hidden="true">
      <path d="M32 4 56 18v28L32 60 8 46V18z" fill="var(--color-honey-400)" stroke="var(--color-honey-700)" stroke-width="4" stroke-linejoin="round" />
      <ellipse cx="32" cy="34" rx="9" ry="12" fill="var(--color-honey-950)" />
      <path d="M23.5 30h17M23 37h18" stroke="var(--color-honey-300)" stroke-width="3.5" />
      <ellipse cx="24" cy="22" rx="7" ry="5" fill="#fff" fill-opacity=".85" transform="rotate(-30 24 22)" />
      <ellipse cx="40" cy="22" rx="7" ry="5" fill="#fff" fill-opacity=".85" transform="rotate(30 40 22)" />
    </svg>
    <span v-if="!compact" class="leading-tight">
      <span class="block font-display text-lg font-semibold text-highlighted">{{ name ?? 'Imkerei ausm Ländle' }}</span>
    </span>
  </span>
</template>
