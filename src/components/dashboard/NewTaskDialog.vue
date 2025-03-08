<script setup lang="ts">
import { ref } from 'vue'
import CancelButton from '@/components/common/CancelButton.vue'
import ConfirmButton from '@/components/common/ConfirmButton.vue'
import ErrorNotification from '@/components/common/ErrorNotification.vue'

interface TaskForm {
  name: string
  description: string
  category: string
  site_url: string
  schedule: string
}

const emit = defineEmits<{
  'create': [form: TaskForm]
  'close': []
}>()

const taskForm = ref<TaskForm>({
  name: '',
  description: '',
  category: '',
  site_url: '',
  schedule: ''
})

const errorMessage = ref('')
const showError = ref(false)

const validateTaskForm = () => {
  if (!taskForm.value.name.trim()) {
    throw new Error('任务名称不能为空')
  }
  if (!taskForm.value.category.trim()) {
    throw new Error('分类不能为空')
  }
  if (!taskForm.value.site_url.trim()) {
    throw new Error('网站地址不能为空')
  }
  return true
}

const handleCreate = () => {
  try {
    if (validateTaskForm()) {
      emit('create', taskForm.value)
    }
  } catch (error: any) {
    errorMessage.value = error.message
    showError.value = true
  }
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h3>创建新任务</h3>
      <form @submit.prevent="handleCreate">
        <div class="form-group">
          <label>任务名称:</label>
          <input v-model="taskForm.name" type="text" required />
        </div>
        <div class="form-group">
          <label>任务描述:</label>
          <textarea v-model="taskForm.description"></textarea>
        </div>
        <div class="form-group">
          <label>分类:</label>
          <input v-model="taskForm.category" type="text" required />
        </div>
        <div class="form-group">
          <label>网站地址:</label>
          <input v-model="taskForm.site_url" type="url" required />
        </div>
        <div class="form-group">
          <label>计划时间:</label>
          <input v-model="taskForm.schedule" type="text" />
        </div>
        <div class="button-group">
          <CancelButton @click="emit('close')" />
          <ConfirmButton @click="handleCreate" text="创建" />
        </div>
      </form>
    </div>
  </div>

  <ErrorNotification
    :message="errorMessage"
    :show="showError"
    @close="showError = false"
  />
</template>

<style scoped>
/* 复制现有的对话框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(30, 30, 30, 0.9);
  padding: 24px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1001;
}

.modal-content h3 {
  color: #ffffff;
  margin: 0 0 20px 0;
  font-size: 18px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  color: #a0a0a0;
  font-size: 14px;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: #ffffff;
  font-size: 14px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style> 