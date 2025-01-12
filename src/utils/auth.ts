import { userApi } from '@/services/api'

export async function checkAuthStatus(): Promise<boolean> {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return false
  }

  try {
    // 尝试获取用户资料
    await userApi.getProfile()
    return true
  } catch (error) {
    // 如果获取失败,清除无效的 token
    localStorage.removeItem('token')
    return false
  }
} 