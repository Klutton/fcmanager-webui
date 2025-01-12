<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
  <main class="home-container">
    <div class="content-wrapper">
      <TheWelcome />
    </div>
  </main>
</template>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: #121212;
}

.content-wrapper {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
}
</style>
