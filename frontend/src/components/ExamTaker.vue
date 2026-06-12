<template>
  <div class="exam-taker">
    <!-- Header: title + timer -->
    <div class="exam-header">
      <h3>{{ exam.title }}</h3>
      <div class="timer" :class="{ warning: timeLeft <= 60 }">
        ⏱ {{ formattedTime }}
      </div>
    </div>

    <!-- Result screen -->
    <div v-if="result" class="result-screen">
      <p class="result-title">{{ $t('exam.result') }}</p>
      <p class="result-score">{{ $t('exam.score') }} <strong>{{ result.score }}/{{ result.max_score }}</strong></p>

      <div v-for="section in exam.sections" :key="section.id" class="result-section">
        <h4>{{ section.title }}</h4>
        <div v-for="q in section.questions" :key="q.id" class="result-row">
          <p class="rq-text">{{ q.question_text }}</p>
          <div class="rq-answers">
            <template v-if="findResult(q.id)">
              <span :class="findResult(q.id).correct ? 'ans-correct' : 'ans-wrong'">
                {{ findResult(q.id).correct ? '✓' : '✗' }}
                {{ $t('exam.yourAnswer') }}
                {{ displayAnswer(q, findResult(q.id).user_answer) }}
              </span>
              <span v-if="!findResult(q.id).correct" class="ans-correct-text">
                {{ $t('exam.correctAnswer') }}
                {{ displayAnswer(q, findResult(q.id).correct_answer) }}
              </span>
            </template>
            <span v-else class="ans-none">{{ $t('exam.noAnswer') }}</span>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn-secondary" @click="$emit('back')">{{ $t('exam.backToList') }}</button>
        <button class="btn-primary" @click="retry">{{ $t('exam.retry') }}</button>
      </div>
    </div>

    <!-- Exam content -->
    <div v-else>
      <div v-for="section in exam.sections" :key="section.id" class="exam-section">
        <h4 class="section-title">
          <span class="section-type-badge">{{ $t(`exam.types.${section.type}`) }}</span>
          {{ section.title }}
        </h4>

        <!-- Listening: 2-column — sticky audio left, questions right -->
        <div v-if="section.type === 'listening'" class="listening-layout">
          <div class="listening-audio-panel">
            <div class="listening-audio-card">
              <p class="listening-audio-heading">{{ $t('exam.listeningSection') }}</p>
              <audio
                v-if="section.audio_url"
                :src="section.audio_url"
                controls
                class="audio-player-main"
              />
              <p v-else class="listening-no-audio">{{ $t('exam.noAudio') }}</p>
              <p class="listening-tip">{{ $t('exam.questionCount', { n: section.questions.length }) }}</p>
            </div>
          </div>

          <div class="listening-questions">
            <div v-for="(q, qi) in section.questions" :key="q.id" class="question-block">
              <p class="q-text"><span class="q-num">{{ qi + 1 }}.</span> {{ q.question_text }}</p>
              <div v-if="q.options" class="options-list">
                <label v-for="(opt, i) in q.options" :key="i" class="option-label">
                  <input type="radio" :name="`q${q.id}`" :value="String(i)" v-model="answers[q.id]" />
                  <span>{{ ['A','B','C','D'][i] }}. {{ opt }}</span>
                </label>
              </div>
              <input v-else type="text" v-model="answers[q.id]" class="fill-input" :placeholder="$t('exam.fillPlaceholder')" />
            </div>
          </div>
        </div>

        <!-- Reading + Fill: passage (if any) then questions -->
        <template v-else>
          <div v-if="section.passage" class="passage-block">
            <pre class="passage-text">{{ section.passage }}</pre>
          </div>
          <div v-for="(q, qi) in section.questions" :key="q.id" class="question-block">
            <p v-if="q.question_text" class="q-text"><span class="q-num">{{ qi + 1 }}.</span> {{ q.question_text }}</p>
            <p v-else class="q-text q-num-only"><span class="q-num">{{ qi + 1 }}.</span></p>
            <div v-if="q.options" class="options-list">
              <label v-for="(opt, i) in q.options" :key="i" class="option-label">
                <input type="radio" :name="`q${q.id}`" :value="String(i)" v-model="answers[q.id]" />
                <span>{{ ['A','B','C','D'][i] }}. {{ opt }}</span>
              </label>
            </div>
            <!-- Essay question (fill, long prompt) -->
            <textarea
              v-else-if="section.type === 'fill' && q.question_text && q.question_text.length > 30"
              v-model="answers[q.id]"
              class="essay-input"
              rows="6"
              :placeholder="$t('exam.essayPlaceholder')"
            />
            <!-- Word-scramble or short fill -->
            <input v-else type="text" v-model="answers[q.id]" class="fill-input" :placeholder="$t('exam.fillPlaceholder')" />
          </div>
        </template>
      </div>

      <div class="submit-row">
        <button class="btn-submit" @click="handleSubmit" :disabled="submitting">
          {{ submitting ? $t('exam.submitting') : $t('exam.submit') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { submitExam } from '../services/examService'

const props = defineProps({ exam: Object })
const emit = defineEmits(['back'])
const { t } = useI18n()

const answers = ref({})
const result = ref(null)
const submitting = ref(false)
const timeLeft = ref(props.exam.time_limit_minutes * 60)
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timer)
      doSubmit()
    }
  }, 1000)
})
onUnmounted(() => clearInterval(timer))

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
  const s = (timeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

function handleSubmit() {
  if (!confirm(t('exam.confirmSubmit'))) return
  doSubmit()
}

async function doSubmit() {
  clearInterval(timer)
  submitting.value = true
  const timeTaken = props.exam.time_limit_minutes * 60 - timeLeft.value
  const answerList = Object.entries(answers.value).map(([question_id, answer]) => ({
    question_id: parseInt(question_id),
    answer,
  }))
  try {
    result.value = await submitExam(props.exam.id, answerList, timeTaken)
  } finally {
    submitting.value = false
  }
}

function retry() {
  result.value = null
  answers.value = {}
  timeLeft.value = props.exam.time_limit_minutes * 60
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) { clearInterval(timer); doSubmit() }
  }, 1000)
}

