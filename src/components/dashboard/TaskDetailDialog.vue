<script setup lang="ts">
import { ref, watch } from 'vue'
import { userApi } from '@/services/api'
import CancelButton from '@/components/common/CancelButton.vue'
import ConfirmButton from '@/components/common/ConfirmButton.vue'

interface Task {
  id: number
  name: string
  description: string
  category: string
  site_url: string
  schedule: string
  status: string
  created_at: string
  approved_at: string | null
  fc_task_id: string | null
  applicant_name: string
  reviewer_name: string | null
}

const props = defineProps<{
  task: Task | null
}>()

const emit = defineEmits<{
  'update:task': [task: Task]
  'close': []
}>()

const isEditing = ref(false)
const editingTask = ref<{
  name?: string
  description?: string
  site_url?: string
  schedule?: string
}>({})

const taskInfo = ref<any>(null)

const statusOptions = [
  { value: 'pending', label: '待审核', color: '#ffc107' },
  { value: 'approved', label: '已通过', color: '#4CAF50' },
  { value: 'rejected', label: '已拒绝', color: '#ff4444' }
]

const startEditing = () => {
  editingTask.value = {
    name: props.task?.name,
    description: props.task?.description,
    site_url: props.task?.site_url,
    schedule: props.task?.schedule
  }
  isEditing.value = true
}

const handleModifyTask = async () => {
  try {
    if (!props.task) return
    
    const response = await userApi.modifyTask({
      task_id: props.task.id,
      name: editingTask.value.name,
      description: editingTask.value.description,
      url: editingTask.value.site_url,
      schedule: editingTask.value.schedule
    })
    
    if (response.success) {
      emit('update:task', {
        ...props.task,
        ...editingTask.value
      })
      isEditing.value = false
      emit('close')
    }
  } catch (err: any) {
    console.error(err.message)
  }
}

// 当任务状态为已通过时，获取任务信息
watch(() => props.task, async (newTask) => {
  if (newTask?.status === 'approved' && newTask.fc_task_id) {
    try {
      const response = await userApi.getTaskInfo(newTask.fc_task_id)
      if (response.success) {
        taskInfo.value = response.data
      }
    } catch (err) {
      console.error('获取任务信息失败:', err)
    }
  } else {
    taskInfo.value = null
  }
}, { immediate: true })
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h3>任务详情</h3>
      <div v-if="task?.status === 'approved' && taskInfo" class="task-info">
        <template v-if="taskInfo.data">
          <div v-for="(item, index) in taskInfo.data.data" :key="index">
            <div class="markdown-content" v-html="item.markdown"></div>
            <div class="metadata">
              <p>来源: <a :href="item.metadata.sourceURL" target="_blank">{{ item.metadata.sourceURL }}</a></p>
              <p>状态码: {{ item.metadata.statusCode }}</p>
              <p>标题: {{ item.metadata.title }}</p>
            </div>
          </div>
        </template>
        <div v-else class="loading">加载中...</div>
      </div>
      <div v-else class="task-details">
        <div class="detail-item">
          <label>任务名称:</label>
          <span>{{ task?.name }}</span>
        </div>
        <div class="detail-item">
          <label>任务描述:</label>
          <span>{{ task?.description }}</span>
        </div>
        <div class="detail-item">
          <label>网站地址:</label>
          <span>{{ task?.site_url }}</span>
        </div>
        <div class="detail-item">
          <label>计划时间:</label>
          <span>{{ task?.schedule }}</span>
        </div>
        <div class="detail-item">
          <label>状态:</label>
          <span>{{ statusOptions.find(s => s.value === task?.status)?.label }}</span>
        </div>
      </div>
      <div class="button-group">
        <CancelButton text="关闭" @click="emit('close')" />
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.task-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-item label {
  display: block;
  color: #a0a0a0;
  font-size: 14px;
  margin-bottom: 8px;
}

.detail-item span {
  color: #e0e0e0;
  font-size: 14px;
}

.detail-item input,
.detail-item textarea {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: #ffffff;
  font-size: 14px;
}

.detail-item textarea {
  height: 100px;
  resize: vertical;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.task-info {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-bottom: 16px;
}

.markdown-content {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-bottom: 16px;
}

.markdown-content :deep(h1) {
  font-size: 1.5em;
  color: #fff;
  margin-bottom: 16px;
}

.markdown-content :deep(a) {
  color: #4CAF50;
  text-decoration: underline;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #a0a0a0;
}

.metadata {
  margin-top: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.metadata p {
  margin: 8px 0;
  color: #a0a0a0;
}

.metadata a {
  color: #4CAF50;
  text-decoration: none;
}

.metadata a:hover {
  text-decoration: underline;
}
</style> 