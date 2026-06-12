import { defineStore } from 'pinia'
import api from '../services/api'

export const useVocabularyStore = defineStore('vocabulary', {
  state: () => ({
    reviewCards: [],
    currentIndex: 0,
    sessionDone: false,
    selectedLevel: null,
    levelStats: {},
    statsLoading: false,
  }),
  getters: {
    currentCard: (state) => state.reviewCards[state.currentIndex] || null,
    totalCards: (state) => state.reviewCards.length,
  },
  actions: {
    async loadLevelStats() {
      this.statsLoading = true
      try {
        const res = await api.get('/vocabulary/level-stats')
        this.levelStats = res.data
      } finally {
        this.statsLoading = false
      }
    },
    async loadReviewCards(hsk_level = null) {
      const params = hsk_level ? { hsk_level } : {}
      const res = await api.get('/vocabulary/review', { params })
      this.reviewCards = res.data
      this.currentIndex = 0
      this.sessionDone = false
    },
    async rateCard(rating) {
      const card = this.currentCard
      if (!card) return
      const vocabId = card.VocabularyId || card.vocabulary_id || card.Vocabulary?.id
      await api.post(`/vocabulary/review/${vocabId}`, { rating })
      if (this.currentIndex < this.reviewCards.length - 1) {
        this.currentIndex++
      } else {
        this.sessionDone = true
      }
    },
  },
})
