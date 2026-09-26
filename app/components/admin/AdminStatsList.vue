<script setup lang="ts">
import type { StatsEntry } from '~/types/models'

// Rangliste mit dezentem Balken im Hintergrund (Top-Seiten, Herkunft …)
const props = defineProps<{ items: StatsEntry[], format?: (label: string) => string, empty?: string }>()

const max = computed(() => Math.max(1, ...props.items.map(i => i.views)))
</script>

<template>
  <ul class="space-y-1">
    <li v-for="i in items" :key="i.label" class="relative flex items-center justify-between gap-3 px-2 py-1.5 text-sm">
      <div class="absolute inset-y-0 left-0 rounded bg-primary/15" :style="{ width: `${(i.views / max) * 100}%` }" />
      <span class="relative truncate text-highlighted">{{ format ? format(i.label) : i.label }}</span>
      <span class="relative shrink-0 tabular-nums text-muted">{{ i.views }}</span>
    </li>
    <li v-if="!items.length" class="py-2 text-sm text-muted">{{ empty ?? 'Noch keine Daten.' }}</li>
  </ul>
</template>
