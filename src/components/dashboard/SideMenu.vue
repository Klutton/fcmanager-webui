<script setup lang="ts">
import { ref } from 'vue'

const activeMenu = ref('profile')

const props = defineProps<{
  username: string
  isAdmin?: boolean
}>()

const emit = defineEmits<{
  (e: 'change', key: string): void
}>()

interface MenuItem {
  key: string
  label: string
}

const menuItems: MenuItem[] = [
  { key: 'profile', label: '个人档案' },
  { key: 'tasks', label: '任务列表' }
]

const handleMenuClick = (key: string) => {
  activeMenu.value = key
  emit('change', key)
}
</script>

<template>
  <div class="side-menu">
    <div 
      class="main-title"
      @click="$router.push('/')"
    >
      FCM
    </div>
    
    <div 
      v-for="item in menuItems" 
      :key="item.key"
      :class="['menu-item', { active: activeMenu === item.key }]"
      @click="handleMenuClick(item.key)"
    >
      {{ item.label }}
    </div>

    <div :class="['user-info', { 'admin-rainbow': isAdmin }]">
      {{ username }}
    </div>
  </div>
</template>

<style scoped>
.side-menu {
  width: 130px;
  background: rgba(26, 26, 26, 0.8);
  height: 100vh;
  padding: 15px 0;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
}

.main-title {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  padding: 0 0 13px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;
  margin-right: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transform-origin: center;
}

.user-info {
  padding: 10px 5px 0 10px;
  color: #ffffff;
  font-size: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
  margin-bottom: 0;
  word-break: break-all;
}

.menu-item {
  padding: 15px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #a0a0a0;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: #2a2a2a;
  color: #ffffff;
}

.menu-item.active {
  background: #2f2f2f;
  color: #ffffff;
  border-left: 4px solid #4CAF50;
}

.admin-rainbow {
  background: linear-gradient(
    90deg,
    #ff0000,
    #ff4500,
    #ffa500,
    #ffff00,
    #00ff00,
    #00ffff,
    #0000ff,
    #8a2be2,
    #ff00ff
  );
  background-size: 300% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: rainbow 4s linear infinite;
  font-weight: 800;
  text-shadow: 
    0 0 10px currentColor,
    0 0 20px currentColor,
    0 0 30px currentColor;
  position: relative;
}

.admin-rainbow::after {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  width: calc(100% + 10px);
  height: calc(100% + 10px);
  background: inherit;
  filter: blur(12px);
  opacity: 0.6;
  z-index: -1;
}

@keyframes rainbow {
  0% { background-position: 0% 50%; }
  50% { background-position: 150% 50%; }
  100% { background-position: 300% 50%; }
}

.main-title:hover {
  color: #4CAF50;
}
</style>