import { api } from './api'

export async function getCompany() {
  const response = await api.get('/api/company')
  return response.data
}

export async function updateCompany(data) {
  const response = await api.put('/api/company', data)
  return response.data
}
