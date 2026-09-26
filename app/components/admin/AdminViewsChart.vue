<script setup lang="ts">
// Balkendiagramm pro Tag: Besucher (kräftig) vor Seitenaufrufen (hell)
const props = defineProps<{ daily: { day: string, views: number, visitors: number }[] }>()

const max = computed(() => Math.max(1, ...props.daily.map(d => d.views)))
const label = (day: string) => formatDate(day, { weekday: 'short', day: '2-digit', month: '2-digit' })
const height = (n: number) => n ? `max(2px, ${(n / max.value) * 100}%)` : '0'
</script>

<template>
  <div>
    <div class="flex items-center gap-4 text-xs text-muted">
      <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-sm bg-primary" />Besucher</span>
      <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-sm bg-primary/30" />Seitenaufrufe</span>
      <span class="ml-auto text-dimmed">max. {{ max }}</span>
    </div>
    <div class="relative mt-2 h-36 border-b border-default">
      <div class="absolute inset-x-0 top-0 border-t border-dashed border-default" />
      <div class="absolute inset-0 flex items-end gap-0.5 pt-px">
        <UTooltip v-for="d in daily" :key="d.day" :text="`${label(d.day)}: ${d.visitors} Besucher · ${d.views} Aufrufe`" :content="{ side: 'top' }">
          <div class="group relative h-full min-w-0 flex-1 rounded-t hover:bg-elevated/60">
            <div class="absolute inset-x-0 bottom-0 rounded-t bg-primary/30" :style="{ height: height(d.views) }" />
            <div class="absolute inset-x-0 bottom-0 rounded-t bg-primary transition group-hover:bg-primary/80" :style="{ height: height(d.visitors) }" />
          </div>
        </UTooltip>
      </div>
    </div>
    <div v-if="daily.length" class="mt-1.5 flex justify-between text-xs text-dimmed">
      <span>{{ label(daily[0]!.day) }}</span>
      <span>{{ label(daily.at(-1)!.day) }}</span>
    </div>
    <table class="sr-only">
      <caption>Besucher und Seitenaufrufe pro Tag</caption>
      <tr>
        <th>Tag</th>
        <th>Besucher</th>
        <th>Seitenaufrufe</th>
      </tr>
      <tr v-for="d in daily" :key="d.day">
        <th>{{ label(d.day) }}</th>
        <td>{{ d.visitors }}</td>
        <td>{{ d.views }}</td>
      </tr>
    </table>
  </div>
</template>