function findResult(questionId) {
  return result.value?.results?.find(r => r.question_id === questionId)
}

function displayAnswer(question, answer) {
  if (answer === null || answer === undefined || answer === '') return t('exam.noAnswer')
  if (question.options) {
    const idx = parseInt(answer)
    return `${['A','B','C','D'][idx]}. ${question.options[idx] || answer}`
  }
  return answer
}
</script>

<style scoped>
.exam-taker { max-width: 800px; margin: 0 auto; }
.exam-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 16px 20px; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 10; }
.exam-header h3 { font-size: 1.1rem; color: #333; }
.timer { font-size: 1.2rem; font-weight: 700; color: #1565c0; }
.timer.warning { color: #d32f2f; animation: pulse 1s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
.exam-section { background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
.section-title { font-size: 1rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.section-type-badge { background: #d32f2f; color: white; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; }
.audio-block { margin-bottom: 16px; }
.audio-player { width: 100%; }
.question-block { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.question-block:last-child { border-bottom: none; }
.q-text { margin-bottom: 10px; font-size: 0.95rem; line-height: 1.5; }
.q-num { color: #d32f2f; font-weight: 700; margin-right: 4px; }
.options-list { display: flex; flex-direction: column; gap: 8px; }
.option-label { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px 12px; border: 1px solid #eee; border-radius: 6px; transition: background 0.1s; }
.option-label:hover { background: #fff5f5; }
.option-label input { accent-color: #d32f2f; }
.fill-input { width: 100%; max-width: 340px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; }
.essay-input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; resize: vertical; font-family: inherit; line-height: 1.6; }
.q-num-only { color: #888; font-size: 0.9rem; }
.passage-block { background: #f9f9f9; border-left: 3px solid #1565c0; padding: 12px 16px; border-radius: 4px; margin-bottom: 16px; }
.passage-text { white-space: pre-wrap; font-family: inherit; line-height: 1.8; font-size: 1rem; }
.submit-row { text-align: center; padding: 24px 0; }
.btn-submit { padding: 14px 48px; background: #d32f2f; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 700; cursor: pointer; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.result-screen { background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.result-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 8px; }
.result-score { font-size: 1.8rem; font-weight: 700; color: #d32f2f; margin-bottom: 24px; }
.result-section { margin-bottom: 20px; }
.result-section h4 { font-size: 1rem; font-weight: 700; margin-bottom: 12px; color: #555; }
.result-row { padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.result-row:last-child { border-bottom: none; }
.rq-text { font-size: 0.9rem; color: #555; margin-bottom: 4px; }
.rq-answers { font-size: 0.9rem; display: flex; flex-direction: column; gap: 2px; }
.ans-correct { color: #2e7d32; font-weight: 600; }
.ans-wrong { color: #c62828; }
.ans-correct-text { color: #2e7d32; }
.ans-none { color: #aaa; }
.result-actions { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }
.btn-primary { padding: 12px 28px; background: #d32f2f; color: white; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
.btn-secondary { padding: 12px 28px; background: white; color: #d32f2f; border: 2px solid #d32f2f; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }

/* ── Listening section: 2-column layout ── */
.exam-taker { max-width: 960px; }
.listening-layout { display: grid; grid-template-columns: 260px 1fr; gap: 20px; align-items: start; }
.listening-audio-panel { position: sticky; top: 80px; }
.listening-audio-card { background: #e3f2fd; border: 2px solid #1565c0; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.listening-audio-heading { font-size: 1rem; font-weight: 700; color: #1565c0; margin: 0; }
.audio-player-main { width: 100%; border-radius: 4px; }
.listening-tip { font-size: 0.8rem; color: #1565c0; text-align: center; margin: 0; }
.listening-no-audio { font-size: 0.85rem; color: #888; text-align: center; padding: 12px 0; }
.listening-questions { min-width: 0; }
@media (max-width: 680px) {
  .listening-layout { grid-template-columns: 1fr; }
  .listening-audio-panel { position: static; }
}
</style>
