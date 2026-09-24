<script setup lang="ts">
const model = defineModel<string | null | undefined>()
const ai = defineModel<boolean | undefined>('ai')
const props = withDefaults(defineProps<{ folder?: string, aspect?: string, label?: string }>(), { folder: 'uploads', aspect: 'aspect-[4/3]', label: 'Bild auswählen' })

const { upload } = useImageUpload()
const toast = useToast()
const loading = ref(false)
const input = useTemplateRef<HTMLInputElement>('input')

async function onChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  loading.value = true
  try {
    model.value = await upload(file, props.folder)
  } catch (err) {
    toast.add({ title: 'Upload fehlgeschlagen', description: (err as Error).message, color: 'error' })
  } finally {
    loading.value = false
    if (input.value) input.value.value = ''
  }
}
</script>

<template>
  <div class="space-y-2">
    <button
      type="button"
      :class="['relative block w-full overflow-hidden rounded-xl ring ring-default border-2 border-dashed border-transparent hover:border-primary/50 transition', aspect]"
      @click="input?.click()"
    >
      <MediaImage :src="model" :ai="ai" class="size-full" icon="i-lucide-image-plus" />
      <span v-if="loading" class="absolute inset-0 flex items-center justify-center bg-default/70">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
      </span>
    </button>
    <div class="flex gap-2">
      <UButton icon="i-lucide-upload" color="neutral" variant="outline" size="sm" :loading="loading" @click="input?.click()">
        {{ model ? 'Bild ersetzen' : label }}
      </UButton>
      <UButton v-if="model" icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" @click="model = null; ai = false">
        Entfernen
      </UButton>
    </div>
    <UCheckbox v-if="model" v-model="ai" label="KI-generiert" description="Blendet auf der Webseite den Hinweis „KI-generiert“ ein" />
    <input ref="input" type="file" accept="image/*" class="hidden" @change="onChange">
  </div>
</template>
