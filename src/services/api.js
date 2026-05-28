import axios from 'axios'
import { authStorage } from '../utils/authStorage'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = authStorage.getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStorage.clear()
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Erro ao comunicar com o servidor.'

    return Promise.reject(new Error(message))
  },
)
