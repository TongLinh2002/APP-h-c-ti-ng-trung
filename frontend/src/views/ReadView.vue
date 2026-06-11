<template>
  <div class="read-view">
    <h2>📖 {{ $t('read.title') }}</h2>

    <div v-if="!store.currentLesson">
      <div class="filter-bar">
        <label>{{ $t('read.hskLevel') }}
          <select v-model="selectedLevel" @change="loadLessons">
            <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
          </select>
        </label>
      </div>
      <div v-if="loading" class="loading">{{ $t('read.loading') }}</div>
      <div v-else-if="!store.lessons.length" class="empty">{{ $t('read.empty') }}</div>
      <ul v-else class="lesson-list">
        <li v-for="lesson in store.lessons" :key="lesson.id" class="lesson-item" @click="openLesson(lesson.id)">
          <span class="lesson-icon">📖</span>
          <span>{{ lesson.title }}</span>
        </li>
      </ul>
    </div>

    <div v-else>
      <button class="btn-back" @click="store.closeLesson">{{ $t('read.back') }}</button>
      <h3>{{ store.currentLesson.title }}</h3>

      <div class="reading-content">
        <span
          v-for="(seg, idx) in parsedContent"
          :key="idx"
        >
          <span
            v-if="seg.isVocab"
            class="vocab-word"
            @click="toggleTooltip(idx)"
          >{{ seg.text }}<span v-if="activeTooltip === idx" class="tooltip">{{ seg.meaning }}</span></span>
          <span v-else>{{ seg.text }}</span>
        </span>
      </div>

      <div v-if="!store.result">
        <h4>{{ $t('read.questions') }}</h4>
        <QuizCard
          v-for="q in store.currentLesson.questions"
          :key="q.id"
          :question="q"
          :show-result="false"
          @answer="recordAnswer"
        />
        <button class="btn-primary" @click="submit">{{ $t('read.submit') }}</button>
      </div>

      <div v-else class="result-box">
        <p class="score">{{ $t('read.score') }} <strong>{{ store.result.score }}/100</strong></p>
        <QuizCard
          v-for="(q, i) in store.currentLesson.questions"
          :key="q.id"
          :question="q"
          :show-result="true"
          :correct-answer="store.result.results[i]?.correct_answer"
        />
        <button class="btn-primary" @click="store.closeLesson">{{ $t('read.chooseAnother') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import QuizCard from '../components/QuizCard.vue'
import { useLessonsStore } from '../stores/lessons'

const { t: $t } = useI18n()

const store = useLessonsStore()
const selectedLevel = ref(1)
const loading = ref(false)
const answers = ref([])
const activeTooltip = ref(null)

// Parse [[hanzi|nghĩa]] syntax from content
const parsedContent = computed(() => {
  if (!store.currentLesson?.content) return []
  return store.currentLesson.content.split(/(\[\[.*?\]\])/g).map((part) => {
    const m = part.match(/\[\[(.*?)\|(.*?)\]\]/)
    if (m) return { text: m[1], meaning: m[2], isVocab: true }
    return { text: part, isVocab: false }
  })
})

onMounted(() => loadLessons())

async function loadLessons() {
  loading.value = true
  await store.loadLessons(selectedLevel.value, 'reading')
  loading.value = false
}

async function openLesson(id) {
  answers.value = []
  activeTooltip.value = null
  await store.openLesson(id)
}

function toggleTooltip(idx) {
  activeTooltip.value = activeTooltip.value === idx ? null : idx
}

function recordAnswer(answer) {
  const idx = answers.value.findIndex((a) => a.question_id === answer.question_id)
  if (idx >= 0) answers.value[idx] = answer
  else answers.value.push(answer)
}

async function submit() {
  await store.submitAnswers(answers.value)
}
</script>

<style scoped>
h2 { margin-bottom: 20px; }
.filter-bar { margin-bottom: 16px; }
.filter-bar select { margin-left: 8px; padding: 6px 10px; border-radius: 6px; border: 1px solid #ddd; }
.lesson-list { list-style: none; }
.lesson-item { padding: 14px 16px; background: white; border-radius: 8px; margin-bottom: 8px; cursor: pointer; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.lesson-item:hover { background: #fafafa; }
.btn-back { background: none; border: none; color: #d32f2f; cursor: pointer; margin-bottom: 12px; font-size: 0.95rem; }
.reading-content { background: white; border-radius: 10px; padding: 20px; line-height: 2.2; font-size: 1.15rem; margin: 16px 0; box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
.vocab-word { color: #d32f2f; font-weight: 600; cursor: pointer; position: relative; border-bottom: 2px dotted #d32f2f; }
.tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; white-space: nowrap; z-index: 10; margin-bottom: 4px; }
.btn-primary { padding: 12px 28px; background: #d32f2f; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; margin-top: 12px; }
.result-box { margin-top: 16px; }
.score { font-size: 1.3rem; margin-bottom: 16px; }
.empty, .loading { color: #888; padding: 20px 0; }
</style>
