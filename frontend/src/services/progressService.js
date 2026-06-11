import api from './api'
export async function fetchProgress() {
  const res = await api.get('/progress')
  return res.data
}
export async function fetchJourney() {
  const res = await api.get('/progress/journey')
  return res.data
}
