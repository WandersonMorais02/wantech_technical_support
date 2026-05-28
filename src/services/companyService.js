import { api } from './api'

export async function getCompany() {
  const response = await api.get('/api/company')
  return response.data
}
