<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
</script>

<template>
  <WelcomeItem>
    <template #heading>FCManager</template>

    <div class="auth-buttons">
      <a href="/register" class="btn">注册</a>
      <a href="/login" class="btn">登录</a>
    </div>
  </WelcomeItem>
</template>

<style scoped>
.auth-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 2rem;
  width: 100%;
}

.btn {
  padding: 0.6rem 2.5rem;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 1rem;
  border: 2px solid #4CAF50;
  min-width: 120px;
  text-align: center;
}

.btn:last-child {
  background-color: #4CAF50;
  color: white;
}

.btn:last-child:hover {
  background-color: #45a049;
  border-color: #45a049;
}

.btn:first-child {
  background-color: transparent;
  color: #4CAF50;
}

.btn:first-child:hover {
  background-color: rgba(76, 175, 80, 0.1);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
