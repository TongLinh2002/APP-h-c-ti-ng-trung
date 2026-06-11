import api from './api'
export async function startChallenge(hsk_level) {
  const res = await api.get('/challenge/start', { params: { hsk_level } })
  return res.data
}
export async function submitChallenge(hsk_level, answers) {
  const res = await api.post('/challenge/submit', { hsk_level, answers })
  return res.data
}
