<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/services/api'

const router = useRouter()
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const validatePassword = (pwd: string) => {
  if (pwd.length < 8) {
    return '密码长度必须大于8位'
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pwd)) {
    return '密码必须包含数字和字母'
  }
  return ''
}

const handlePasswordInput = () => {
  passwordError.value = validatePassword(password.value)
}

const handleSubmit = async () => {
  try {
    // 验证密码
    const error = validatePassword(password.value)
    if (error) {
      passwordError.value = error
      return
    }
    
    if (password.value !== confirmPassword.value) {
      passwordError.value = '两次输入的密码不一致'
      return
    }

    isLoading.value = true
    errorMessage.value = ''
    
    const response = await userApi.register(username.value, password.value)
    
    // 注册成功后跳转到登录页
    router.push('/login')
  } catch (error: any) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <h2>注册</h2>
    <form @submit.prevent="handleSubmit" class="register-form">
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
          @input="handlePasswordInput"
          :disabled="isLoading"
        >
        <span class="password-error" v-if="passwordError">{{ passwordError }}</span>
      </div>
      <div class="form-group">
        <input 
          type="password" 
          v-model="confirmPassword" 
          placeholder="确认密码"
          required
          :disabled="isLoading"
        >
      </div>
      <div class="form-group">
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
      </div>
      <div class="form-footer">
        <span>已有账号？</span>
        <a @click="router.push('/login')">立即登录</a>
      </div>
    </form>
  </div>
</template>

<style scoped>
.register-container {
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

.register-form {
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

.register-form button {
  background-color: transparent;
  color: #4CAF50;
}

.register-form button:hover {
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

.password-error {
  color: #ff4444;
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
