<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>

<template>
  <button class="cancel-btn">
    {{ text || '取消' }}
  </button>
</template>

<style scoped>
.cancel-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  background: #666;
  color: white;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background: #555;
}
</style>