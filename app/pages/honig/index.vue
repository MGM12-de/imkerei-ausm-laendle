<script setup lang="ts">
import { categoryLabels, type ProductCategory } from '~/types/models'

usePageSeo({ title: 'Honig & Produkte', description: 'Blütenhonig, Waldhonig und Bienenprodukte aus dem Ländle – schonend kalt geschleudert, von Hand abgefüllt und direkt vom Imker. Jetzt Sorten entdecken.' })

const { data: products } = await useProducts()
const filter = ref<ProductCategory | 'alle'>('alle')

const categories = computed(() => {
  const used = new Set(products.value?.map(p => p.category))
  return [
    { label: 'Alle', value: 'alle' as const },
    ...(Object.keys(categoryLabels) as ProductCategory[])
      .filter(c => used.has(c))
      .map(c => ({ label: categoryLabels[c], value: c }))
  ]
})

const filtered = computed(() => products.value?.filter(p => filter.value === 'alle' || p.category === filter.value) ?? [])
</script>

<template>
  <div>
    <PageIntro eyebrow="Honig & mehr" title="Unsere Produkte" description="Alle Preise ab Hof. Verfügbarkeit ändert sich mit der Saison – fragt gerne nach, wir legen euch Gläser zurück." />
    <UContainer class="py-8 sm:py-12">
      <div v-if="categories.length > 2" class="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <UButton
          v-for="c in categories"
          :key="c.value"
          :variant="filter === c.value ? 'solid' : 'soft'"
          :color="filter === c.value ? 'primary' : 'neutral'"
          class="shrink-0 rounded-full"
          @click="filter = c.value"
        >
          {{ c.label }}
        </UButton>
      </div>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard v-for="p in filtered" :key="p.id" :product="p" />
      </div>
      <UEmpty v-if="!filtered.length" icon="i-lucide-droplet" title="Gerade nichts im Angebot" description="Schaut bald wieder vorbei!" class="py-16" />

      <UAlert
        class="mt-12"
        color="primary"
        variant="subtle"
        icon="i-lucide-info"
        title="Kein Onlineshop"
        description="Bestellungen und Reservierungen laufen ganz unkompliziert über unser Kontaktformular, per Telefon oder Instagram."
        :actions="[{ label: 'Anfrage senden', to: '/kontakt', color: 'primary' }]"
      />
    </UContainer>
  </div>
</template>
