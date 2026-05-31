import { api } from './api'

function getFilenameFromHeaders(headers, fallback) {
  const disposition = headers?.['content-disposition']

  if (!disposition) {
    return fallback
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/)

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const normalMatch = disposition.match(/filename="?([^"]+)"?/)

  return normalMatch?.[1] || fallback
}

async function downloadPdf(path, fallbackFilename) {
  const response = await api.get(path, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data], {
    type: 'application/pdf',
  })

  const url = window.URL.createObjectURL(blob)
  const filename = getFilenameFromHeaders(response.headers, fallbackFilename)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(url)
}

export function downloadServiceOrderPdf(id) {
  return downloadPdf(
    `/api/pdfs/service-orders/${id}`,
    `ordem-servico-${id}.pdf`,
  )
}

export function downloadReceiptPdf(id) {
  return downloadPdf(`/api/pdfs/receipts/${id}`, `recibo-${id}.pdf`)
}
