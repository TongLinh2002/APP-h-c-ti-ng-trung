<template>
  <nav class="navbar">
    <RouterLink to="/">Trang chủ</RouterLink>
    <RouterLink to="/journey">Hành trình</RouterLink>
    <RouterLink to="/learn">Học từ</RouterLink>
    <RouterLink to="/challenge">Thử thách</RouterLink>
    <RouterLink to="/listen">Nghe</RouterLink>
    <RouterLink to="/read">Đọc</RouterLink>
    <RouterLink to="/resources">Tài liệu</RouterLink>
    <RouterLink to="/dashboard">Tiến độ</RouterLink>
    <button v-if="authStore.isLoggedIn" @click="logout" class="btn-logout">Đăng xuất</button>
    <RouterLink v-else to="/login" class="btn-login">Đăng nhập</RouterLink>
  </nav>
  <main class="main-content">
    <RouterView />
  </main>
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; color: #333; }
.navbar { background: #d32f2f; padding: 12px 24px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.navbar a { color: white; text-decoration: none; font-weight: 500; padding: 6px 12px; border-radius: 4px; }
.navbar a:hover, .navbar a.router-link-active { background: rgba(255,255,255,0.2); }
.btn-logout { margin-left: auto; background: rgba(255,255,255,0.2); color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; }
.btn-login { margin-left: auto !important; }
.main-content { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
</style>
