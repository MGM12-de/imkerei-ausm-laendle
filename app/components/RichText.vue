<script setup lang="ts">
// Gibt HTML aus dem Admin-Editor aus. Inhalte stammen ausschließlich von Admins (RLS).
defineProps<{ html?: string | null }>()
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-if="html" class="rich-text text-toned text-[17px]" v-html="html" />
</template>
