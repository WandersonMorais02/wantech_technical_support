import { api } from './api'

export async function createCheckoutOrder(data) {
  const response = await api.post('/api/orders/checkout', data)
  return response.data
}

export async function getOrderById(id) {
  const response = await api.get(`/api/orders/${id}`)
  return response.data
}
