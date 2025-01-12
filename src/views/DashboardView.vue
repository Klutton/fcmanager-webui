<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { userApi } from '@/services/api'
import SideMenu from '@/components/SideMenu.vue'

interface Profile {
  nickname: string
  name: string
  department: string
  role: string
}

// 定义任务过滤的接口
interface TaskQueryParams {
  status?: string
  category?: string
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

// 定义任务的接口
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

const profile = ref<Profile>({
  nickname: '',
  name: '',
  department: '',
  role: 'user'
})

const tasks = ref<Task[]>([])
const loading = ref(true)
const error = ref('')
const activeView = ref('profile')
const isEditing = ref(false)
const editingProfile = ref<Profile>({
  nickname: '',
  name: '',
  department: '',
  role: 'user'
})
const selectedCategory = ref('all')

const categories = ref<string[]>(['全部'])

const loadProfile = async () => {
  try {
    const response = await userApi.getProfile()
    if (response.success) {
      profile.value = response.data
      editingProfile.value = { ...response.data }
    }
  } catch (err: any) {
    error.value = err.message
  }
}

const loadTasks = async () => {
  try {
    const response = await userApi.getTasks({
      page: 1,
      page_size: 20
    })
    if (response.success) {
      tasks.value = response.data.tasks
      // 确保创建时间是有效的日期格式
      tasks.value = tasks.value.map(task => ({
        ...task,
        create_time: task.created_at ? new Date(task.created_at).toISOString() : new Date().toISOString()
      }))
      // 自动选择"全部"
      selectedCategory.value = '全部'
      // 提取所有分类
      const uniqueCategories = new Set(tasks.value.map(task => task.category))
      categories.value = ['全部', ...Array.from(uniqueCategories)]
    }
  } catch (err: any) {
    error.value = err.message
  }
}

const handleMenuChange = (menu: string) => {
  activeView.value = menu
}

const handleEditProfile = () => {
  isEditing.value = true
  editingProfile.value = { ...profile.value }
}

const handleSaveProfile = async () => {
  try {
    await userApi.updateProfile(editingProfile.value)
    profile.value = { ...editingProfile.value }
    isEditing.value = false
  } catch (err: any) {
    error.value = err.message
  }
}

const filteredTasks = computed(() => {
  if (!tasks.value) return []
  
  return tasks.value.filter(task => {
    // 如果没有选择任何分类，显示所有任务
    const categoryMatch = selectedCategories.value.length === 0 || 
      selectedCategories.value.includes(task.category)
    const statusMatch = selectedStatuses.value.length === 0 || 
      selectedStatuses.value.includes(task.status)
    return categoryMatch && statusMatch
  })
})

onMounted(async () => {
  try {
    await Promise.all([loadProfile(), loadTasks()])
  } finally {
    loading.value = false
  }
})

const showCreateForm = ref(false)
const taskForm = ref<TaskForm>({
  name: '',
  description: '',
  category: '',
  site_url: '',
  schedule: ''
})

const validateTaskForm = () => {
  if (!taskForm.value.name.trim()) {
    error.value = '请输入任务名称'
    return false
  }
  if (!taskForm.value.description.trim()) {
    error.value = '请输入任务描述'
    return false
  }
  if (!taskForm.value.category.trim()) {
    error.value = '请输入任务分类'
    return false
  }
  if (!taskForm.value.site_url.trim()) {
    error.value = '请输入网站地址'
    return false
  }
  // URL 格式验证
  try {
    new URL(taskForm.value.site_url)
  } catch {
    error.value = '请输入有效的网站地址'
    return false
  }
  return true
}

const handleCreateTask = async () => {
  try {
    error.value = ''
    if (!validateTaskForm()) {
      return
    }
    
    await userApi.createTask(taskForm.value)
    // 重新加载任务列表
    await loadTasks()
    // 重置表单
    taskForm.value = {
      name: '',
      description: '',
      category: '',
      site_url: '',
      schedule: ''
    }
    showCreateForm.value = false
  } catch (err: any) {
    error.value = err.message
  }
}

// 添加任务详情相关的状态
const showTaskInfo = ref(false)
const selectedTask = ref<any>(null)
const taskInfo = ref<any>(null)
const loadingInfo = ref(false)

// 添加获取任务详情的方法
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
    error.value = err.message
  } finally {
    loadingInfo.value = false
  }
}

// 添加编辑状态
const editingTask = ref<{
  name?: string
  description?: string
  site_url?: string
  schedule?: string
}>({})

// 添加修改任务的方法
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
      // 重新加载任务列表
      await loadTasks()
      isEditing.value = false
      showTaskInfo.value = false
    }
  } catch (err: any) {
    error.value = err.message
  }
}

// 开始编辑时初始化表单
const startEditing = () => {
  editingTask.value = {
    name: selectedTask.value?.name,
    description: selectedTask.value?.description,
    site_url: selectedTask.value?.site_url,
    schedule: selectedTask.value?.schedule
  }
  isEditing.value = true
}

