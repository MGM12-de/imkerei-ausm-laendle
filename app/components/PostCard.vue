<script setup lang="ts">
import type { Post } from '~/types/models'

defineProps<{ post: Post }>()
</script>

<template>
  <NuxtLink :to="`/aktuelles/${post.slug}`" class="group flex flex-col rounded-2xl bg-default ring ring-default overflow-hidden transition hover:ring-primary/50 hover:shadow-lg hover:shadow-primary/10">
    <MediaImage :src="post.image_url" :alt="post.title" icon="i-lucide-newspaper" class="aspect-[16/9]" />
    <div class="flex flex-1 flex-col p-5">
      <time :datetime="post.published_at" class="text-sm text-muted">{{ formatDate(post.published_at) }}</time>
      <h3 class="mt-1 font-display text-xl font-semibold text-highlighted group-hover:text-primary transition-colors text-balance">
        {{ post.title }}
      </h3>
      <p v-if="post.excerpt" class="mt-2 text-sm text-muted line-clamp-3">
        {{ post.excerpt }}
      </p>
      <span class="mt-auto pt-4 text-sm font-semibold text-primary inline-flex items-center gap-1">
        Weiterlesen <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </div>
  </NuxtLink>
</template>
