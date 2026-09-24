<script setup lang="ts">
useSeoMeta({ title: 'Impressum', robots: 'noindex' })
const { data: s } = await useSettings()
</script>

<template>
  <UContainer class="max-w-3xl py-10 sm:py-16">
    <h1 class="font-display text-4xl font-semibold text-highlighted">Impressum</h1>
    <UAlert class="mt-6" color="warning" variant="subtle" icon="i-lucide-triangle-alert" title="Platzhalter" description="Bitte vor Veröffentlichung rechtlich prüfen und vervollständigen (z. B. mit einem Impressum-Generator)." />
    <div class="rich-text mt-8 text-toned">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>{{ s?.site_name }}<br>{{ s?.owner_name }}<br>{{ s?.street }}<br>{{ s?.zip }} {{ s?.city }}</p>
      <h2>Kontakt</h2>
      <p>Telefon: {{ s?.phone }}<br>E-Mail: {{ s?.email }}</p>
      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>{{ s?.owner_name }}, Anschrift wie oben</p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
    </div>
  </UContainer>
</template>
