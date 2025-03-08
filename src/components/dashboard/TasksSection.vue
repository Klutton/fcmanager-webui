<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { userApi } from '@/services/api'
import CancelButton from '@/components/common/CancelButton.vue'
import ConfirmButton from '@/components/common/ConfirmButton.vue'
import TaskDetailDialog from './TaskDetailDialog.vue'
import NewTaskDialog from './NewTaskDialog.vue'

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

interface TaskForm {
  name: string
  description: string
  category: string
  site_url: string
  schedule: string
}

const statusOptions = [
  { value: 'pending', label: '待审核', color: '#ffc107' },
  { value: 'approved', label: '已通过', color: '#4CAF50' },
  { value: 'rejected', label: '已拒绝', color: '#ff4444' }
]

const props = defineProps<{
  error?: string
}>()

const emit = defineEmits<{
  'error': [message: string]
}>()

// 状态
const tasks = ref<Task[]>([])
const categories = ref<string[]>(['全部'])
const selectedCategories = ref<string[]>([])
const selectedStatuses = ref<string[]>([])
const showCreateForm = ref(false)
const showTaskInfo = ref(false)
const selectedTask = ref<Task | null>(null)
const taskInfo = ref<any>(null)
const loadingInfo = ref(false)
const isEditing = ref(false)

// 表单状态
const editingTask = ref<{
  name?: string
  description?: string
  site_url?: string
  schedule?: string
}>({})

// 加载任务列表
const loadTasks = async () => {
  try {
    const response = await userApi.getTasks({
      page: 1,
      page_size: 20
    })
    if (response.success) {
      tasks.value = response.data.tasks.map((task: Task) => ({
        ...task,
        create_time: task.created_at ? new Date(task.created_at).toISOString() : new Date().toISOString()
      }))
      const uniqueCategories = new Set(tasks.value.map(task => task.category))
      categories.value = ['全部', ...Array.from(uniqueCategories)]
    }
  } catch (err: any) {
    emit('error', err.message)
  }
}

// 创建任务
const handleCreateTask = async (form: TaskForm) => {
  try {
    await userApi.createTask(form)
    await loadTasks()
    showCreateForm.value = false
  } catch (err: any) {
    emit('error', err.message)
  }
}

// 任务详情
const handleTaskClick = async (task: Task) => {
  try {
    showTaskInfo.value = true
    selectedTask.value = task
    
    if (task.fc_task_id) {
      loadingInfo.value = true
      const response = await userApi.getTaskInfo(task.fc_task_id)
      if (response.success) {
        taskInfo.value = response.data
      }
    } else {
      taskInfo.value = null
    }
  } catch (err: any) {
    emit('error', err.message)
  } finally {
    loadingInfo.value = false
  }
}

// 修改任务
const handleModifyTask = async () => {
  try {
    if (!selectedTask.value) return
    
    const response = await userApi.modifyTask({
      task_id: selectedTask.value.id,
      name: editingTask.value.name,
      description: editingTask.value.description,
      url: editingTask.value.site_url,
      schedule: editingTask.value.schedule
    })
    
    if (response.success) {
      await loadTasks()
      isEditing.value = false
      showTaskInfo.value = false
    }
  } catch (err: any) {
    emit('error', err.message)
  }
}

// 开始编辑
const startEditing = () => {
  editingTask.value = {
    name: selectedTask.value?.name,
    description: selectedTask.value?.description,
    site_url: selectedTask.value?.site_url,
    schedule: selectedTask.value?.schedule
  }
  isEditing.value = true
}

// 筛选相关
const toggleCategory = (category: string) => {
  if (category === '全部') {
    selectedCategories.value = []
  } else {
    const index = selectedCategories.value.indexOf(category)
    if (index === -1) {
      selectedCategories.value.push(category)
    } else {
      selectedCategories.value.splice(index, 1)
    }
  }
}

