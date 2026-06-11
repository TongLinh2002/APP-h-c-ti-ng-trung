import axios from 'axios'

export async function register(email, password, display_name) {
  const res = await axios.post('http://localhost:3000/api/auth/register', { email, password, display_name })
  return res.data
}

export async function login(email, password) {
  const res = await axios.post('http://localhost:3000/api/auth/login', { email, password })
  return res.data
}
