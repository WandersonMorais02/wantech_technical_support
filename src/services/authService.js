import { api } from './api'

export async function login(credentials) {
  const response = await api.post('/api/auth/login', credentials)
  return response.data
}