const toggleStatus = (status: string) => {
  const index = selectedStatuses.value.indexOf(status)
  if (index === -1) {
    selectedStatuses.value.push(status)
  } else {
    selectedStatuses.value.splice(index, 1)
  }
}

const filteredTasks = computed(() => {
  if (!tasks.value) return []
  
  return tasks.value.filter(task => {
    const categoryMatch = selectedCategories.value.length === 0 || 
      selectedCategories.value.includes(task.category)
    const statusMatch = selectedStatuses.value.length === 0 || 
      selectedStatuses.value.includes(task.status)
    return categoryMatch && statusMatch
  })
})

// 初始化加载
onMounted(() => {
  loadTasks()
})

// 添加处理任务更新的方法
const handleTaskUpdate = (updatedTask: Task) => {
  const index = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (index !== -1) {
    tasks.value[index] = updatedTask
  }
}
</script>

<template>
  <div class="tasks-section">
    <div class="section-header">
      <h2>任务列表</h2>
      <div class="header-actions">
        <div class="filter-group">
          <label>分类:</label>
          <div class="tags">
            <span
              v-for="category in categories" 
              :key="category"
              class="tag"
              :class="{ active: selectedCategories.includes(category) }"
              :style="{ '--tag-color': '#4CAF50' }"
              @click="toggleCategory(category)"
            >
              {{ category }}
            </span>
          </div>
        </div>
        <ConfirmButton @click="showCreateForm = true" text="创建任务" />
      </div>
    </div>
    
    <div class="tasks-content">
      <div class="tasks-grid">
        <div 
          v-for="task in filteredTasks" 
          :key="task.id" 
          class="task-card"
          @click="handleTaskClick(task)"
        >
          <div class="task-header">
            <h3>{{ task.name }}</h3>
            <span 
              :class="['status', task.status]"
              :style="{ 
                '--status-color': statusOptions.find(s => s.value === task.status)?.color || '#666'
              }"
            >
              {{ statusOptions.find(s => s.value === task.status)?.label || task.status }}
            </span>
          </div>
          <div class="task-footer">
            <div class="create-time">
              {{ task.created_at ? new Date(task.created_at).toLocaleDateString('zh-CN') : '暂无日期' }}
            </div>
            <a :href="task.site_url" target="_blank" class="site-url">{{ task.site_url }}</a>
          </div>
        </div>
      </div>
    </div>

    <NewTaskDialog
      v-if="showCreateForm"
      @create="handleCreateTask"
      @close="showCreateForm = false"
    />

    <!-- 任务详情对话框 -->
    <TaskDetailDialog
      v-if="showTaskInfo"
      :task="selectedTask"
      @update:task="handleTaskUpdate"
      @close="showTaskInfo = false"
    />
  </div>
</template>

<style scoped>
.tasks-section {
    background: rgba(30, 30, 30, 0.8);
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    color: #e0e0e0;
    width: 100%;
    height: calc(100vh - 48px);
    margin: 0;
    display: flex;
    flex-direction: column;
}

.section-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.tasks-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
}

/* 自定义滚动条 */
.tasks-content::-webkit-scrollbar {
    width: 8px;
}

.tasks-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.tasks-content::-webkit-scrollbar-thumb {
    background: #4CAF50;
    border-radius: 4px;
}

.tasks-content::-webkit-scrollbar-thumb:hover {
    background: #45a049;
}

.tasks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding-bottom: 20px;
}

.task-card {
  background: rgba(40, 40, 40, 0.5);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.task-card:active {
  transform: scale(0.98);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 16px;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.2);
  color: #ffffff;
}

.task-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #a0a0a0;
  line-height: 1.5;
  font-weight: 400;
}

.site-url {
  color: #4CAF50;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.site-url:hover {
  text-decoration: underline;
}

.create-time {
  color: #808080;
  font-size: 12px;
}

.tag {
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  transition: all 0.3s ease;
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.tag:hover {
  background: rgba(76, 175, 80, 0.2);
}

.tag.active {
  background: #4CAF50;
  color: white;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: #a0a0a0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

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