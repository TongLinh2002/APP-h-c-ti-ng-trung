import api from './api'

export async function listExams(type, hsk_level) {
  const res = await api.get('/exams', { params: { type, hsk_level } })
  return res.data
}

export async function getExam(id) {
  const res = await api.get(`/exams/${id}`)
  return res.data
}

export async function submitExam(id, answers, time_taken_seconds) {
  const res = await api.post(`/exams/${id}/submit`, { answers, time_taken_seconds })
  return res.data
}

export async function adminListExams() {
  const res = await api.get('/admin/exams')
  return res.data
}

export async function adminCreateExam(data) {
  const res = await api.post('/admin/exams', data)
  return res.data
}

export async function adminDeleteExam(id) {
  await api.delete(`/admin/exams/${id}`)
}

export async function adminCreateSection(examId, formData) {
  const res = await api.post(`/admin/exams/${examId}/sections`, formData)
  return res.data
}

export async function adminDeleteSection(sid) {
  await api.delete(`/admin/exams/sections/${sid}`)
}

export async function adminCreateQuestion(sid, data) {
  const res = await api.post(`/admin/exams/sections/${sid}/questions`, data)
  return res.data
}

export async function adminDeleteQuestion(qid) {
  await api.delete(`/admin/exams/questions/${qid}`)
}

export async function adminParsePdf(formData) {
  const res = await api.post('/admin/exams/parse-pdf', formData)
  return res.data
}

export async function adminBulkImport(data) {
  const res = await api.post('/admin/exams/bulk-import', data)
  return res.data
}
