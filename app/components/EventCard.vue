<script setup lang="ts">
import type { EventItem } from '~/types/models'

defineProps<{ event: EventItem }>()
</script>

<template>
  <article class="flex gap-4 rounded-2xl bg-default ring ring-default p-4 sm:p-5">
    <div class="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 py-2 text-primary">
      <span class="text-xs font-semibold uppercase">{{ formatDate(event.date, { month: 'short' }) }}</span>
      <span class="font-display text-2xl font-bold leading-none">{{ formatDate(event.date, { day: 'numeric' }) }}</span>
      <span class="text-[11px] text-muted">{{ formatDate(event.date, { weekday: 'short' }) }}</span>
    </div>
    <div class="min-w-0">
      <h3 class="font-semibold text-highlighted text-lg leading-snug">{{ event.title }}</h3>
      <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <span v-if="event.time_from" class="inline-flex items-center gap-1.5">
          <UIcon name="i-lucide-clock" class="size-4" />{{ formatTimeRange(event.time_from, event.time_to) }}
        </span>
        <span v-if="event.location" class="inline-flex items-center gap-1.5">
          <UIcon name="i-lucide-map-pin" class="size-4" />{{ event.location }}
        </span>
      </div>
      <p v-if="event.description" class="mt-2 text-sm text-toned">{{ event.description }}</p>
    </div>
  </article>
</template>
