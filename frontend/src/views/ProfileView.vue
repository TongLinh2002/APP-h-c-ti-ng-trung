<template>
  <div class="profile-view">
    <h2>{{ $t('profile.title') }}</h2>

    <div v-if="loading" class="loading">{{ $t('profile.loading') }}</div>

    <div v-else class="profile-card">
      <div class="info-row">
        <span class="info-label">{{ $t('profile.email') }}</span>
        <span class="info-value email">{{ profile.email }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">{{ $t('profile.role') }}</span>
        <span class="badge" :class="profile.role">{{ profile.role === 'admin' ? 'Quản trị viên' : 'Học viên' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">{{ $t('profile.joined') }}</span>
        <span class="info-value">{{ joinedDate }}</span>
      </div>

      <hr class="divider" />

      <form @submit.prevent="save">
        <div class="form-group">
          <label>{{ $t('profile.displayName') }}</label>
          <input v-model="form.display_name" type="text" :placeholder="$t('profile.displayNamePlaceholder')" maxlength="64" />
        </div>
        <div class="form-group">
          <label>{{ $t('profile.hskLevel') }}</label>
          <select v-model="form.current_hsk_level">
            <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
          </select>
          <p class="hint">{{ $t('profile.hskLevelHint') }}</p>
        </div>

        <p v-if="msg" class="msg" :class="msgType">{{ msg }}</p>

        <button type="submit" class="btn-save" :disabled="saving">
          {{ saving ? $t('profile.saving') : $t('profile.save') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const msg = ref('')
const msgType = ref('success')
const profile = ref({})
const form = ref({ display_name: '', current_hsk_level: 1 })

const joinedDate = computed(() => {
  if (!profile.value.createdAt) return ''
  return new Date(profile.value.createdAt).toLocaleDateString('vi-VN')
})

onMounted(async () => {
  try {
    const res = await api.get('/profile')
    profile.value = res.data
    form.value.display_name = res.data.display_name || ''
    form.value.current_hsk_level = res.data.current_hsk_level || 1
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  msg.value = ''
  try {
    const res = await api.put('/profile', form.value)
    profile.value = { ...profile.value, ...res.data }
    // Sync display_name to auth store so navbar shows updated name
    if (authStore.user) {
      authStore.user = { ...authStore.user, display_name: res.data.display_name, current_hsk_level: res.data.current_hsk_level }
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
    msg.value = t('profile.saveSuccess')
    msgType.value = 'success'
  } catch (e) {
    msg.value = e.response?.data?.message || t('profile.saveError')
    msgType.value = 'error'
  } finally {
    saving.value = false
    setTimeout(() => { msg.value = '' }, 3000)
  }
}
</script>

<style scoped>
.profile-view { max-width: 520px; margin: 0 auto; }
h2 { margin-bottom: 24px; }
.loading { color: #888; }
.profile-card { background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.info-row { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
.info-label { min-width: 120px; font-size: 0.88rem; color: #888; font-weight: 500; }
.info-value { font-size: 0.95rem; color: #333; }
.email { font-family: monospace; font-size: 0.9rem; }
.badge { padding: 3px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.badge.admin { background: #fff3e0; color: #e65100; }
.badge.user { background: #e8f5e9; color: #2e7d32; }
.divider { border: none; border-top: 1px solid #f0f0f0; margin: 20px 0; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.95rem; }
.form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; }
.hint { font-size: 0.78rem; color: #aaa; margin-top: 4px; }
.msg { padding: 9px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 0.9rem; }
.msg.success { background: #e8f5e9; color: #2e7d32; }
.msg.error { background: #ffebee; color: #c62828; }
.btn-save { padding: 11px 28px; background: #d32f2f; color: white; border: none; border-radius: 6px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
.btn-save:hover:not(:disabled) { background: #b71c1c; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
