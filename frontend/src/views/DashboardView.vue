<template>
  <div class="dashboard">
    <h2>📊 Tiến độ học</h2>

    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-else>
      <div class="stats-row">
        <div class="stat-card">
          <p class="stat-num">{{ store.totalLearned }}</p>
          <p class="stat-label">Từ đã học</p>
        </div>
        <div class="stat-card fire">
          <p class="stat-num">{{ store.streak }} 🔥</p>
          <p class="stat-label">Ngày liên tiếp</p>
        </div>
      </div>

      <h3>Tiến độ theo cấp HSK</h3>
      <div v-for="n in 9" :key="n" class="level-row">
        <span class="level-label">HSK {{ n }}</span>
        <ProgressBar :percent="getLevelPercent(n)" />
        <span class="level-count">{{ getLevelCount(n) }}/{{ hskTotals[n] }}</span>
      </div>

      <h3>Hoạt động 7 ngày qua</h3>
      <div class="weekly-chart">
        <div v-for="day in last7Days" :key="day.date" class="day-col">
          <div class="day-bar-wrap">
            <div class="day-bar" :style="{ height: Math.max(4, day.count * 12) + 'px' }"></div>
          </div>
          <span class="day-label">{{ day.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import ProgressBar from '../components/ProgressBar.vue'
import { useProgressStore } from '../stores/progress'

const store = useProgressStore()
const loading = ref(true)
const hskTotals = { 1: 150, 2: 300, 3: 600, 4: 1200, 5: 2500, 6: 5000, 7: 8000, 8: 11000, 9: 15000 }

onMounted(async () => { await store.load(); loading.value = false })

function getLevelCount(level) {
  const found = store.byLevel.find((b) => b['Vocabulary.hsk_level'] === level || b['Vocabulary.hsk_level'] === String(level))
  return found ? parseInt(found.count) : 0
}
function getLevelPercent(level) {
  return Math.min(100, Math.round((getLevelCount(level) / hskTotals[level]) * 100))
}

const last7Days = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const found = store.weeklyActivity.find((a) => a.day === dateStr)
    days.push({ date: dateStr, label: d.toLocaleDateString('vi', { weekday: 'short' }), count: found ? parseInt(found.count) : 0 })
  }
  return days
})
</script>

<style scoped>
h2, h3 { margin-bottom: 16px; }
h3 { margin-top: 28px; }
.loading { color: #888; }
.stats-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.stat-card { background: white; padding: 20px 28px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; min-width: 140px; }
.stat-num { font-size: 2.2rem; font-weight: 700; color: #d32f2f; }
.stat-label { color: #666; font-size: 0.9rem; margin-top: 4px; }
.level-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.level-label { min-width: 56px; font-weight: 600; font-size: 0.9rem; }
.level-count { font-size: 0.8rem; color: #888; min-width: 72px; text-align: right; }
.weekly-chart { display: flex; gap: 8px; align-items: flex-end; height: 100px; padding-top: 8px; }
.day-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
.day-bar-wrap { display: flex; align-items: flex-end; height: 72px; }
.day-bar { width: 28px; background: #d32f2f; border-radius: 4px 4px 0 0; min-height: 4px; }
.day-label { font-size: 0.7rem; color: #888; }
</style>
