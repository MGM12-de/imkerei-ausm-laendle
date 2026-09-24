<script setup lang="ts">
import type { GalleryImage } from '~/types/models'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Galerie', robots: 'noindex' })

const table = useAdminTable('gallery_images')
const { upload, removeByUrl } = useImageUpload()
const toast = useToast()
const items = ref<GalleryImage[]>([])
const loading = ref(true)
const uploading = ref(0)
const input = useTemplateRef<HTMLInputElement>('input')

async function load() {
  items.value = await table.list()
  loading.value = false
}
onMounted(load)

async function onFiles(e: Event) {
  const files = [...((e.target as HTMLInputElement).files ?? [])]
  uploading.value = files.length
  const minSort = Math.min(0, ...items.value.map(i => i.sort)) - files.length
  for (const [i, file] of files.entries()) {
    try {
      const url = await upload(file, 'gallery')
      await table.save({ image_url: url, caption: '', sort: minSort + i, published: true })
    } catch (err) {
      toast.add({ title: `Upload fehlgeschlagen: ${file.name}`, description: (err as Error).message, color: 'error' })
    }
    uploading.value--
  }
  if (input.value) input.value.value = ''
  await load()
  toast.add({ title: 'Fotos hochgeladen', color: 'success', icon: 'i-lucide-check' })
}

async function update(img: GalleryImage, patch: Partial<GalleryImage>) {
  Object.assign(img, patch)
  await table.save({ id: img.id, ...patch })
}

async function move(index: number, dir: -1 | 1) {
  const j = index + dir
  if (j < 0 || j >= items.value.length) return
  const list = [...items.value]
  ;[list[index], list[j]] = [list[j]!, list[index]!]
  items.value = list
  await Promise.all(list.map((img, i) => img.sort !== i ? update(img, { sort: i }) : null))
}

const toDelete = ref<GalleryImage | null>(null)
async function remove() {
  const img = toDelete.value
  if (!img) return
  await table.remove(img.id)
  await removeByUrl(img.image_url)
  toDelete.value = null
  await load()
}
</script>

<template>
  <AdminPage title="Galerie">
    <template #actions>
      <UButton icon="i-lucide-image-plus" :loading="uploading > 0" @click="input?.click()">
        <span class="hidden sm:inline">Fotos hochladen</span>
      </UButton>
    </template>
    <input ref="input" type="file" accept="image/*" multiple class="hidden" @change="onFiles">

    <button type="button" class="mb-6 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-accented p-6 text-muted hover:border-primary hover:text-primary transition" @click="input?.click()">
      <UIcon :name="uploading ? 'i-lucide-loader-circle' : 'i-lucide-upload-cloud'" :class="['size-8', uploading && 'animate-spin']" />
      <span v-if="uploading">Lade hoch … noch {{ uploading }}</span>
      <span v-else>Fotos auswählen (mehrere möglich) – werden automatisch verkleinert</span>
    </button>

    <div v-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <USkeleton v-for="i in 8" :key="i" class="aspect-square" />
    </div>

    <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <div v-for="(img, i) in items" :key="img.id" class="overflow-hidden rounded-xl ring ring-default">
        <MediaImage :src="img.image_url" :ai="img.image_ai" :class="['aspect-square', !img.published && 'opacity-40']">
          <div class="absolute right-1.5 top-1.5 flex gap-1">
            <UButton size="xs" color="neutral" variant="solid" icon="i-lucide-arrow-left" aria-label="Nach vorne" :disabled="i === 0" @click="move(i, -1)" />
            <UButton size="xs" color="neutral" variant="solid" icon="i-lucide-arrow-right" aria-label="Nach hinten" :disabled="i === items.length - 1" @click="move(i, 1)" />
          </div>
        </MediaImage>
        <div class="space-y-2 p-2">
          <UInput :model-value="img.caption ?? ''" placeholder="Bildunterschrift" size="sm" class="w-full" @change="(e: Event) => update(img, { caption: (e.target as HTMLInputElement).value })" />
          <div class="flex items-center justify-between gap-2">
            <div class="flex flex-wrap gap-x-3 gap-y-1">
              <USwitch :model-value="img.published" size="sm" label="Sichtbar" @update:model-value="(v: boolean) => update(img, { published: v })" />
              <USwitch :model-value="!!img.image_ai" size="sm" label="KI" @update:model-value="(v: boolean) => update(img, { image_ai: v })" />
            </div>
            <UButton icon="i-lucide-trash-2" size="xs" color="error" variant="ghost" aria-label="Löschen" @click="toDelete = img" />
          </div>
        </div>
      </div>
    </div>
    <UEmpty v-if="!loading && !items.length" icon="i-lucide-images" title="Noch keine Fotos" />

    <AdminConfirm :open="!!toDelete" title="Foto löschen?" description="Das Foto wird endgültig entfernt." @update:open="v => { if (!v) toDelete = null }" @confirm="remove" />
  </AdminPage>
</template>
