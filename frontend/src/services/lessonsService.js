import api from './api'

export async function fetchLessons(hsk_level, type) {
  const params = {}
  if (hsk_level) params.hsk_level = hsk_level
  if (type) params.type = type
  const res = await api.get('/lessons', { params })
  return res.data
}

export async function fetchLessonById(id) {
  const res = await api.get(`/lessons/${id}`)
  return res.data
}

export async function submitLesson(id, answers) {
  const res = await api.post(`/lessons/${id}/submit`, { answers })
  return res.data
}
