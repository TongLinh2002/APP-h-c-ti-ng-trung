import { defineStore } from 'pinia'
import { startChallenge, submitChallenge } from '../services/challengeService'
export const useChallengeStore = defineStore('challenge', {
  state: () => ({ questions: [], hsk_level: null, result: null, currentIndex: 0, answers: [] }),
  getters: {
    currentQuestion: (state) => state.questions[state.currentIndex] || null,
    isFinished: (state) => state.questions.length > 0 && state.currentIndex >= state.questions.length,
  },
  actions: {
    async start(hsk_level) {
      const data = await startChallenge(hsk_level)
      this.questions = data.questions
      this.hsk_level = hsk_level
      this.currentIndex = 0
      this.answers = []
      this.result = null
    },
    recordAnswer(selected_index, time_ms) {
      const q = this.currentQuestion
      this.answers.push({ question_id: q.id, selected_index, correct_index: q.correct_index, time_ms })
      this.currentIndex++
    },
    async submit() {
      this.result = await submitChallenge(this.hsk_level, this.answers)
    },
    reset() { this.$reset() },
  },
})
