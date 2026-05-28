import { api } from './api'

export async function listServiceOrders(params = {}) {
  const response = await api.get('/api/service-orders', {
    params,
  })

  return response.data
}

export async function createServiceOrder(data) {
  const response = await api.post('/api/service-orders', data)
  return response.data
}

export async function getServiceOrderById(id) {
  const response = await api.get(`/api/service-orders/${id}`)
  return response.data
}

export async function updateServiceOrder(id, data) {
  const response = await api.put(`/api/service-orders/${id}`, data)
  return response.data
}

export async function getServiceOrderByProtocol(protocol) {
  const response = await api.get(
    `/api/customer-portal/service-orders/${encodeURIComponent(protocol)}`,
  )

  return response.data
}

export async function approveServiceOrderBudget(protocol, data) {
  const response = await api.patch(
    `/api/customer-portal/service-orders/${encodeURIComponent(
      protocol,
    )}/approve-budget`,
    data,
  )

  return response.data
}

export async function deleteServiceOrder(id) {
  const response = await api.delete(`/api/service-orders/${id}`)
  return response.data
}


/* export async function getServiceOrderById(id) {
  const response = await api.get(`/api/service-orders/${id}`)
  return response.data
}*/

export function generateServiceOrderPdf(id) {
  return `${api.defaults.baseURL}/api/pdfs/service-orders/${id}`
}

export function generateReceiptPdf(id) {
  return `${api.defaults.baseURL}/api/pdfs/receipts/${id}`
}

export async function downloadServiceOrderPdf(id) {
  const response = await api.get(
    `/api/pdfs/service-orders/${id}`,
    {
      responseType: 'blob',
    },
  )

  const blob = new Blob([response.data], {
    type: 'application/pdf',
  })

  const url = window.URL.createObjectURL(blob)

  window.open(url, '_blank')
}

export async function downloadReceiptPdf(id) {
  const response = await api.get(
    `/api/pdfs/receipts/${id}`,
    {
      responseType: 'blob',
    },
  )

  const blob = new Blob([response.data], {
    type: 'application/pdf',
  })

  const url = window.URL.createObjectURL(blob)

  window.open(url, '_blank')
}