// 添加状态选项
const statusOptions = [
  { value: 'pending', label: '待审核', color: '#ffc107' },
  { value: 'approved', label: '已通过', color: '#4CAF50' },
  { value: 'rejected', label: '已拒绝', color: '#ff4444' }
]

// 修改筛选状态
const selectedCategories = ref<string[]>([])
const selectedStatuses = ref<string[]>([])

const toggleCategory = (category: string) => {
  if (category === '全部') {
    // 如果点击"全部"，清空所有选择
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
</script>


<template>
  <div class="dashboard-container">
    <SideMenu 
      @change="handleMenuChange" 
      :username="profile.nickname || '用户'"
      :isAdmin="profile.role === 'admin'"
    />
    
    <div class="content">
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="loading" class="loading">加载中...</div>
      
      <template v-else>
        <!-- 个人档案视图 -->
        <div v-if="activeView === 'profile'" class="profile-section">
          <div class="section-header">
            <h2>个人档案</h2>
            <button v-if="!isEditing" @click="handleEditProfile" class="edit-btn">
              编辑资料
            </button>
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
                <span class="value" v-html="profile.department"></span>
              </div>
            </template>
            
            <template v-else>
              <div class="form-group">
                <label>昵称:</label>
                <input v-model="editingProfile.nickname" type="text">
              </div>
              <div class="form-group">
                <label>姓名:</label>
                <input v-model="editingProfile.name" type="text">
              </div>
              <div class="form-group">
                <label>部门:</label>
                <input v-model="editingProfile.department" type="text">
              </div>
              <div class="button-group">
                <button @click="handleSaveProfile" class="save-btn">保存</button>
                <button @click="isEditing = false" class="cancel-btn">取消</button>
              </div>
            </template>
          </div>
        </div>

        <!-- 任务列表视图 -->
        <div v-else-if="activeView === 'tasks'" class="tasks-section">
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
              <button @click="showCreateForm = true" class="create-btn">
                创建任务
              </button>
            </div>
          </div>
          
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
      </template>
    </div>
  </div>

  <!-- 创建任务表单 -->
  <div v-if="showCreateForm" class="create-form-overlay">
    <div class="create-form">
      <h3>创建新任务</h3>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div class="form-group">
        <label>任务名称: <span class="required">*</span></label>
        <input v-model="taskForm.name" type="text">
      </div>
      <div class="form-group">
        <label>描述: <span class="required">*</span></label>
        <textarea v-model="taskForm.description"></textarea>
      </div>
      <div class="form-group">
        <label>分类: <span class="required">*</span></label>
        <input v-model="taskForm.category" type="text">
      </div>
      <div class="form-group">
        <label>网站地址: <span class="required">*</span></label>
        <input v-model="taskForm.site_url" type="url">
      </div>
      <div class="form-group">
        <label>调度计划:</label>
        <input v-model="taskForm.schedule" type="text" placeholder="cron表达式，留空只爬取一次">
      </div>
      <div class="button-group">
        <button @click="handleCreateTask" class="save-btn">提交</button>
        <button @click="showCreateForm = false" class="cancel-btn">取消</button>
      </div>
    </div>
  </div>

  <!-- 添加任务详情弹窗 -->
  <div v-if="showTaskInfo" class="task-info-overlay" @click="showTaskInfo = false">
    <div class="task-info-modal" @click.stop>
      <div class="modal-header">
        <h3>{{ selectedTask?.name }}</h3>
        <div class="modal-actions">
          <button v-if="!isEditing" class="edit-btn" @click="startEditing">
            修改
          </button>
          <button class="close-btn" @click="showTaskInfo = false">&times;</button>
        </div>
      </div>
      
      <div class="modal-content">
        <div v-if="loadingInfo" class="loading">加载中...</div>
        <div v-else>
          <!-- 编辑表单 -->
          <div v-if="isEditing" class="edit-form">
            <div class="form-group">
              <label>任务名称:</label>
              <input v-model="editingTask.name" type="text">
            </div>
            <div class="form-group">
              <label>描述:</label>
              <textarea v-model="editingTask.description"></textarea>
            </div>
            <div class="form-group">
              <label>网站地址:</label>
              <input v-model="editingTask.site_url" type="url">
            </div>
            <div class="form-group">
              <label>调度计划:</label>
              <input v-model="editingTask.schedule" type="text">
            </div>
            <div class="button-group">
              <button class="save-btn" @click="handleModifyTask">保存</button>
              <button class="cancel-btn" @click="isEditing = false">取消</button>
            </div>
          </div>

          <!-- 任务基本信息 -->
          <div v-else class="info-section">
            <div class="info-item">
              <span class="label">描述:</span>
              <span>{{ selectedTask?.description }}</span>
            </div>
            <div class="info-item">
              <span class="label">分类:</span>
              <span>{{ selectedTask?.category }}</span>
            </div>
            <div class="info-item">
              <span class="label">状态:</span>
              <span>{{ selectedTask?.status }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间:</span>
              <span>{{ selectedTask?.created_at ? new Date(selectedTask.created_at).toLocaleString('zh-CN') : '暂无' }}</span>
            </div>
            <div class="info-item">
              <span class="label">审核时间:</span>
              <span>{{ selectedTask?.approved_at ? new Date(selectedTask.approved_at).toLocaleString('zh-CN') : '暂无' }}</span>
            </div>
            <div class="info-item">
              <span class="label">申请人:</span>
              <span>{{ selectedTask?.applicant_name }}</span>
            </div>
            <div class="info-item">
              <span class="label">审核人:</span>
              <span>{{ selectedTask?.reviewer_name || '暂无' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 修改筛选区域 -->
  <!-- <div class="filters">
    <div class="filter-group">
      <label>分类:</label>
      <div class="tags">
        <span
          v-for="category in categories"
          :key="category"
          :class="['tag', { active: selectedCategories.includes(category) }]"
          @click="toggleCategory(category)"
        >
          {{ category }}
        </span>
      </div>
    </div>
    
    <div class="filter-group">
      <label>状态:</label>
      <div class="tags">
        <span
          v-for="status in statusOptions"
          :key="status.value"
          :class="['tag', { active: selectedStatuses.includes(status.value) }]"
          :style="{ '--tag-color': status.color }"
          @click="toggleStatus(status.value)"
        >
          {{ status.label }}
        </span>
      </div>
    </div>
  </div> -->
</template>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  background: #121212;
}

.content {
  margin-left: 180px;
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  width: calc(100vw - 180px);
  height: 100vh;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.profile-section, .tasks-section {
  background: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  color: #e0e0e0;
  width: 100%;
  height: calc(100vh - 48px);
  margin: 0;
  overflow-y: auto;
}

.profile-content {
  max-width: 600px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #e0e0e0;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.edit-btn, .save-btn, .cancel-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.edit-btn, .save-btn {
  background: #4CAF50;
  color: white;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.category-filter {
  select {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
}

/* 保留原有的任务卡片样式 */
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px 0;
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

.profile-section {
  background: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  color: #e0e0e0;
  width: 90%;
  max-width: 800px;
  margin: 0 auto;
  height: auto;
}

.section-header h2 {
  font-size: 28px;
  margin: 0;
  color: #ffffff;
}

.profile-content {
  margin-top: 32px;
}

.info-item {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

.info-item .label {
  font-size: 16px;
  color: #a0a0a0;
  width: 80px;
}

.info-item .value {
  font-size: 16px;
  color: #ffffff;
  margin-left: 16px;
}

.edit-btn {
  padding: 6px 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.create-btn {
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.create-form {
  background: #1e1e1e;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.create-form h3 {
  margin-bottom: 20px;
  color: #ffffff;
}

.create-form .form-group {
  margin-bottom: 16px;
}

.create-form label {
  display: block;
  margin-bottom: 8px;
  color: #e0e0e0;
}

.create-form input,
.create-form textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #2a2a2a;
  color: #ffffff;
}

.create-form textarea {
  height: 100px;
  resize: vertical;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.required {
  color: #ff4444;
  margin-left: 4px;
}

.error-message {
  color: #ff4444;
  margin-bottom: 16px;
  padding: 8px;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 4px;
  font-size: 14px;
}

.create-form input:invalid,
.create-form textarea:invalid {
  border-color: #ff4444;
}

/* 任务详情弹窗样式 */
.task-info-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.task-info-modal {
  background: #1e1e1e;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  color: #ffffff;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  padding: 4px 8px;
}

.info-item {
  margin-bottom: 16px;
}

.info-item .label {
  color: #a0a0a0;
  margin-right: 8px;
}

.data-preview {
  margin-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

.data-item {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}

.metadata {
  font-size: 12px;
  color: #a0a0a0;
  margin-bottom: 12px;
}

.markdown {
  white-space: pre-wrap;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 4px;
}

.warning-message {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.edit-form {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 4px;
  margin-top: 16px;
}

.edit-form .form-group {
  margin-bottom: 16px;
}

.edit-form label {
  display: block;
  margin-bottom: 8px;
  color: #a0a0a0;
}

.edit-form input,
.edit-form textarea {
  width: 100%;
  padding: 8px;
  background: #2a2a2a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #ffffff;
}

.edit-form textarea {
  height: 100px;
  resize: vertical;
}

.info-section {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.crawler-info {
  margin-top: 24px;
}

.save-btn {
  background: #4CAF50;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #666;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.filters {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-group label {
  color: #a0a0a0;
  font-size: 14px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.tag:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tag.active {
  background: var(--tag-color, #4CAF50);
  color: white;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: color-mix(in srgb, var(--status-color) 15%, transparent);
  color: var(--status-color);
}
</style> 