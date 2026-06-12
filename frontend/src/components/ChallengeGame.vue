<template>
  <div class="challenge-game">
    <div class="challenge-header">
      <span class="q-count">Câu {{ currentIndex + 1 }}/{{ total }}</span>
      <span class="timer" :class="{ warning: timeLeft <= 5 }">⏱ {{ timeLeft }}s</span>
    </div>
    <div class="question-card">
      <p class="hanzi-big">{{ question.hanzi }}</p>
      <p class="pinyin-sm">{{ question.pinyin }}</p>
    </div>
    <ul class="answer-grid">
      <li
        v-for="(opt, idx) in question.options"
        :key="idx"
        class="answer-option"
        :class="{
          correct: showFeedback && idx === question.correct_index,
          wrong:   showFeedback && idx === chosen && idx !== question.correct_index,
          disabled: answered,
        }"
        @click="!answered && pick(idx)"
      >{{ opt }}</li>
    </ul>
    <div v-if="showFeedback" class="next-btn-row">
      <button class="btn-next" @click="advance()">
        {{ currentIndex + 1 < total ? 'Câu tiếp →' : 'Xem kết quả' }}
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onUnmounted } from 'vue'
const props = defineProps({ question: Object, currentIndex: Number, total: Number })
const emit = defineEmits(['answer'])
const chosen = ref(null)
const answered = ref(false)
const showFeedback = ref(false)
const timeLeft = ref(15)
let timer = null

watch(() => props.question, () => {
  chosen.value = null
  answered.value = false
  showFeedback.value = false
  timeLeft.value = 15
  startTimer()
}, { immediate: true })
onUnmounted(() => clearInterval(timer))

function startTimer() {
  clearInterval(timer)
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) { clearInterval(timer); if (!answered.value) autoSubmit() }
  }, 1000)
}
function pick(idx) {
  clearInterval(timer)
  chosen.value = idx
  answered.value = true
  showFeedback.value = true
}
function autoSubmit() {
  answered.value = true
  showFeedback.value = true
  chosen.value = -1
}
function advance() {
  emit('answer', {
    selected_index: chosen.value,
    time_ms: chosen.value === -1 ? 15000 : (15 - timeLeft.value) * 1000,
  })
}
</script>
<style scoped>
.challenge-header { display: flex; justify-content: space-between; margin-bottom: 16px; font-weight: 600; }
.timer { color: #d32f2f; }
.timer.warning { animation: pulse 0.5s infinite; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
.question-card { background: white; border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
.hanzi-big { font-size: 3.5rem; margin-bottom: 8px; }
.pinyin-sm { color: #e65100; font-size: 1.1rem; }
.answer-grid { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.answer-option { padding: 14px; background: white; border: 2px solid #eee; border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.15s; }
.answer-option:hover:not(.disabled) { border-color: #d32f2f; background: #fff5f5; }
.answer-option.correct  { border-color: #388e3c; background: #e8f5e9; color: #1b5e20; font-weight: 600; }
.answer-option.wrong    { border-color: #d32f2f; background: #ffebee; color: #b71c1c; }
.answer-option.disabled { cursor: default; }
.next-btn-row { margin-top: 16px; text-align: center; }
.btn-next { padding: 12px 36px; background: #1565c0; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-next:hover { background: #0d47a1; }
</style>
