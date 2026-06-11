<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>{{ $t('auth.register') }}</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>{{ $t('auth.displayName') }}</label>
          <input v-model="displayName" type="text" :placeholder="$t('auth.displayNamePlaceholder')" />
        </div>
        <div class="form-group">
          <label>{{ $t('auth.email') }}</label>
          <input v-model="email" type="email" placeholder="email@example.com" required />
        </div>
        <div class="form-group">
          <label>{{ $t('auth.password') }}</label>
          <input v-model="password" type="password" :placeholder="$t('auth.passwordPlaceholder')" required minlength="6" />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? $t('auth.registering') : $t('auth.register') }}
        </button>
      </form>
      <p class="auth-link">{{ $t('auth.hasAccount') }} <RouterLink to="/login">{{ $t('auth.login') }}</RouterLink></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'

const displayName = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    await authStore.registerAction(email.value, password.value, displayName.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || t('auth.registerFailed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
.auth-card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
h2 { margin-bottom: 24px; font-size: 1.5rem; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 500; }
.form-group input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
.btn-primary { width: 100%; padding: 12px; background: #d32f2f; color: white; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; margin-top: 8px; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.error-msg { color: #d32f2f; margin-bottom: 8px; font-size: 0.9rem; }
.auth-link { text-align: center; margin-top: 16px; color: #666; }
.auth-link a { color: #d32f2f; }
</style>
