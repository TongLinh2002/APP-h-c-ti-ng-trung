<template>
  <div class="exam-view">
    <h2>📋 {{ $t('exam.hskTitle') }}</h2>

    <div v-if="!activeExam">
      <div v-if="loading" class="empty">{{ $t('exam.loading') }}</div>
      <div v-else-if="!exams.length" class="empty">{{ $t('exam.empty') }}</div>

      <div v-else>
        <div v-for="level in presentLevels" :key="level" class="level-group">
          <div class="level-heading">
            <span class="level-badge">HSK {{ level }}</span>
            <span class="level-count">{{ $t('exam.examsCount', { n: byLevel(level).length }) }}</span>
          </div>
          <ul class="exam-list">
            <li v-for="exam in byLevel(level)" :key="exam.id" class="exam-card">
              <div class="exam-info">
                <span class="exam-title">{{ exam.title }}</span>
                <span class="exam-meta">⏱ {{ exam.time_limit_minutes }} {{ $t('exam.minutes') }}</span>
              </div>
              <button class="btn-start" @click="open(exam.id)">{{ $t('exam.start') }}</button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else>
      <button class="btn-back" @click="activeExam = null">← {{ $t('exam.backToList') }}</button>
      <ExamTaker :exam="activeExam" @back="activeExam = null" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ExamTaker from '../components/ExamTaker.vue'
import { listExams, getExam } from '../services/examService'

const exams = ref([])
const loading = ref(false)
const activeExam = ref(null)

const presentLevels = computed(() =>
  [...new Set(exams.value.map(e => e.hsk_level))].sort((a, b) => a - b)
)

function byLevel(level) {
  return exams.value.filter(e => e.hsk_level === level)
}

onMounted(async () => {
  loading.value = true
  exams.value = await listExams('hsk')
  loading.value = false
})

async function open(id) {
  activeExam.value = await getExam(id)
}
</script>

<style scoped>
h2 { margin-bottom: 20px; }
.empty { color: #888; padding: 40px 0; text-align: center; }

.level-group { margin-bottom: 28px; }
.level-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.level-badge { background: #d32f2f; color: white; font-size: 0.9rem; font-weight: 700; padding: 4px 14px; border-radius: 20px; }
.level-count { font-size: 0.82rem; color: #888; }

.exam-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.exam-card { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); transition: box-shadow 0.15s; }
.exam-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,0.12); }
.exam-info { display: flex; flex-direction: column; gap: 4px; }
.exam-title { font-weight: 600; font-size: 1rem; }
.exam-meta { font-size: 0.82rem; color: #888; }
.btn-start { padding: 10px 24px; background: #d32f2f; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-start:hover { background: #b71c1c; }
.btn-back { background: none; border: none; color: #d32f2f; cursor: pointer; margin-bottom: 16px; font-size: 0.95rem; }
</style>
