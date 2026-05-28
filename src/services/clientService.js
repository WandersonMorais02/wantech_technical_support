import { api } from './api'

export async function createClient(data) {
  const response = await api.post('/api/clients', data)
  return response.data
}
