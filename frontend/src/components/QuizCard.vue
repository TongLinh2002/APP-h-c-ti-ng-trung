<template>
  <div class="quiz-card">
    <p class="question">{{ question.question }}</p>
    <ul class="options">
      <li
        v-for="(opt, idx) in question.options"
        :key="idx"
        class="option"
        :class="optionClass(idx)"
        @click="!answered && select(idx)"
      >
        <span class="opt-label">{{ labels[idx] }}</span>
        {{ opt }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ question: Object, showResult: Boolean, correctAnswer: Number })
const emit = defineEmits(['answer'])
const labels = ['A', 'B', 'C', 'D']
const selected = ref(null)
const answered = ref(false)

function select(idx) {
  selected.value = idx
  answered.value = true
  emit('answer', { question_id: props.question.id, selected_answer: idx })
}

function optionClass(idx) {
  if (!props.showResult || selected.value === null) return selected.value === idx ? 'selected' : ''
  if (idx === props.correctAnswer) return 'correct'
  if (idx === selected.value) return 'wrong'
  return ''
}
</script>

<style scoped>
.quiz-card { background: white; border-radius: 10px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
.question { font-weight: 600; margin-bottom: 14px; }
.options { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.option { padding: 10px 14px; border: 2px solid #eee; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.15s; }
.option:hover { background: #fafafa; }
.option.selected { border-color: #1565c0; background: #e3f2fd; }
.option.correct { border-color: #2e7d32; background: #e8f5e9; }
.option.wrong { border-color: #c62828; background: #ffebee; }
.opt-label { font-weight: 700; color: #666; min-width: 20px; }
</style>
