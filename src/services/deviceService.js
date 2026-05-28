import { api } from './api'

export async function createDevice(data) {
  const response = await api.post('/api/devices', data)
  return response.data
}
