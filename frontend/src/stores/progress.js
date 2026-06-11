import { defineStore } from 'pinia'
import { fetchProgress } from '../services/progressService'

export const useProgressStore = defineStore('progress', {
  state: () => ({
    totalLearned: 0,
    byLevel: [],
    streak: 0,
    weeklyActivity: [],
  }),
  actions: {
    async load() {
      const data = await fetchProgress()
      this.totalLearned = data.totalLearned
      this.byLevel = data.byLevel
      this.streak = data.streak
      this.weeklyActivity = data.weeklyActivity
    },
  },
})
