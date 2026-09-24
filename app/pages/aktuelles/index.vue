<script setup lang="ts">
usePageSeo({ title: 'Aktuelles', description: 'Neues aus unserer Imkerei: Geschichten aus dem Bienenjahr, frische Ernten und Wissenswertes rund um Honig und Bienen.' })
const { data: posts } = await usePosts()
</script>

<template>
  <div>
    <PageIntro eyebrow="Blog" title="Aktuelles aus der Imkerei" description="Was gerade bei unseren Bienen los ist – und was ihr über Honig wissen solltet." />
    <UContainer class="py-8 sm:py-12">
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <PostCard v-for="p in posts" :key="p.id" :post="p" />
      </div>
      <UEmpty v-if="!posts?.length" icon="i-lucide-newspaper" title="Noch keine Beiträge" class="py-16" />
    </UContainer>
  </div>
</template>
