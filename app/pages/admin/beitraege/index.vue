<script setup lang="ts">
import type { Post } from '~/types/models'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Beiträge', robots: 'noindex' })

const table = useAdminTable('posts')
const items = ref<Post[]>([])
const loading = ref(true)

onMounted(async () => {
  items.value = await table.list()
  loading.value = false
})

const isScheduled = (p: Post) => p.published && new Date(p.published_at) > new Date()
</script>

<template>
  <AdminPage title="Beiträge">
    <template #actions>
      <UButton to="/admin/beitraege/neu" icon="i-lucide-plus">
        <span class="hidden sm:inline">Neuer Beitrag</span>
      </UButton>
    </template>

    <div v-if="loading" class="space-y-2">
      <USkeleton v-for="i in 4" :key="i" class="h-20 w-full" />
    </div>
    <ul v-else class="space-y-2">
      <li v-for="p in items" :key="p.id">
        <NuxtLink :to="`/admin/beitraege/${p.id}`" class="flex items-center gap-3 rounded-xl ring ring-default p-2.5 sm:p-3 hover:bg-elevated/50 transition">
          <MediaImage :src="p.image_url" class="h-14 w-20 shrink-0 rounded-lg" icon="i-lucide-newspaper" />
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-highlighted truncate">{{ p.title }}</p>
            <p class="text-sm text-muted">{{ formatDate(p.published_at) }}</p>
          </div>
          <UBadge v-if="!p.published" color="neutral" variant="subtle">Entwurf</UBadge>
          <UBadge v-else-if="isScheduled(p)" color="info" variant="subtle">Geplant</UBadge>
          <UBadge v-else color="success" variant="subtle" class="hidden sm:inline-flex">Online</UBadge>
          <UIcon name="i-lucide-chevron-right" class="size-5 text-dimmed shrink-0" />
        </NuxtLink>
      </li>
    </ul>
    <UEmpty v-if="!loading && !items.length" icon="i-lucide-newspaper" title="Noch keine Beiträge" :actions="[{ label: 'Ersten Beitrag schreiben', to: '/admin/beitraege/neu', icon: 'i-lucide-plus' }]" />
  </AdminPage>
</template>
