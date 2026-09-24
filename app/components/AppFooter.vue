<script setup lang="ts">
const { data: s } = await useSettings()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-20 border-t border-default bg-muted/60">
    <UContainer class="py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      <div class="space-y-3 sm:col-span-2 lg:col-span-1">
        <AppLogo :name="s?.site_name" />
        <p class="text-sm text-muted max-w-xs">
          {{ s?.tagline }}
        </p>
      </div>

      <div>
        <h3 class="font-semibold text-highlighted mb-3">Kontakt</h3>
        <address class="not-italic text-sm text-muted space-y-1">
          <p v-if="s?.owner_name">{{ s.owner_name }}</p>
          <p v-if="s?.street">{{ s.street }}</p>
          <p v-if="s?.city">{{ s.zip }} {{ s.city }}</p>
          <p v-if="s?.phone" class="pt-2"><ULink :to="`tel:${s.phone.replace(/\s/g, '')}`" class="hover:text-primary">{{ s.phone }}</ULink></p>
          <p v-if="s?.email"><ULink :to="`mailto:${s.email}`" class="hover:text-primary break-all">{{ s.email }}</ULink></p>
        </address>
      </div>

      <div>
        <h3 class="font-semibold text-highlighted mb-3">Verkauf</h3>
        <p class="text-sm text-muted whitespace-pre-line">{{ s?.sales_info }}</p>
      </div>

      <div>
        <h3 class="font-semibold text-highlighted mb-3">Folgt uns</h3>
        <UButton
          v-if="s?.instagram_handle"
          :to="instagramUrl(s.instagram_handle)"
          target="_blank"
          icon="i-simple-icons-instagram"
          color="neutral"
          variant="outline"
        >
          Instagram
        </UButton>
      </div>
    </UContainer>

    <div class="border-t border-default">
      <UContainer class="py-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted">
        <p>© {{ year }} {{ s?.site_name }}</p>
        <nav class="flex gap-5">
          <ULink to="/impressum" class="hover:text-primary">Impressum</ULink>
          <ULink to="/datenschutz" class="hover:text-primary">Datenschutz</ULink>
          <ULink to="/admin" class="hover:text-primary">Login</ULink>
        </nav>
      </UContainer>
    </div>
  </footer>
</template>
