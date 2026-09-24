<script setup lang="ts">
import { categoryLabels, type Product } from '~/types/models'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Produkte', robots: 'noindex' })

const table = useAdminTable('products')
const items = ref<Product[]>([])
const loading = ref(true)
const q = ref('')

async function load() {
  loading.value = true
  items.value = await table.list()
  loading.value = false
}
onMounted(load)

const filtered = computed(() => items.value.filter(p => p.name.toLowerCase().includes(q.value.toLowerCase())))

async function toggle(p: Product, field: 'available' | 'published') {
  const next = !p[field]
  p[field] = next
  try {
    await table.save({ id: p.id, [field]: next })
  } catch {
    p[field] = !next
  }
}
</script>

<template>
  <AdminPage title="Produkte">
    <template #actions>
      <UButton to="/admin/produkte/neu" icon="i-lucide-plus">
        <span class="hidden sm:inline">Neues Produkt</span>
      </UButton>
    </template>

    <UInput v-model="q" icon="i-lucide-search" placeholder="Suchen …" class="mb-4 w-full sm:max-w-xs" />

    <div v-if="loading" class="space-y-2">
      <USkeleton v-for="i in 4" :key="i" class="h-20 w-full" />
    </div>

    <ul v-else class="space-y-2">
      <li v-for="p in filtered" :key="p.id" class="flex items-center gap-3 rounded-xl ring ring-default p-2.5 sm:p-3">
        <NuxtLink :to="`/admin/produkte/${p.id}`" class="flex min-w-0 flex-1 items-center gap-3">
          <MediaImage :src="p.image_url" class="size-14 shrink-0 rounded-lg sm:size-16" icon="i-lucide-droplet" />
          <div class="min-w-0">
            <p class="font-semibold text-highlighted truncate">{{ p.name }}</p>
            <p class="text-sm text-muted truncate">{{ categoryLabels[p.category] }} · {{ p.size }} · {{ formatPrice(p.price) }}</p>
            <div class="mt-1 flex gap-1.5 sm:hidden">
              <UBadge v-if="!p.published" size="sm" color="neutral" variant="subtle">Versteckt</UBadge>
              <UBadge v-if="!p.available" size="sm" color="warning" variant="subtle">Ausverkauft</UBadge>
            </div>
          </div>
        </NuxtLink>
        <div class="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-5">
          <USwitch :model-value="p.available" label="Verfügbar" size="sm" class="hidden sm:flex" @update:model-value="toggle(p, 'available')" />
          <USwitch :model-value="p.published" label="Sichtbar" size="sm" class="hidden sm:flex" @update:model-value="toggle(p, 'published')" />
          <UButton :to="`/admin/produkte/${p.id}`" icon="i-lucide-pencil" color="neutral" variant="ghost" aria-label="Bearbeiten" />
        </div>
      </li>
    </ul>
    <UEmpty v-if="!loading && !filtered.length" icon="i-lucide-droplet" title="Keine Produkte" description="Lege dein erstes Produkt an." :actions="[{ label: 'Produkt anlegen', to: '/admin/produkte/neu', icon: 'i-lucide-plus' }]" />
  </AdminPage>
</template>
