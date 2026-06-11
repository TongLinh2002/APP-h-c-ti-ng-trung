import api from './api'
export async function fetchJourney() {
  const res = await api.get('/progress/journey')
  return res.data
}
