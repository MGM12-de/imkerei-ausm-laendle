<script setup lang="ts">
const route = useRoute()
const { data: post } = await usePost(String(route.params.slug))

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Beitrag nicht gefunden', fatal: true })
}

usePageSeo({
  title: () => post.value?.title,
  description: () => post.value?.excerpt || post.value?.content,
  image: () => post.value?.image_url,
  type: 'article'
})
useSeoMeta({ articlePublishedTime: () => post.value?.published_at })
</script>

<template>
  <article v-if="post" class="py-6 sm:py-12">
    <UContainer class="max-w-3xl">
      <UBreadcrumb :items="[{ label: 'Aktuelles', to: '/aktuelles' }, { label: post.title }]" class="mb-6" :ui="{ item: 'min-w-0', link: 'truncate' }" />
      <time :datetime="post.published_at" class="text-sm text-muted">{{ formatDate(post.published_at) }}</time>
      <h1 class="mt-2 font-display text-4xl sm:text-5xl font-semibold text-highlighted text-balance">{{ post.title }}</h1>
      <p v-if="post.excerpt" class="mt-4 text-xl text-muted text-pretty">{{ post.excerpt }}</p>
    </UContainer>
    <UContainer v-if="post.image_url" class="max-w-5xl mt-8">
      <MediaImage :src="post.image_url" :ai="post.image_ai" :alt="post.title" eager class="aspect-[16/9] rounded-3xl" />
    </UContainer>
    <UContainer class="max-w-3xl mt-8">
      <RichText :html="post.content" />
      <USeparator class="my-10" />
      <UButton to="/aktuelles" color="neutral" variant="ghost" icon="i-lucide-arrow-left">Alle Beiträge</UButton>
    </UContainer>
  </article>
</template>
