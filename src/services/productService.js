import { api } from './api'

export async function listProducts(params = {}) {
  const response = await api.get('/api/products', {
    params,
  })

  return response.data
}

export async function getProductById(id) {
  const response = await api.get(`/api/products/${id}`)
  return response.data
}

export async function getProductBySlug(slug) {
  const response = await api.get(`/api/products/slug/${slug}`)
  return response.data
}

export async function createProduct(data) {
  const response = await api.post('/api/products', data)
  return response.data
}

export async function updateProduct(id, data) {
  const response = await api.put(`/api/products/${id}`, data)
  return response.data
}

export async function deleteProduct(id) {
  const response = await api.delete(`/api/products/${id}`)
  return response.data
}
