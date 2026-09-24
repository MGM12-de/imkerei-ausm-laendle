<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'

const model = defineModel<string | null | undefined>()
defineProps<{ placeholder?: string }>()

const value = computed({
  get: () => model.value ?? '',
  set: (v: string) => { model.value = v }
})

const items: EditorToolbarItem[][] = [
  [
    { kind: 'heading', level: 2, icon: 'i-lucide-heading-2', tooltip: { text: 'Überschrift' } },
    { kind: 'heading', level: 3, icon: 'i-lucide-heading-3', tooltip: { text: 'Zwischenüberschrift' } }
  ],
  [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: 'Fett' } },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: 'Kursiv' } }
  ],
  [
    { kind: 'bulletList', icon: 'i-lucide-list', tooltip: { text: 'Aufzählung' } },
    { kind: 'orderedList', icon: 'i-lucide-list-ordered', tooltip: { text: 'Nummerierung' } },
    { kind: 'blockquote', icon: 'i-lucide-text-quote', tooltip: { text: 'Zitat' } },
    { kind: 'link', icon: 'i-lucide-link', tooltip: { text: 'Link' } }
  ],
  [
    { kind: 'undo', icon: 'i-lucide-undo', tooltip: { text: 'Rückgängig' } },
    { kind: 'redo', icon: 'i-lucide-redo', tooltip: { text: 'Wiederholen' } }
  ]
]
</script>

<template>
  <div class="rounded-lg ring ring-accented bg-default overflow-hidden focus-within:ring-2 focus-within:ring-primary">
    <UEditor
      v-slot="{ editor }"
      v-model="value"
      content-type="html"
      :placeholder="placeholder ?? 'Text schreiben …'"
      :starter-kit="{ heading: { levels: [2, 3] }, codeBlock: false, code: false, link: { openOnClick: false } }"
      class="w-full"
      :ui="{ base: 'rich-text min-h-48 px-4 py-3 sm:px-5' }"
    >
      <UEditorToolbar :editor="editor" :items="items" class="sticky top-0 z-10 overflow-x-auto border-b border-default bg-elevated/60 px-2 py-1.5" />
    </UEditor>
  </div>
</template>
