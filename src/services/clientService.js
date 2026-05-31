import { api } from './api'

export async function listClients(params = {}) {
  const response = await api.get('/api/clients', {
    params,
  })

  return response.data
}

export async function getClientById(id) {
  const response = await api.get(`/api/clients/${id}`)
  return response.data
}

export async function createClient(data) {
  const response = await api.post('/api/clients', data)
  return response.data
}

export async function updateClient(id, data) {
  const response = await api.put(`/api/clients/${id}`, data)
  return response.data
}

export async function deleteClient(id) {
  const response = await api.delete(`/api/clients/${id}`)
  return response.data
}
