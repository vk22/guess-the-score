<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <p
    role="alert"
    class="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200"
  >
    {{ message }}
  </p>
</template>
