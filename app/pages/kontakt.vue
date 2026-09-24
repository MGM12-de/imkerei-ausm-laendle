<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { contactSchema, type ContactInput } from '#shared/contact'

usePageSeo({ title: 'Kontakt', description: 'Honig bestellen oder zurücklegen lassen, Hofverkauf vereinbaren oder Fragen zu unseren Bienen stellen – wir freuen uns auf eure Nachricht.' })

const { data: s } = await useSettings()
const route = useRoute()
const toast = useToast()

const state = reactive<Partial<ContactInput>>({
  name: '',
  email: '',
  phone: '',
  subject: typeof route.query.betreff === 'string' ? route.query.betreff : '',
  message: '',
  privacy: undefined,
  website: ''
})
const loading = ref(false)
const sent = ref(false)

async function onSubmit(event: FormSubmitEvent<ContactInput>) {
  loading.value = true
  try {
    await $fetch('/api/contact', { method: 'POST', body: event.data })
    sent.value = true
    toast.add({ title: 'Danke für deine Nachricht!', description: 'Wir melden uns so schnell wie möglich.', color: 'success', icon: 'i-lucide-check' })
  } catch {
    toast.add({ title: 'Das hat leider nicht geklappt', description: 'Bitte versuche es später erneut oder ruf uns an.', color: 'error' })
  } finally {
    loading.value = false
  }
}

const channels = computed(() => [
  s.value?.phone && { icon: 'i-lucide-phone', label: 'Telefon', value: s.value.phone, to: `tel:${s.value.phone.replace(/\s/g, '')}` },
  s.value?.email && { icon: 'i-lucide-mail', label: 'E-Mail', value: s.value.email, to: `mailto:${s.value.email}` },
  s.value?.instagram_handle && { icon: 'i-simple-icons-instagram', label: 'Instagram', value: `@${s.value.instagram_handle}`, to: instagramUrl(s.value.instagram_handle) }
].filter(Boolean) as { icon: string, label: string, value: string, to: string }[])

const mapsUrl = computed(() => s.value?.street
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.value.street}, ${s.value.zip} ${s.value.city}`)}`
  : null)
</script>

<template>
  <div>
    <PageIntro eyebrow="Kontakt" title="Schreibt uns!" description="Ihr möchtet Honig reservieren, habt eine Frage zu unseren Bienen oder wollt uns besuchen? Wir freuen uns auf eure Nachricht." />
    <UContainer class="py-8 sm:py-12 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
      <div>
        <div v-if="sent" class="rounded-2xl bg-success/10 p-8 text-center">
          <UIcon name="i-lucide-circle-check" class="size-12 text-success" />
          <h2 class="mt-3 font-display text-2xl font-semibold text-highlighted">Nachricht ist angekommen!</h2>
          <p class="mt-2 text-muted">Vielen Dank – wir melden uns in der Regel innerhalb von 1–2 Tagen.</p>
          <UButton class="mt-6" color="neutral" variant="outline" @click="sent = false; state.message = ''">Weitere Nachricht</UButton>
        </div>

        <UForm v-else :schema="contactSchema" :state="state" class="space-y-5" @submit="onSubmit">
          <div class="grid gap-5 sm:grid-cols-2">
            <UFormField label="Name" name="name" required>
              <UInput v-model="state.name" autocomplete="name" size="xl" class="w-full" />
            </UFormField>
            <UFormField label="E-Mail" name="email" required>
              <UInput v-model="state.email" type="email" autocomplete="email" inputmode="email" size="xl" class="w-full" />
            </UFormField>
            <UFormField label="Telefon" name="phone" hint="optional">
              <UInput v-model="state.phone" type="tel" autocomplete="tel" inputmode="tel" size="xl" class="w-full" />
            </UFormField>
            <UFormField label="Betreff" name="subject" hint="optional">
              <UInput v-model="state.subject" size="xl" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Nachricht" name="message" required>
            <UTextarea v-model="state.message" :rows="6" autoresize size="xl" class="w-full" placeholder="z. B. Ich hätte gern 2 Gläser Sommertracht …" />
          </UFormField>

          <!-- Honeypot -->
          <div class="absolute -left-[9999px]" aria-hidden="true">
            <label>Website <input v-model="state.website" tabindex="-1" autocomplete="off"></label>
          </div>

          <UFormField name="privacy">
            <UCheckbox v-model="state.privacy">
              <template #label>
                Ich bin einverstanden, dass meine Angaben zur Beantwortung meiner Anfrage gespeichert werden. Mehr in der
                <ULink to="/datenschutz" class="text-primary underline">Datenschutzerklärung</ULink>.
              </template>
            </UCheckbox>
          </UFormField>

          <UButton type="submit" size="xl" :loading="loading" icon="i-lucide-send" class="w-full justify-center sm:w-auto">
            Nachricht senden
          </UButton>
        </UForm>
      </div>

      <aside class="space-y-4">
        <ULink v-for="c in channels" :key="c.label" :to="c.to" :target="c.to.startsWith('http') ? '_blank' : undefined" class="flex items-center gap-4 rounded-2xl bg-elevated/70 p-4 transition hover:bg-muted">
          <span class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <UIcon :name="c.icon" class="size-5" />
          </span>
          <span class="min-w-0">
            <span class="block text-sm text-muted">{{ c.label }}</span>
            <span class="block font-semibold text-highlighted truncate">{{ c.value }}</span>
          </span>
        </ULink>

        <div v-if="s?.street" class="rounded-2xl bg-elevated/70 p-5">
          <p class="flex items-center gap-2 font-semibold text-highlighted"><UIcon name="i-lucide-map-pin" class="text-primary" />Adresse</p>
          <address class="mt-2 not-italic text-muted">
            {{ s.owner_name }}<br>{{ s.street }}<br>{{ s.zip }} {{ s.city }}
          </address>
          <UButton v-if="mapsUrl" :to="mapsUrl" target="_blank" variant="link" trailing-icon="i-lucide-external-link" class="mt-2 px-0">
            Route planen
          </UButton>
        </div>

        <div v-if="s?.sales_info" class="rounded-2xl bg-elevated/70 p-5">
          <p class="flex items-center gap-2 font-semibold text-highlighted"><UIcon name="i-lucide-store" class="text-primary" />Verkauf</p>
          <p class="mt-2 text-muted whitespace-pre-line">{{ s.sales_info }}</p>
        </div>
      </aside>
    </UContainer>
  </div>
</template>
