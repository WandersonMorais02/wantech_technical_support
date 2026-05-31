import { api } from './api'

export async function startPublicChat(data) {
  const response = await api.post('/api/public-chat/start', data)
  return response.data
}

export async function listPublicChatMessages(token) {
  const response = await api.get(`/api/public-chat/${token}/messages`)
  return response.data
}

export async function sendPublicChatMessage(token, data) {
  const response = await api.post(`/api/public-chat/${token}/messages`, data)
  return response.data
}
