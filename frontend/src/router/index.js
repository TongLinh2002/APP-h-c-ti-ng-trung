import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/login', component: () => import('../views/LoginView.vue') },
  { path: '/register', component: () => import('../views/RegisterView.vue') },
  { path: '/learn', component: () => import('../views/LearnView.vue'), meta: { requiresAuth: true } },
  { path: '/listen', component: () => import('../views/ListenView.vue'), meta: { requiresAuth: true } },
  { path: '/read', component: () => import('../views/ReadView.vue'), meta: { requiresAuth: true } },
  { path: '/dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/journey', component: () => import('../views/JourneyView.vue'), meta: { requiresAuth: true } },
  { path: '/challenge', component: () => import('../views/ChallengeView.vue'), meta: { requiresAuth: true } },
  { path: '/resources', component: () => import('../views/ResourcesView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
