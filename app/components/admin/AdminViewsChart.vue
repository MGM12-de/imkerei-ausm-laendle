<script setup lang="ts">
// Balkendiagramm: Seitenaufrufe pro Tag
const props = defineProps<{ daily: { day: string, views: number }[] }>()

const max = computed(() => Math.max(1, ...props.daily.map(d => d.views)))
const label = (day: string) => formatDate(day, { weekday: 'short', day: '2-digit', month: '2-digit' })
</script>

<template>
  <div>
    <div class="relative mt-5 h-36 border-b border-default">
      <div class="absolute inset-x-0 top-0 border-t border-dashed border-default" />
      <span class="absolute -top-5 right-0 text-xs text-dimmed">{{ max }}</span>
      <div class="absolute inset-0 flex items-end gap-0.5 pt-px">
        <UTooltip v-for="d in daily" :key="d.day" :text="`${label(d.day)}: ${d.views} Aufrufe`" :content="{ side: 'top' }">
          <div class="group flex h-full min-w-0 flex-1 items-end rounded-t hover:bg-elevated/60">
            <div
              class="w-full rounded-t bg-primary transition group-hover:bg-primary/80"
              :style="{ height: d.views ? `max(2px, ${(d.views / max) * 100}%)` : '0' }"
            />
          </div>
        </UTooltip>
      </div>
    </div>
    <div v-if="daily.length" class="mt-1.5 flex justify-between text-xs text-dimmed">
      <span>{{ label(daily[0]!.day) }}</span>
      <span>{{ label(daily.at(-1)!.day) }}</span>
    </div>
    <table class="sr-only">
      <caption>Seitenaufrufe pro Tag</caption>
      <tr v-for="d in daily" :key="d.day">
        <th>{{ label(d.day) }}</th>
        <td>{{ d.views }}</td>
      </tr>
    </table>
  </div>
</template>
