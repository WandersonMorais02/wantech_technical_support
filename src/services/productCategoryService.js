import { api } from './api'

export async function listProductCategories() {
  const response = await api.get('/api/product-categories')
  return response.data
}
