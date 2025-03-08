<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>

<template>
  <button class="confirm-btn">
    {{ text || '确定' }}
  </button>
</template>

<style scoped>
.confirm-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  background: #4CAF50;
  color: white;
  transition: background-color 0.3s ease;
}

.confirm-btn:hover {
  background: #45a049;
}
</style>