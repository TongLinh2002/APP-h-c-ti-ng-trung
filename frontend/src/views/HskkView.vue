<template>
  <div class="exam-view">
    <h2>📋 {{ $t('exam.hskkTitle') }}</h2>

    <div v-if="!activeExam">
      <div class="filter-bar">
        <label>{{ $t('exam.filterLevel') }}
          <select v-model="selectedLevel" @change="load">
            <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
          </select>
        </label>
      </div>
      <div v-if="loading" class="empty">{{ $t('exam.loading') }}</div>
      <div v-else-if="!exams.length" class="empty">{{ $t('exam.empty') }}</div>
      <ul v-else class="exam-list">
        <li v-for="exam in exams" :key="exam.id" class="exam-card">
          <div class="exam-info">
            <span class="exam-title">{{ exam.title }}</span>
            <span class="exam-meta">{{ exam.time_limit_minutes }} {{ $t('exam.minutes') }}</span>
          </div>
          <button class="btn-start" @click="open(exam.id)">{{ $t('exam.start') }}</button>
        </li>
      </ul>
    </div>

    <div v-else>
      <button class="btn-back" @click="activeExam = null">← {{ $t('exam.backToList') }}</button>
      <ExamTaker :exam="activeExam" @back="activeExam = null" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ExamTaker from '../components/ExamTaker.vue'
import { listExams, getExam } from '../services/examService'

const selectedLevel = ref(1)
const exams = ref([])
const loading = ref(false)
const activeExam = ref(null)

onMounted(load)

async function load() {
  loading.value = true
  exams.value = await listExams('hskk', selectedLevel.value)
  loading.value = false
}

async function open(id) {
  activeExam.value = await getExam(id)
}
</script>

<style scoped>
h2 { margin-bottom: 20px; }
.filter-bar { margin-bottom: 16px; }
.filter-bar select { margin-left: 8px; padding: 6px 10px; border-radius: 6px; border: 1px solid #ddd; }
.exam-list { list-style: none; }
.exam-card { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.exam-info { display: flex; flex-direction: column; gap: 4px; }
.exam-title { font-weight: 600; font-size: 1rem; }
.exam-meta { font-size: 0.85rem; color: #888; }
.btn-start { padding: 10px 24px; background: #d32f2f; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-back { background: none; border: none; color: #d32f2f; cursor: pointer; margin-bottom: 16px; font-size: 0.95rem; }
.empty { color: #888; padding: 20px 0; }
</style>
