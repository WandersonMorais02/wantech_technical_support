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
