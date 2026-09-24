<script setup lang="ts">
import { categoryLabels } from '~/types/models'

const route = useRoute()
const slug = String(route.params.slug)
const { data: product } = await useProduct(slug)

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Produkt nicht gefunden', fatal: true })
}

useSeoMeta({
  title: () => product.value?.name,
  description: () => product.value?.short_description,
  ogImage: () => product.value?.image_url
})

const facts = computed(() => [
  { label: 'Geschmack', value: product.value?.taste, icon: 'i-lucide-sparkles' },
  { label: 'Konsistenz', value: product.value?.consistency, icon: 'i-lucide-droplets' },
  { label: 'Ernte', value: product.value?.harvest, icon: 'i-lucide-calendar' },
  { label: 'Inhalt', value: product.value?.size, icon: 'i-lucide-package' }
].filter(f => f.value))
</script>

<template>
  <UContainer v-if="product" class="py-6 sm:py-12">
    <UBreadcrumb :items="[{ label: 'Honig', to: '/honig' }, { label: product.name }]" class="mb-6" />
    <div class="grid gap-8 lg:grid-cols-2 lg:gap-14">
      <MediaImage :src="product.image_url" :alt="product.name" eager icon="i-lucide-droplet" class="aspect-square rounded-3xl" />
      <div>
        <UBadge color="neutral" variant="subtle">{{ categoryLabels[product.category] }}</UBadge>
        <h1 class="mt-3 font-display text-4xl sm:text-5xl font-semibold text-highlighted">{{ product.name }}</h1>
        <p v-if="product.short_description" class="mt-3 text-lg text-muted">{{ product.short_description }}</p>

        <div class="mt-6 flex items-center gap-4">
          <span class="text-3xl font-semibold text-highlighted">{{ formatPrice(product.price) }}</span>
          <UBadge v-if="product.available" color="success" variant="subtle" icon="i-lucide-check" size="lg">Verfügbar</UBadge>
          <UBadge v-else color="neutral" variant="subtle" icon="i-lucide-clock" size="lg">Derzeit ausverkauft</UBadge>
        </div>

        <dl v-if="facts.length" class="mt-8 grid grid-cols-2 gap-3">
          <div v-for="f in facts" :key="f.label" class="rounded-xl bg-elevated/70 p-4">
            <dt class="flex items-center gap-1.5 text-sm text-muted"><UIcon :name="f.icon" class="size-4" />{{ f.label }}</dt>
            <dd class="mt-1 font-semibold text-highlighted">{{ f.value }}</dd>
          </div>
        </dl>

        <RichText :html="product.description" class="mt-8" />

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <UButton :to="{ path: '/kontakt', query: { betreff: `Anfrage: ${product.name}` } }" size="xl" icon="i-lucide-message-circle" class="justify-center">
            {{ product.available ? 'Jetzt anfragen' : 'Benachrichtigen, wenn verfügbar' }}
          </UButton>
          <UButton to="/honig" size="xl" color="neutral" variant="ghost" icon="i-lucide-arrow-left" class="justify-center">
            Alle Produkte
          </UButton>
        </div>
      </div>
    </div>
  </UContainer>
</template>
