import api from './api'

export async function fetchDownloads(hsk_level) {
  const params = hsk_level ? { hsk_level } : {}
  const res = await api.get('/downloads', { params })
  return res.data
}
