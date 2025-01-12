<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/services/api'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const response = await userApi.login(username.value, password.value)
    
    // 保存 token
    localStorage.setItem('token', response.access_token)
    
    // 登录成功后跳转
    router.push('/dashboard')
  } catch (error: any) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <h2>登录</h2>
    <form @submit.prevent="handleSubmit" class="login-form">
      <!-- 显示错误信息 -->
      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      
      <div class="form-group">
        <input 
          type="text" 
          v-model="username" 
          placeholder="用户名"
          required
          :disabled="isLoading"
        >
      </div>
      <div class="form-group">
        <input 
          type="password" 
          v-model="password" 
          placeholder="密码"
          required
          :disabled="isLoading"
        >
      </div>
      <div class="form-group">
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </div>
      <div class="form-footer">
        <span>还没有账号？</span>
        <a @click="router.push('/register')">立即注册</a>
      </div>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
}

h2 {
  text-align: center;
  color: var(--color-heading);
  margin-bottom: 30px;
  font-size: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

button {
  padding: 0.6rem 2.5rem;
  background-color: #4CAF50;
  color: white;
  border: 2px solid #4CAF50;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  width: 100%;
}

button:hover {
  background-color: rgba(76, 175, 80, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-footer {
  text-align: center;
  font-size: 14px;
}

.form-footer a {
  color: #4CAF50;
  cursor: pointer;
  margin-left: 5px;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}

.error-message {
  color: #ff4444;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
