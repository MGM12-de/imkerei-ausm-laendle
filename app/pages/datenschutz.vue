<script setup lang="ts">
useSeoMeta({ title: 'Datenschutz', robots: 'noindex' })
const { data: s } = await useSettings()
</script>

<template>
  <UContainer class="max-w-3xl py-10 sm:py-16">
    <h1 class="font-display text-4xl font-semibold text-highlighted">Datenschutzerklärung</h1>
    <UAlert class="mt-6" color="warning" variant="subtle" icon="i-lucide-triangle-alert" title="Platzhalter" description="Diese Vorlage ersetzt keine Rechtsberatung. Bitte mit einem Datenschutz-Generator vervollständigen." />
    <div class="rich-text mt-8 text-toned">
      <h2>1. Verantwortlicher</h2>
      <p>{{ s?.owner_name }}, {{ s?.street }}, {{ s?.zip }} {{ s?.city }}, E-Mail: {{ s?.email }}</p>
      <h2>2. Hosting</h2>
      <p>Diese Website wird bei Cloudflare, Inc. gehostet. Beim Aufruf werden technisch notwendige Daten (z. B. IP-Adresse, Zeitpunkt, Browser) verarbeitet (Art. 6 Abs. 1 lit. f DSGVO).</p>
      <h2>3. Datenbank</h2>
      <p>Inhalte und Kontaktanfragen werden bei Supabase (Serverstandort EU) gespeichert.</p>
      <h2>4. Kontaktformular</h2>
      <p>Wenn du uns über das Kontaktformular schreibst, speichern wir deine Angaben (Name, E-Mail, ggf. Telefon, Nachricht) ausschließlich zur Bearbeitung deiner Anfrage (Art. 6 Abs. 1 lit. a und b DSGVO). Die Daten werden gelöscht, sobald sie nicht mehr benötigt werden.</p>
      <h2>5. Cookies</h2>
      <p>Wir verwenden keine Tracking-Cookies. Lediglich für den Login-Bereich werden technisch notwendige Cookies gesetzt.</p>
      <h2>6. Instagram</h2>
      <p>Auf unserer Seite verlinken wir auf Instagram. Es werden erst Daten übertragen, wenn du den Link anklickst.</p>
      <h2>7. Deine Rechte</h2>
      <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie ein Beschwerderecht bei einer Aufsichtsbehörde.</p>
    </div>
  </UContainer>
</template>
