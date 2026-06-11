import { defineStore } from 'pinia'
import { fetchReviewCards, submitReview } from '../services/vocabularyService'

export const useVocabularyStore = defineStore('vocabulary', {
  state: () => ({
    reviewCards: [],
    currentIndex: 0,
    sessionDone: false,
  }),
  getters: {
    currentCard: (state) => state.reviewCards[state.currentIndex] || null,
    totalCards: (state) => state.reviewCards.length,
  },
  actions: {
    async loadReviewCards() {
      this.reviewCards = await fetchReviewCards()
      this.currentIndex = 0
      this.sessionDone = false
    },
    async rateCard(rating) {
      const card = this.currentCard
      if (!card) return
      const vocabId = card.VocabularyId || card.vocabulary_id || card.Vocabulary?.id
      await submitReview(vocabId, rating)
      if (this.currentIndex < this.reviewCards.length - 1) {
        this.currentIndex++
      } else {
        this.sessionDone = true
      }
    },
  },
})
