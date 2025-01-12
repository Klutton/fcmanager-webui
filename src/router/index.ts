import { createRouter, createWebHistory } from 'vue-router'
import { checkAuthStatus } from '@/utils/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'

const publicRoutes = ['home', 'login', 'register']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  // 如果是公开路由，直接放行
  if (publicRoutes.includes(to.name as string)) {
    next()
    return
  }

  // 检查登录状态
  const isAuthenticated = await checkAuthStatus()
  
  if (!isAuthenticated && to.name !== 'login') {
    // 如果未登录且目标不是登录页，重定向到登录页
    next({ name: 'login' })
  } else {
    // 已登录或目标是登录页，放行
    next()
  }
})

export default router
