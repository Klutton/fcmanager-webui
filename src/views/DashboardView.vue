<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userApi } from '@/services/api'
import SideMenu from '@/components/dashboard/SideMenu.vue'
import ProfileSection from '@/components/dashboard/ProfileSection.vue'
import TasksSection from '@/components/dashboard/TasksSection.vue'
import ErrorNotification from '@/components/common/ErrorNotification.vue'

const activeView = ref('profile')
const errorQueue = ref<string[]>([])
const currentError = ref('')
const showError = ref(false)

interface Profile {
  nickname: string
  name: string
  department: string
  role: string
}

const profile = ref<Profile>({
  nickname: '',
  name: '',
  department: '',
  role: ''
})

// 加载用户资料
const loadProfile = async () => {
  try {
    const response = await userApi.getProfile()
    if (response.success) {
      profile.value = response.data
    }
  } catch (err: any) {
    errorQueue.value.push(err.message)
    if (!showError.value) {
      showNextError()
    }
  }
}

// 组件挂载时加载资料
onMounted(() => {
  loadProfile()
})

// 处理资料更新
const handleProfileUpdate = (newProfile: Profile) => {
  profile.value = newProfile
}

const handleMenuChange = (menu: string) => {
  activeView.value = menu
}

const handleError = (message: string) => {
  errorQueue.value.push(message)
  if (!showError.value) {
    showNextError()
  }
}

const showNextError = () => {
  if (errorQueue.value.length > 0) {
    currentError.value = errorQueue.value.shift() || ''
    showError.value = true
  }
}

const closeError = () => {
  showError.value = false
  setTimeout(() => {
    showNextError()
  }, 300)
}
</script>

<template>
  <div class="dashboard-container">
    <SideMenu 
      @change="handleMenuChange" 
      :username="profile.nickname || '用户'"
      :isAdmin="profile.role === 'admin'"
    />
    
    <div class="content">
      <ErrorNotification
        :message="currentError"
        :show="showError"
        @close="closeError"
      />
      
      <ProfileSection
        v-if="activeView === 'profile'"
        v-model:profile="profile"
        @error="handleError"
      />

      <TasksSection
        v-else-if="activeView === 'tasks'"
        @error="handleError"
      />
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  background: #121212;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  height: 100vh;
  position: relative;
  margin-left: 130px;
}
</style>