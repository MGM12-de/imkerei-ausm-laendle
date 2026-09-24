<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
defineProps<{ title: string, description?: string, confirmLabel?: string }>()
const emit = defineEmits<{ confirm: [] }>()
</script>

<template>
  <UModal v-model:open="open" :title="title" :description="description">
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="open = false">Abbrechen</UButton>
        <UButton color="error" icon="i-lucide-trash-2" @click="open = false; emit('confirm')">{{ confirmLabel ?? 'Löschen' }}</UButton>
      </div>
    </template>
  </UModal>
</template>
