<template>
  <SakuraBackground />
  <nav class="navbar">
    <RouterLink to="/" class="nav-brand">学</RouterLink>

    <!-- Links for logged-in users -->
    <template v-if="authStore.isLoggedIn">
      <RouterLink to="/journey">{{ $t('nav.journey') }}</RouterLink>
      <RouterLink to="/learn">{{ $t('nav.learn') }}</RouterLink>
      <RouterLink to="/challenge">{{ $t('nav.challenge') }}</RouterLink>
      <RouterLink to="/listen">{{ $t('nav.listen') }}</RouterLink>
      <RouterLink to="/read">{{ $t('nav.read') }}</RouterLink>
      <RouterLink to="/resources">{{ $t('nav.resources') }}</RouterLink>
      <RouterLink to="/dashboard">{{ $t('nav.dashboard') }}</RouterLink>
      <RouterLink v-if="authStore.isAdmin" to="/admin" class="btn-admin">{{ $t('nav.admin') }}</RouterLink>
    </template>

    <!-- Links for guests -->
    <template v-else>
      <RouterLink to="/resources">{{ $t('nav.resources') }}</RouterLink>
    </template>

    <div class="nav-right">
      <LanguageSwitcher />
      <button v-if="authStore.isLoggedIn" @click="logout" class="btn-logout">{{ $t('nav.logout') }}</button>
      <RouterLink v-else to="/login" class="btn-login">{{ $t('nav.login') }}</RouterLink>
    </div>
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
.navbar {
  position: relative;
  z-index: 10;
  background: #d32f2f;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  min-height: 52px;
}
.nav-brand {
  font-size: 1.5rem;
  font-weight: 900;
  color: white !important;
  text-decoration: none;
  padding: 8px 10px !important;
  margin-right: 4px;
  letter-spacing: 1px;
}
.navbar a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  white-space: nowrap;
}
.navbar a:hover, .navbar a.router-link-active { background: rgba(255,255,255,0.2); }
.nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-logout {
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  padding: 7px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}
.btn-logout:hover { background: rgba(255,255,255,0.35); }
.btn-login {
  background: white !important;
  color: #d32f2f !important;
  font-weight: 700 !important;
  padding: 7px 16px !important;
  border-radius: 4px;
  white-space: nowrap;
}
.btn-admin {
  background: #ff8f00 !important;
  color: white !important;
  font-weight: 700 !important;
}
.main-content {
  position: relative;
  z-index: 1;
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
}

@media (max-width: 640px) {
  .navbar { gap: 2px; padding: 0 10px; }
  .navbar a { padding: 8px 7px; font-size: 0.82rem; }
}
</style>
