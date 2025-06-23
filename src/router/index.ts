import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/profile'
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/Profile/index.vue'),
    meta: { title: '个人资料' }
  },
  {
    path: '/user-management',
    name: 'UserManagement',
    component: () => import('@/pages/UserManagement/index.vue'),
    meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
