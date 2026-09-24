<script setup lang="ts">
const { data: s } = await useSettings()
useSeoMeta({ title: 'Über uns', description: () => s.value?.about_intro })

const facts = [
  { value: '100 %', label: 'regional' },
  { value: '0 km', label: 'Zwischenhandel' },
  { value: '♥', label: 'für die Biene' }
]
</script>

<template>
  <div>
    <PageIntro eyebrow="Über uns" :title="s?.about_title ?? 'Über uns'" :description="s?.about_intro" />
    <UContainer class="py-10 sm:py-16 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
      <div class="space-y-4 lg:sticky lg:top-[calc(var(--ui-header-height)+2rem)] lg:self-start">
        <MediaImage :src="s?.about_image_url" alt="Der Imker bei der Arbeit" icon="i-lucide-heart" eager class="aspect-[4/5] rounded-3xl" />
        <div class="grid grid-cols-3 gap-3">
          <div v-for="f in facts" :key="f.label" class="rounded-xl bg-elevated/70 p-3 text-center">
            <p class="font-display text-2xl font-semibold text-primary">{{ f.value }}</p>
            <p class="text-xs text-muted">{{ f.label }}</p>
          </div>
        </div>
      </div>
      <div>
        <RichText :html="s?.about_text" />
        <div class="mt-10 rounded-2xl bg-elevated/70 p-6">
          <p class="font-semibold text-highlighted">Neugierig geworden?</p>
          <p class="mt-1 text-muted">Besucht uns am Markt oder meldet euch für einen Blick in die Imkerei.</p>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row">
            <UButton to="/termine" icon="i-lucide-calendar-days">Termine ansehen</UButton>
            <UButton to="/kontakt" color="neutral" variant="outline" icon="i-lucide-mail">Kontakt</UButton>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>
