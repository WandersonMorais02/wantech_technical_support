import { api } from './api'

export async function createCheckoutOrder(data) {
  const response = await api.post('/api/orders/checkout', data)
  return response.data
}

export async function listOrders(params = {}) {
  const response = await api.get('/api/orders', {
    params,
  })

  return response.data
}

export async function getOrderById(id) {
  const response = await api.get(`/api/orders/${id}`)
  return response.data
}

export async function updateOrderStatus(id, data) {
  const response = await api.patch(`/api/orders/${id}/status`, data)
  return response.data
}

export async function cancelOrder(id) {
  const response = await api.patch(`/api/orders/${id}/cancel`)
  return response.data
}
