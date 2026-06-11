import axios from 'axios'
export async function fetchDownloads(hsk_level) {
  const params = hsk_level ? { hsk_level } : {}
  const res = await axios.get('http://localhost:3000/api/downloads', { params })
  return res.data
}
