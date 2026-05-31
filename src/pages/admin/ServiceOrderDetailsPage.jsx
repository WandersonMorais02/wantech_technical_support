import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Download,
  FileText,
  ImageIcon,
  Package,
  Save,
  Trash2,
  User,
} from 'lucide-react'

import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import {
  deleteServiceOrder,
  getServiceOrderById,
  updateServiceOrder,
} from '../../services/serviceOrderService'
import { downloadServiceOrderPdf } from '../../services/pdfService'
import { getMediaUrl } from '../../utils/media'

const statusOptions = [
  { value: 'RECEIVED', label: 'Recebido' },
  { value: 'IN_DIAGNOSIS', label: 'Em diagnóstico' },
  { value: 'WAITING_APPROVAL', label: 'Aguardando aprovação' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'IN_REPAIR', label: 'Em reparo' },
  { value: 'READY', label: 'Pronto' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

function normalize(data) {
  return data?.data || data || null
}

function getEntityId(entity) {
  if (typeof entity?._id === 'string') return entity._id
  if (typeof entity?.id === 'string') return entity.id
  if (typeof entity === 'string') return entity
  return ''
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('pt-BR')
}

function buildInitialForm(order) {
  return {
    status: order?.status || 'RECEIVED',
    estimatedBudget: order?.estimatedBudget ?? '',
    finalPrice: order?.finalPrice ?? '',
    diagnosis: order?.diagnosis || '',
    technicalReport: order?.technicalReport || '',
    observations: order?.observations || '',
  }
}

export function ServiceOrderDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['service-order', id],
    queryFn: () => getServiceOrderById(id),
    enabled: Boolean(id),
  })

  const serviceOrder = useMemo(() => normalize(data), [data])
  const [form, setForm] = useState(buildInitialForm(serviceOrder))

  useMemo(() => {
    if (serviceOrder && !isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-render
      setForm(buildInitialForm(serviceOrder))
    }
  }, [serviceOrder, isEditing])

  function updateField(field, value) {
    setIsEditing(true)

    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      updateServiceOrder(id, {
        status: form.status,
        estimatedBudget:
          form.estimatedBudget === '' ? undefined : Number(form.estimatedBudget),
        finalPrice: form.finalPrice === '' ? undefined : Number(form.finalPrice),
        diagnosis: form.diagnosis?.trim() || undefined,
        technicalReport: form.technicalReport?.trim() || undefined,
        observations: form.observations?.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] })
      queryClient.invalidateQueries({ queryKey: ['service-order', id] })
      setIsEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteServiceOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] })
      navigate('/admin/servicos')
    },
  })

  function handleSubmit(event) {
    event.preventDefault()
    updateMutation.mutate()
  }

  function handleDelete() {
    const confirmed = window.confirm('Deseja realmente remover esta OS?')

    if (confirmed) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-400">Carregando OS...</p>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="border border-red-400/20 bg-red-400/10 p-6">
        <p className="text-red-200">{error.message}</p>
      </Card>
    )
  }

  if (!serviceOrder) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-400">OS não encontrada.</p>
      </Card>
    )
  }

  const client = serviceOrder.client || {}
  const device = serviceOrder.device || {}
  const attachments = serviceOrder.attachments || []

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            to="/admin/servicos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
          >
            <ArrowLeft size={18} />
            Voltar
          </Link>

          <h2 className="mt-3 text-3xl font-black">
            {serviceOrder.protocol || 'Ordem de serviço'}
          </h2>

          <p className="mt-2 text-slate-400">
            Criada em {formatDate(serviceOrder.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => downloadServiceOrderPdf(id)}
          >
            <Download size={18} />
            PDF da OS
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={18} />
            Remover
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <User className="text-cyan-300" />
              <h3 className="text-xl font-bold text-white">Cliente</h3>
            </div>

            <div className="space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Nome:</span> {client.name || '-'}</p>
              <p><span className="text-slate-500">Telefone:</span> {client.phone || '-'}</p>
              <p><span className="text-slate-500">E-mail:</span> {client.email || '-'}</p>
              <p><span className="text-slate-500">CPF:</span> {client.cpf || '-'}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <Package className="text-cyan-300" />
              <h3 className="text-xl font-bold text-white">Equipamento</h3>
            </div>

            <div className="space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Tipo:</span> {device.deviceType?.name || '-'}</p>
              <p><span className="text-slate-500">Marca:</span> {device.brand || '-'}</p>
              <p><span className="text-slate-500">Modelo:</span> {device.model || '-'}</p>
              <p><span className="text-slate-500">Série:</span> {device.serialNumber || '-'}</p>
              <p><span className="text-slate-500">IMEI:</span> {device.imei || '-'}</p>
              <p><span className="text-slate-500">Cor:</span> {device.color || '-'}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-white">Valores</h3>

            <div className="mt-4 space-y-2 text-sm">
              <p className="flex justify-between text-slate-400">
                Orçamento
                <strong className="text-white">
                  {formatCurrency(serviceOrder.estimatedBudget)}
                </strong>
              </p>

              <p className="flex justify-between text-slate-400">
                Valor final
                <strong className="text-white">
                  {formatCurrency(serviceOrder.finalPrice)}
                </strong>
              </p>
            </div>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white">Atualização da OS</h3>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none"
              >
                {statusOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <Input
                type="number"
                placeholder="Orçamento"
                value={form.estimatedBudget}
                onChange={(event) =>
                  updateField('estimatedBudget', event.target.value)
                }
              />

              <Input
                type="number"
                placeholder="Valor final"
                value={form.finalPrice}
                onChange={(event) => updateField('finalPrice', event.target.value)}
              />
            </div>

            <textarea
              placeholder="Diagnóstico..."
              value={form.diagnosis}
              onChange={(event) => updateField('diagnosis', event.target.value)}
              className="mt-5 min-h-[120px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
            />

            <textarea
              placeholder="Relatório técnico..."
              value={form.technicalReport}
              onChange={(event) =>
                updateField('technicalReport', event.target.value)
              }
              className="mt-5 min-h-[120px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
            />

            <textarea
              placeholder="Observações..."
              value={form.observations}
              onChange={(event) => updateField('observations', event.target.value)}
              className="mt-5 min-h-[120px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-white">Anexos</h3>

            {attachments.length === 0 && (
              <p className="mt-4 text-sm text-slate-500">
                Nenhum anexo cadastrado nesta OS.
              </p>
            )}

            {attachments.length > 0 && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {attachments.map((attachment) => {
                  const url = getMediaUrl(attachment)
                  const isImage = attachment.category === 'image'

                  return (
                    <a
                      key={getEntityId(attachment)}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-cyan-400/40"
                    >
                      {isImage && url ? (
                        <img
                          src={url}
                          alt={attachment.originalName || 'Anexo'}
                          className="h-36 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-36 items-center justify-center rounded-xl bg-slate-950/70 text-cyan-300">
                          <FileText size={32} />
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                        {isImage ? <ImageIcon size={16} /> : <FileText size={16} />}
                        <span className="truncate">
                          {attachment.originalName || attachment.filename || 'Arquivo'}
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </Card>

          {updateMutation.isError && (
            <Card className="border border-red-400/20 bg-red-400/10 p-4">
              <p className="text-sm text-red-200">
                {updateMutation.error.message}
              </p>
            </Card>
          )}

          {updateMutation.isSuccess && (
            <Card className="border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-sm text-emerald-200">
                OS atualizada com sucesso.
              </p>
            </Card>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              <Save size={18} />
              {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
