import { defineStore } from 'pinia'
import { fetchLessons, fetchLessonById, submitLesson } from '../services/lessonsService'

export const useLessonsStore = defineStore('lessons', {
  state: () => ({
    lessons: [],
    currentLesson: null,
    result: null,
  }),
  actions: {
    async loadLessons(hsk_level, type) {
      this.lessons = await fetchLessons(hsk_level, type)
    },
    async openLesson(id) {
      this.currentLesson = await fetchLessonById(id)
      this.result = null
    },
    async submitAnswers(answers) {
      this.result = await submitLesson(this.currentLesson.id, answers)
    },
    closeLesson() {
      this.currentLesson = null
      this.result = null
    },
  },
})
