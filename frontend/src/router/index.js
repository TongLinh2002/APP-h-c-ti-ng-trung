import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/',           component: () => import('../views/HomeView.vue') },
  { path: '/login',      component: () => import('../views/LoginView.vue') },
  { path: '/register',   component: () => import('../views/RegisterView.vue') },
  { path: '/resources',  component: () => import('../views/ResourcesView.vue') },

  // Yêu cầu đăng nhập (user + admin)
  { path: '/profile',    component: () => import('../views/ProfileView.vue'),    meta: { requiresAuth: true } },
  { path: '/learn',      component: () => import('../views/LearnView.vue'),      meta: { requiresAuth: true } },
  { path: '/hsk',        component: () => import('../views/HskView.vue'),        meta: { requiresAuth: true } },
  { path: '/hskk',      component: () => import('../views/HskkView.vue'),       meta: { requiresAuth: true } },
  { path: '/dashboard',  component: () => import('../views/DashboardView.vue'),  meta: { requiresAuth: true } },
  { path: '/journey',    component: () => import('../views/JourneyView.vue'),    meta: { requiresAuth: true } },
  { path: '/challenge',  component: () => import('../views/ChallengeView.vue'),  meta: { requiresAuth: true } },

  // Chỉ admin
  { path: '/admin',      component: () => import('../views/AdminView.vue'),      meta: { requiresAdmin: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  const user  = JSON.parse(localStorage.getItem('user') || 'null')

  // Chưa đăng nhập mà vào trang cần auth → về /login
  if ((to.meta.requiresAuth || to.meta.requiresAdmin) && !token) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // Không phải admin mà vào /admin → về trang chủ
  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    return next('/')
  }

  // Đã đăng nhập mà vào /login hoặc /register → chuyển thẳng đến trang chính
  if ((to.path === '/login' || to.path === '/register') && token) {
    return next(user?.role === 'admin' ? '/admin' : '/dashboard')
  }

  next()
})

export default router
