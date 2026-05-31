import { api } from './api'

export async function listChatRooms() {
  const response = await api.get('/api/internal-chat')
  return response.data
}

export async function createChatRoom(data) {
  const response = await api.post('/api/internal-chat', data)
  return response.data
}

export async function getChatRoomById(id) {
  const response = await api.get(`/api/internal-chat/${id}`)
  return response.data
}

export async function listChatMessages(roomId) {
  const response = await api.get(`/api/internal-chat/${roomId}/messages`)
  return response.data
}

export async function sendChatMessage(data) {
  const response = await api.post('/api/internal-chat/messages', data)
  return response.data
}

export async function markChatMessageAsRead(id) {
  const response = await api.patch(`/api/internal-chat/messages/${id}/read`)
  return response.data
}
