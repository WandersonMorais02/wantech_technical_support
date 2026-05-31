import { api } from './api'

export async function listBotIntents() {
  const response = await api.get('/api/bot/intents')
  return response.data
}

export async function saveBotIntent(data) {
  const response = await api.post('/api/bot/intents', data)
  return response.data
}

export async function listBotTokens() {
  const response = await api.get('/api/bot/tokens')
  return response.data
}

export async function saveBotToken(data) {
  const response = await api.post('/api/bot/tokens', data)
  return response.data
}

export async function listBotAnswers() {
  const response = await api.get('/api/bot/answers')
  return response.data
}

export async function saveBotAnswer(data) {
  const response = await api.post('/api/bot/answers', data)
  return response.data
}

export async function listBotRelations() {
  const response = await api.get('/api/bot/relations')
  return response.data
}

export async function validateBotRelation(id, data = {}) {
  const response = await api.patch(`/api/bot/relations/${id}/validate`, data)
  return response.data
}

export async function rejectBotRelation(id) {
  const response = await api.patch(`/api/bot/relations/${id}/reject`)
  return response.data
}

export async function listBotTrainings() {
  const response = await api.get('/api/bot/trainings')
  return response.data
}

export async function approveBotTraining(id, data = {}) {
  const response = await api.patch(`/api/bot/trainings/${id}/approve`, data)
  return response.data
}
