import { api } from './api'

export async function uploadAttachment({ file, context, relatedTo }) {
  const formData = new FormData()

  formData.append('file', file)
  formData.append('context', context)

  if (relatedTo) {
    formData.append('relatedTo', relatedTo)
  }

  const response = await api.post('/api/attachments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function listAttachments(params = {}) {
  const response = await api.get('/api/attachments', {
    params,
  })

  return response.data
}

export async function deleteAttachment(id) {
  const response = await api.delete(`/api/attachments/${id}`)
  return response.data
}
