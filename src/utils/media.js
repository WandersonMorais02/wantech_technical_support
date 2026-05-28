export function getMediaUrl(file) {
  const rawUrl =
    file?.url ||
    file?.path ||
    file?.fileUrl ||
    file?.secureUrl ||
    file?.filePath ||
    file?.storagePath ||
    file?.relativePath ||
    file?.key ||
    file?.filename ||
    ''

  if (!rawUrl) return ''

  const baseUrl = new URL(import.meta.env.VITE_API_URL)

  if (rawUrl.startsWith('http')) {
    const url = new URL(rawUrl)
    url.protocol = baseUrl.protocol
    url.host = baseUrl.host
    return url.toString()
  }

  const normalizedPath = rawUrl.startsWith('uploads/')
    ? `/${rawUrl}`
    : rawUrl

  return `${baseUrl.origin}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`
}
