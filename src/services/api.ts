import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

// 请求拦截器：添加 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// 将对象转换为 form-data 格式
const toFormData = (data: any) => {
  const formData = new FormData()
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key])
    }
  })
  return formData
}

// 定义个人资料的接口
interface Profile {
  nickname: string
  name: string
  department: string
  role: string
}

// 定义任务表单的接口
interface TaskForm {
  name: string
  description: string
  category: string
  site_url: string
  schedule: string
}

export const userApi = {
  // 注册
  register: async (username: string, password: string) => {
    try {
      const response = await api.post('/user/register', toFormData({
        username,
        password
      }))
      return response.data
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('连接到服务器失败')
      }
      throw new Error(error.response?.data?.message || '注册失败')
    }
  },

  // 登录
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/user/login', toFormData({
        username,
        password
      }))
      return response.data
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('连接到服务器失败')
      }
      throw new Error(error.response?.data?.message || '登录失败')
    }
  },

  // 获取用户资料
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile/get')
      return response.data
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('连接到服务器失败')
      }
      throw new Error(error.response?.data?.message || '获取用户资料失败')
    }
  },

  // 更新个人资料
  updateProfile: async (profile: Profile) => {
    try {
      const response = await api.post('/user/profile/update', toFormData({
        nickname: profile.nickname,
        name: profile.name,
        department: profile.department
      }))
      return response.data
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('连接到服务器失败')
      }
      throw new Error(error.response?.data?.message || '更新个人资料失败')
    }
  },

  // 获取任务列表
  getTasks: async (params: {
    status?: string
    category?: string 
    start_date?: string
    end_date?: string
    page?: number
    page_size?: number
  } = {}) => {
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams()
      if (params.status) queryParams.append('status', params.status)
      if (params.category) queryParams.append('category', params.category)
      if (params.start_date) queryParams.append('start_date', params.start_date)
      if (params.end_date) queryParams.append('end_date', params.end_date)
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.page_size) queryParams.append('page_size', params.page_size.toString())

      const response = await api.get(`/fctask/get?${queryParams.toString()}`)
      return response.data
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('连接到服务器失败')
      }
      throw new Error(error.response?.data?.message || '获取任务列表失败')
    }
  },

  // 创建任务
  createTask: async (taskForm: TaskForm) => {
    try {
      const response = await api.post('/fctask/create', toFormData({
        name: taskForm.name,
        description: taskForm.description,
        category: taskForm.category,
        site_url: taskForm.site_url,
        schedule: taskForm.schedule
      }))
      return response.data
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('连接到服务器失败')
      }
      throw new Error(error.response?.data?.message || '创建任务失败')
    }
  },

  // 获取任务详情
  getTaskInfo: async (fc_task_id: string) => {
    try {
      if (!fc_task_id) {
        throw new Error('缺少任务ID')
      }
      const response = await api.get(`/fctask/info?fc_task_id=${fc_task_id}`)
      return response.data
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('连接到服务器失败')
      }
      throw new Error(error.response?.data?.message || '获取任务详情失败')
    }
  },

  // 修改任务
  modifyTask: async (params: {
    task_id: number
    url?: string
    name?: string
    description?: string
    schedule?: string
  }) => {
    try {
      const response = await api.post('/fctask/modify', toFormData(params))
      return response.data
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('连接到服务器失败')
      }
      throw new Error(error.response?.data?.message || '修改任务失败')
    }
  }
} 