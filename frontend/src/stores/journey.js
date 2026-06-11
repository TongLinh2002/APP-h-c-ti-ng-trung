import { defineStore } from 'pinia'
import { fetchJourney } from '../services/journeyService'
export const useJourneyStore = defineStore('journey', {
  state: () => ({ stages: [], currentStage: 0 }),
  actions: {
    async load() {
      const data = await fetchJourney()
      this.stages = data.stages
      this.currentStage = data.currentStage
    },
  },
})
