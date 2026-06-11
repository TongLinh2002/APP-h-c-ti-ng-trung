import api from './api'

export async function register(email, password, display_name) {
  const res = await api.post('/auth/register', { email, password, display_name })
  return res.data
}

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}
