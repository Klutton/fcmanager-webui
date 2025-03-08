<script setup lang="ts">
import { ref } from 'vue'
import { userApi } from '@/services/api'
import CancelButton from '@/components/common/CancelButton.vue'
import ConfirmButton from '@/components/common/ConfirmButton.vue'

interface Profile {
  nickname: string
  name: string
  department: string
  role: string
}

const props = defineProps<{
  profile: Profile
}>()

const emit = defineEmits<{
  'update:profile': [profile: Profile]
  'error': [message: string]
}>()

const isEditing = ref(false)
const editingProfile = ref<Profile>({
  nickname: '',
  name: '',
  department: '',
  role: 'user'
})

const handleEditProfile = () => {
  isEditing.value = true
  editingProfile.value = { ...props.profile }
}

const handleSaveProfile = async () => {
  try {
    await userApi.updateProfile(editingProfile.value)
    emit('update:profile', { ...editingProfile.value })
    isEditing.value = false
  } catch (err: any) {
    emit('error', err.message)
  }
}
</script>

<template>
  <div class="profile-section">
    <div class="section-header">
      <h2>个人档案</h2>
      <div class="divider"></div>
    </div>
    
    <div class="profile-content">
      <template v-if="!isEditing">
        <div class="info-item">
          <span class="label">昵称:</span>
          <span class="value">{{ profile.nickname }}</span>
        </div>
        <div class="info-item">
          <span class="label">姓名:</span>
          <span class="value">{{ profile.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">部门:</span>
          <span class="value">{{ profile.department }}</span>
        </div>
        <ConfirmButton v-if="!isEditing" @click="handleEditProfile" text="编辑资料" />
      </template>
      
      <template v-else>
        <div class="info-item">
          <span class="label">昵称:</span>
          <input v-model="editingProfile.nickname" type="text" class="edit-input">
        </div>
        <div class="info-item">
          <span class="label">姓名:</span>
          <input v-model="editingProfile.name" type="text" class="edit-input">
        </div>
        <div class="info-item">
          <span class="label">部门:</span>
          <input v-model="editingProfile.department" type="text" class="edit-input">
        </div>
        <div class="button-group">
          <CancelButton @click="isEditing = false" />
          <ConfirmButton @click="handleSaveProfile">保存</ConfirmButton>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.profile-section {
  background: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  color: #e0e0e0;
  width: 80%;
  max-height: 400px;
  max-width: 500px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: auto;
}

.profile-content {
  max-width: 600px;
  margin-top: 32px;
}


.info-item {
  max-height: 25px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
}

.info-item .label {
  font-size: 16px;
  color: #a0a0a0;
  width: 50px;
}

.info-item .value {
  font-size: 16px;
  color: #ffffff;
  margin-left: 8px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #9e9e9e;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #9e9e9e;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-start;
}

.section-header h2 {
  font-size: 28px;
  margin: 0;
  color: #ffffff;
}

.edit-input {
  width: 200px;
  padding: 4px 8px;
  margin-left: 8px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 16px;
}

.divider {
  height: 1px;
  background: #444;
  margin-top: 12px;
  width: 100%;
}
</style>