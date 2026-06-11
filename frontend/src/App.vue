<template>
  <SakuraBackground />
  <nav class="navbar">
    <RouterLink to="/">{{ $t('nav.home') }}</RouterLink>
    <RouterLink to="/journey">{{ $t('nav.journey') }}</RouterLink>
    <RouterLink to="/learn">{{ $t('nav.learn') }}</RouterLink>
    <RouterLink to="/challenge">{{ $t('nav.challenge') }}</RouterLink>
    <RouterLink to="/listen">{{ $t('nav.listen') }}</RouterLink>
    <RouterLink to="/read">{{ $t('nav.read') }}</RouterLink>
    <RouterLink to="/resources">{{ $t('nav.resources') }}</RouterLink>
    <RouterLink to="/dashboard">{{ $t('nav.dashboard') }}</RouterLink>
    <RouterLink v-if="authStore.isAdmin" to="/admin" class="btn-admin">{{ $t('nav.admin') }}</RouterLink>
    <button v-if="authStore.isLoggedIn" @click="logout" class="btn-logout">{{ $t('nav.logout') }}</button>
    <RouterLink v-else to="/login" class="btn-login">{{ $t('nav.login') }}</RouterLink>
    <LanguageSwitcher />
  </nav>
  <main class="main-content">
    <RouterView />
  </main>
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import SakuraBackground from './components/SakuraBackground.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(160deg, #fff0f5 0%, #ffe4ee 50%, #ffd6e0 100%);
  background-attachment: fixed;
  color: #333;
  min-height: 100vh;
}
.navbar { position: relative; z-index: 1; background: #d32f2f; padding: 12px 24px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.navbar a { color: white; text-decoration: none; font-weight: 500; padding: 6px 12px; border-radius: 4px; }
.navbar a:hover, .navbar a.router-link-active { background: rgba(255,255,255,0.2); }
.btn-logout { margin-left: auto; background: rgba(255,255,255,0.2); color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; }
.btn-login { margin-left: auto !important; }
.btn-admin { background: #ff8f00 !important; color: white !important; font-weight: 700 !important; }
.main-content { position: relative; z-index: 1; max-width: 960px; margin: 0 auto; padding: 24px 16px; }
</style>
