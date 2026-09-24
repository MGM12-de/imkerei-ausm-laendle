<script setup lang="ts">
import { categoryLabels, type Product } from '~/types/models'

defineProps<{ product: Product }>()
</script>

<template>
  <NuxtLink :to="`/honig/${product.slug}`" class="group flex flex-col rounded-2xl bg-default ring ring-default overflow-hidden transition hover:ring-primary/50 hover:shadow-lg hover:shadow-primary/10 focus-visible:outline-2 focus-visible:outline-primary">
    <MediaImage :src="product.image_url" :ai="product.image_ai" :alt="product.name" icon="i-lucide-droplet" class="aspect-[4/3]">
      <div class="absolute top-3 left-3 flex gap-2">
        <UBadge v-if="!product.available" color="neutral" variant="solid">Ausverkauft</UBadge>
        <UBadge v-else-if="product.featured" color="primary" variant="solid">Beliebt</UBadge>
      </div>
    </MediaImage>
    <div class="flex flex-1 flex-col p-5">
      <p class="text-xs font-semibold uppercase tracking-wider text-muted">
        {{ categoryLabels[product.category] }}<template v-if="product.size"> · {{ product.size }}</template>
      </p>
      <h3 class="mt-1 font-display text-xl font-semibold text-highlighted group-hover:text-primary transition-colors">
        {{ product.name }}
      </h3>
      <p v-if="product.short_description" class="mt-2 text-sm text-muted line-clamp-2">
        {{ product.short_description }}
      </p>
      <div class="mt-auto pt-4 flex items-center justify-between">
        <span class="text-lg font-semibold text-highlighted">{{ formatPrice(product.price) }}</span>
        <UIcon name="i-lucide-arrow-right" class="size-5 text-primary transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  </NuxtLink>
</template>
