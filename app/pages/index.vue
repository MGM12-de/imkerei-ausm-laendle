<script setup lang="ts">
const { data: s } = await useSettings()
const [{ data: products }, { data: events }, { data: posts }, { data: gallery }] = await Promise.all([
  useProducts({ featured: true }),
  useUpcomingEvents(3),
  usePosts(3),
  useGallery(6)
])

const features = [
  { icon: 'i-lucide-map-pin', title: 'Aus der Region', description: 'Unsere Bienenstände liegen nur wenige Kilometer vom Hof entfernt.' },
  { icon: 'i-lucide-thermometer-snowflake', title: 'Schonend geschleudert', description: 'Kalt geschleudert und nie erhitzt – so bleiben alle wertvollen Inhaltsstoffe erhalten.' },
  { icon: 'i-lucide-hand-heart', title: 'Von Hand abgefüllt', description: 'Jedes Glas geht durch unsere Hände. Kleine Mengen, große Sorgfalt.' }
]

useSeoMeta({ title: () => s.value?.hero_title ?? undefined })
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-honeycomb opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <UContainer class="relative grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <UBadge v-if="s?.tagline" color="primary" variant="subtle" size="lg" class="mb-5 rounded-full" icon="i-lucide-sparkles">
            {{ s.tagline }}
          </UBadge>
          <h1 class="font-display text-4xl font-semibold leading-[1.08] text-highlighted sm:text-5xl lg:text-6xl text-balance">
            {{ s?.hero_title }}
          </h1>
          <p class="mt-5 text-lg text-muted sm:text-xl text-pretty max-w-xl">
            {{ s?.hero_text }}
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <UButton to="/honig" size="xl" trailing-icon="i-lucide-arrow-right" class="justify-center">
              Unsere Honige
            </UButton>
            <UButton to="/kontakt" size="xl" color="neutral" variant="outline" icon="i-lucide-message-circle" class="justify-center">
              Honig anfragen
            </UButton>
          </div>
        </div>

        <div class="relative mx-auto w-full max-w-md lg:max-w-none">
          <MediaImage :src="s?.hero_image_url" :ai="s?.hero_image_ai" :alt="s?.site_name" eager icon="i-lucide-flower-2" class="aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/5] rounded-[2rem] shadow-2xl shadow-honey-900/20" />
          <div class="absolute -bottom-4 -left-2 sm:-left-6 rounded-2xl bg-default/95 backdrop-blur ring ring-default px-4 py-3 shadow-lg flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <UIcon name="i-lucide-leaf" class="size-5" />
            </span>
            <span class="text-sm leading-tight">
              <span class="block font-semibold text-highlighted">Direkt vom Imker</span>
              <span class="text-muted">ohne Zwischenhandel</span>
            </span>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- FEATURES -->
    <section class="py-12 sm:py-16">
      <UContainer>
        <div class="grid gap-4 sm:grid-cols-3 sm:gap-6">
          <div v-for="f in features" :key="f.title" class="rounded-2xl bg-honey-50 ring ring-honey-200/70 p-6 dark:bg-honey-950/30 dark:ring-honey-900/60">
            <UIcon :name="f.icon" class="size-7 text-primary" />
            <h3 class="mt-3 font-semibold text-highlighted text-lg">{{ f.title }}</h3>
            <p class="mt-1 text-sm text-muted">{{ f.description }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- PRODUKTE -->
    <section class="py-12 sm:py-16">
      <UContainer>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader eyebrow="Unser Honig" title="Jede Tracht schmeckt anders" description="Je nach Jahreszeit und Standort entstehen bei uns ganz unterschiedliche Sorten." />
          <UButton to="/honig" variant="link" trailing-icon="i-lucide-arrow-right" class="self-start sm:self-auto px-0">
            Alle Produkte
          </UButton>
        </div>
        <div class="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          <ProductCard v-for="p in products" :key="p.id" :product="p" class="w-[80%] shrink-0 snap-start sm:w-auto" />
        </div>
      </UContainer>
    </section>

    <!-- ÜBER UNS TEASER -->
    <section class="py-12 sm:py-20 bg-muted/60">
      <UContainer class="grid items-center gap-10 lg:grid-cols-2">
        <MediaImage :src="s?.about_image_url" :ai="s?.about_image_ai" alt="Unsere Imkerei" icon="i-lucide-heart" class="aspect-[4/3] rounded-3xl order-last lg:order-first" />
        <div>
          <SectionHeader eyebrow="Über uns" :title="s?.about_title ?? 'Über uns'" :description="s?.about_intro" />
          <UButton to="/ueber-uns" size="lg" color="neutral" variant="outline" trailing-icon="i-lucide-arrow-right" class="mt-6">
            Unsere Geschichte
          </UButton>
        </div>
      </UContainer>
    </section>

    <!-- TERMINE + AKTUELLES -->
    <section class="py-12 sm:py-20">
      <UContainer class="grid gap-12 lg:grid-cols-[2fr_3fr]">
        <div>
          <SectionHeader eyebrow="Termine" title="Hier findet ihr uns" />
          <div class="mt-6 space-y-3">
            <EventCard v-for="e in events" :key="e.id" :event="e" />
            <p v-if="!events?.length" class="text-muted">Aktuell keine Termine – schaut bald wieder vorbei.</p>
          </div>
          <UButton to="/termine" variant="link" trailing-icon="i-lucide-arrow-right" class="mt-3 px-0">
            Alle Termine
          </UButton>
        </div>
        <div>
          <SectionHeader eyebrow="Aktuelles" title="Neues aus dem Bienenjahr" />
          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <PostCard v-for="(p, i) in posts?.slice(0, 2)" :key="p.id" :post="p" :class="i === 1 && 'hidden sm:flex'" />
          </div>
          <UButton to="/aktuelles" variant="link" trailing-icon="i-lucide-arrow-right" class="mt-3 px-0">
            Alle Beiträge
          </UButton>
        </div>
      </UContainer>
    </section>

    <!-- GALERIE -->
    <section v-if="gallery?.length" class="py-12 sm:py-16">
      <UContainer>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader eyebrow="Einblicke" title="Ein Blick in die Imkerei" />
          <UButton to="/galerie" variant="link" trailing-icon="i-lucide-arrow-right" class="self-start px-0">
            Zur Galerie
          </UButton>
        </div>
        <div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <MediaImage
            v-for="(g, i) in gallery"
            :key="g.id"
            :src="g.image_url"
            :ai="g.image_ai"
            :alt="g.caption ?? ''"
            :class="['aspect-square rounded-2xl', i === 0 && 'sm:row-span-2 sm:aspect-auto']"
          />
        </div>
      </UContainer>
    </section>

    <!-- CTA -->
    <section class="py-12 sm:py-16">
      <UContainer>
        <div class="relative overflow-hidden rounded-3xl bg-honey-400 px-6 py-12 sm:px-12 sm:py-16 text-center dark:bg-honey-600">
          <div class="absolute inset-0 bg-honeycomb opacity-60" />
          <div class="relative">
            <h2 class="font-display text-3xl font-semibold text-honey-950 sm:text-4xl text-balance">
              Lust auf Honig?
            </h2>
            <p class="mx-auto mt-3 max-w-xl text-lg text-honey-900">
              Schreibt uns, was ihr gern hättet – wir legen euch die Gläser zurück oder bringen sie zum nächsten Markt mit.
            </p>
            <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <UButton to="/kontakt" size="xl" color="neutral" class="justify-center bg-honey-950 text-honey-50 hover:bg-honey-900">
                Jetzt anfragen
              </UButton>
              <UButton
                v-if="s?.instagram_handle"
                :to="instagramUrl(s.instagram_handle)"
                target="_blank"
                size="xl"
                color="neutral"
                variant="ghost"
                icon="i-simple-icons-instagram"
                class="justify-center text-honey-950 hover:bg-honey-300"
              >
                Auf Instagram folgen
              </UButton>
            </div>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>
