import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, ImageIcon, Trash2, UploadCloud } from 'lucide-react'
import {
  deleteAttachment,
  listAttachments,
  uploadAttachment,
} from '../../../services/attachmentService'

function normalizeList(data) {
  return data?.data || data?.items || data?.results || data || []
}

function getEntityId(entity) {
  if (typeof entity?._id === 'string') return entity._id
  if (typeof entity?.id === 'string') return entity.id
  return ''
}

export function ServiceOrderAttachments({ serviceOrderId }) {
  const queryClient = useQueryClient()
  const [uploadError, setUploadError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['attachments', serviceOrderId],
    queryFn: () =>
      listAttachments({
        relatedTo: serviceOrderId,
        context: 'SERVICE_ORDER_ATTACHMENT',
        limit: 50,
      }),
    enabled: Boolean(serviceOrderId),
  })

  const attachments = useMemo(() => normalizeList(data), [data])

function getAttachmentUrl(attachment) {
  const rawUrl =
    attachment.url ||
    attachment.path ||
    attachment.fileUrl ||
    attachment.secureUrl ||
    attachment.filePath ||
    attachment.storagePath ||
    attachment.relativePath ||
    attachment.key ||
    attachment.filename ||
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

  const uploadMutation = useMutation({
    mutationFn: (file) =>
      uploadAttachment({
        file,
        context: 'SERVICE_ORDER_ATTACHMENT',
        relatedTo: serviceOrderId,
      }),
    onSuccess: () => {
      setUploadError('')
      queryClient.invalidateQueries({
        queryKey: ['attachments', serviceOrderId],
      })
    },
    onError: (error) => {
      setUploadError(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attachments', serviceOrderId],
      })
    },
  })

  function handleUpload(event) {
    const files = Array.from(event.target.files || [])

    files.forEach((file) => {
      uploadMutation.mutate(file)
    })

    event.target.value = ''
  }

  function handleDelete(attachment) {
    const id = getEntityId(attachment)

    if (!id) return

    const confirmed = window.confirm('Remover este anexo?')

    if (confirmed) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Anexos da OS
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Fotos do aparelho, documentos, assinatura e comprovantes.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
          <UploadCloud size={18} />
          Enviar anexo

          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      {uploadMutation.isPending && (
        <p className="mt-4 text-sm text-cyan-300">
          Enviando anexo...
        </p>
      )}

      {uploadError && (
        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
          {uploadError}
        </p>
      )}

      {isLoading && (
        <p className="mt-5 text-sm text-slate-400">
          Carregando anexos...
        </p>
      )}

      {!isLoading && attachments.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
          Nenhum anexo enviado para esta OS.
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {attachments.map((attachment) => {
            const id = getEntityId(attachment)
            const url = getAttachmentUrl(attachment)
            const isImage =
              attachment.category === 'image' ||
              attachment.mimeType?.startsWith?.('image/') ||
              attachment.type?.startsWith?.('image/')

            return (
              <div
                key={id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70"
              >
                {isImage && url ? (
                  <a href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt={attachment.originalName || attachment.filename || 'Anexo'}
                      className="h-40 w-full object-cover"
                    />
                  </a>
                ) : (
                  <a
                    href={url || '#'}
                    target={url ? '_blank' : undefined}
                    rel="noreferrer"
                    className="flex h-40 flex-col items-center justify-center bg-white/5 text-slate-400"
                  >
                    {isImage ? (
                      <ImageIcon className="mb-2 text-cyan-300" />
                    ) : (
                      <FileText className="mb-2 text-cyan-300" />
                    )}
                    Documento
                  </a>
                )}

                <div className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {attachment.originalName ||
                        attachment.filename ||
                        attachment.name ||
                        'Anexo'}
                    </p>

                    <p className="text-xs text-slate-500">
                      {attachment.category || attachment.mimeType || 'arquivo'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(attachment)}
                    disabled={deleteMutation.isPending}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-red-300 hover:bg-red-400/20 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
