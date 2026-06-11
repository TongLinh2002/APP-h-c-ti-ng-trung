<template>
  <div class="lang-switcher" ref="switcherRef">
    <button class="globe-btn" @click="toggleOpen">
      {{ currentLabel }} ▾
    </button>
    <div v-if="open" class="lang-dropdown">
      <button
        v-for="lang in langs"
        :key="lang.code"
        class="lang-option"
        :class="{ active: locale === lang.code }"
        @click="selectLang(lang.code)"
      >
        {{ lang.name }}
        <span v-if="locale === lang.code" class="check">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const open = ref(false)
const switcherRef = ref(null)

const langs = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'vi', name: 'Tiếng Việt' },
]

const currentLabel = computed(() => {
  const found = langs.find(l => l.code === locale.value)
  return found ? found.name : 'Language'
})

function toggleOpen() {
  open.value = !open.value
}

function selectLang(code) {
  locale.value = code
  localStorage.setItem('locale', code)
  open.value = false
}

function handleClickOutside(e) {
  if (switcherRef.value && !switcherRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.lang-switcher { position: relative; }
.globe-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 6px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.globe-btn:hover { background: rgba(255,255,255,0.35); }
.lang-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  overflow: hidden;
  z-index: 100;
  min-width: 160px;
}
.lang-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  text-align: left;
  border-bottom: 1px solid #f5e8ec;
}
.lang-option:last-child { border-bottom: none; }
.lang-option:hover { background: #fff0f5; }
.lang-option.active { background: #fff0f5; font-weight: 700; color: #d32f2f; }
.check { margin-left: auto; color: #d32f2f; }
</style>