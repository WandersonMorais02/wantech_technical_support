import { api } from './api'

export async function listDeviceTypes() {
  const response = await api.get('/api/device-types')
  return response.data
}
