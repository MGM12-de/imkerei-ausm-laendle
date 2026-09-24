<script setup lang="ts">
useSeoMeta({ title: 'Galerie', description: 'Eindrücke aus unserer Imkerei.' })
const { data: images } = await useGallery()
const { data: s } = await useSettings()

const open = ref(false)
const index = ref(0)
const current = computed(() => images.value?.[index.value])

function show(i: number) {
  index.value = i
  open.value = true
}
function step(dir: number) {
  const len = images.value?.length ?? 0
  index.value = (index.value + dir + len) % len
}
</script>

<template>
  <div>
    <PageIntro eyebrow="Galerie" title="Einblicke in die Imkerei" description="Vom Bienenstand bis ins Glas.">
      <UButton
        v-if="s?.instagram_handle"
        :to="instagramUrl(s.instagram_handle)"
        target="_blank"
        icon="i-simple-icons-instagram"
        color="neutral"
        variant="outline"
        class="mt-5"
      >
        Mehr auf Instagram
      </UButton>
    </PageIntro>
    <UContainer class="py-8 sm:py-12">
      <div class="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
        <button
          v-for="(img, i) in images"
          :key="img.id"
          type="button"
          class="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl text-left sm:mb-4 focus-visible:outline-2 focus-visible:outline-primary"
          :aria-label="img.caption ?? 'Bild öffnen'"
          @click="show(i)"
        >
          <img v-if="img.image_url" :src="img.image_url" :alt="img.caption ?? ''" loading="lazy" class="w-full transition duration-300 group-hover:scale-105">
          <AiBadge v-if="img.image_url && img.image_ai" />
          <MediaImage v-else :class="i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'" />
        </button>
      </div>
      <UEmpty v-if="!images?.length" icon="i-lucide-images" title="Noch keine Bilder" class="py-16" />
    </UContainer>

    <UModal v-model:open="open" :title="current?.caption ?? 'Bild'" fullscreen :ui="{ body: 'flex items-center justify-center bg-black/95 p-2 sm:p-6', header: 'bg-black/95 text-white border-white/10', title: 'text-white' }">
      <template #body>
        <div class="relative flex size-full items-center justify-center">
          <div v-if="current?.image_url" class="relative flex max-h-full max-w-full">
            <img :src="current.image_url" :alt="current.caption ?? ''" class="max-h-full max-w-full object-contain rounded-lg">
            <AiBadge v-if="current.image_ai" />
          </div>
          <MediaImage v-else class="aspect-square w-full max-w-lg rounded-2xl" />
          <UButton icon="i-lucide-chevron-left" color="neutral" variant="soft" size="xl" class="absolute left-1 rounded-full" aria-label="Vorheriges Bild" @click="step(-1)" />
          <UButton icon="i-lucide-chevron-right" color="neutral" variant="soft" size="xl" class="absolute right-1 rounded-full" aria-label="Nächstes Bild" @click="step(1)" />
        </div>
      </template>
    </UModal>
  </div>
</template>
