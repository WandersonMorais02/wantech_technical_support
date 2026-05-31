/* eslint-disable no-unused-vars */
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle,
  FileText,
  ImageIcon,
  Search,
  Trash2,
  UploadCloud,
  UserPlus,
  X,
} from 'lucide-react'

import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { Modal } from '../../../components/Modal'
import { createClient, listClients } from '../../../services/clientService'
import { createDevice } from '../../../services/deviceService'
import { listDeviceTypes } from '../../../services/deviceTypeService'
import { createServiceOrder } from '../../../services/serviceOrderService'
import { uploadAttachment } from '../../../services/attachmentService'

const initialForm = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerCpf: '',

  deviceType: '',
  brand: '',
  model: '',
  serialNumber: '',
  imei: '',
  color: '',
  accessories: '',
  reportedIssue: '',
  physicalCondition: '',

  technician: '',
  estimatedBudget: '',
  diagnosis: '',
  technicalReport: '',
  observations: '',
}

function normalizeList(data) {
  return data?.data || data?.items || data?.results || data || []
}

function getEntityId(entity) {
  return entity?._id || entity?.id
}

function onlyNumbers(value = '') {
  return String(value).replace(/\D/g, '')
}

function buildOrderObservations(form) {
  return [
    form.accessories?.trim() &&
      `Acessórios recebidos: ${form.accessories.trim()}`,
    form.physicalCondition?.trim() &&
      `Estado físico: ${form.physicalCondition.trim()}`,
    form.observations?.trim() &&
      `Observações gerais: ${form.observations.trim()}`,
  ]
    .filter(Boolean)
    .join('\n\n')
}

function fillClientForm(client) {
  return {
    customerName: client?.name || '',
    customerPhone: client?.phone || '',
    customerEmail: client?.email || '',
    customerCpf: client?.cpf || '',
  }
}

export function CreateServiceOrderModal({ isOpen, onClose }) {
  const queryClient = useQueryClient()

  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState([])
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)

  const { data: deviceTypesData } = useQuery({
    queryKey: ['device-types'],
    queryFn: listDeviceTypes,
    enabled: isOpen,
  })

  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients-search', clientSearch],
    queryFn: () =>
      listClients({
        limit: 8,
        search: clientSearch.trim(),
      }),
    enabled: isOpen && clientSearch.trim().length >= 2 && !selectedClient,
  })

  const deviceTypes = useMemo(
    () => normalizeList(deviceTypesData),
    [deviceTypesData],
  )

  const clients = useMemo(() => normalizeList(clientsData), [clientsData])

  function updateField(field, value) {
    if (
      selectedClient &&
      ['customerName', 'customerPhone', 'customerEmail', 'customerCpf'].includes(
        field,
      )
    ) {
      setSelectedClient(null)
    }

    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleSelectClient(client) {
    setSelectedClient(client)
    setClientSearch('')

    setForm((current) => ({
      ...current,
      ...fillClientForm(client),
    }))
  }

  function handleClearSelectedClient() {
    setSelectedClient(null)
  }

  function resetForm() {
    files.forEach((item) => {
      if (item.preview) URL.revokeObjectURL(item.preview)
    })

    setForm(initialForm)
    setFiles([])
    setClientSearch('')
    setSelectedClient(null)
  }

  function handleFiles(event) {
    const selectedFiles = Array.from(event.target.files || [])

    const mappedFiles = selectedFiles.map((file) => ({
      file,
      preview: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null,
      type: file.type,
    }))

    setFiles((current) => [...current, ...mappedFiles])
    event.target.value = ''
  }

  function removeFile(index) {
    setFiles((current) => {
      const fileToRemove = current[index]

      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }

      return current.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      let clientId = getEntityId(selectedClient)

      if (!clientId) {
        const clientResponse = await createClient({
          name: form.customerName.trim(),
          phone: form.customerPhone.trim(),
          email: form.customerEmail.trim() || undefined,
          cpf: form.customerCpf.trim() || undefined,
        })

        const createdClient = clientResponse?.data || clientResponse
        clientId = getEntityId(createdClient)
      }

      if (!clientId) {
        throw new Error('Não foi possível identificar o cliente.')
      }

      const deviceResponse = await createDevice({
        client: clientId,
        deviceType: form.deviceType,
        brand: form.brand.trim(),
        model: form.model.trim(),
        serialNumber: form.serialNumber.trim() || undefined,
        imei: form.imei.trim() || undefined,
        color: form.color.trim() || undefined,
        accessories: form.accessories.trim() || undefined,
        reportedIssue: form.reportedIssue.trim() || undefined,
        physicalCondition: form.physicalCondition.trim() || undefined,
      })

      const createdDevice = deviceResponse?.data || deviceResponse
      const deviceId = getEntityId(createdDevice)

      if (!deviceId) {
        throw new Error('Não foi possível identificar o equipamento criado.')
      }

      const orderObservations = buildOrderObservations(form)

      const orderResponse = await createServiceOrder({
        client: clientId,
        device: deviceId,
        estimatedBudget: form.estimatedBudget
          ? Number(form.estimatedBudget)
          : undefined,
        diagnosis:
          form.diagnosis.trim() || form.reportedIssue.trim() || undefined,
        technicalReport: form.technicalReport.trim() || undefined,
        observations: orderObservations || undefined,
      })

      const createdOrder = orderResponse?.data || orderResponse
      const orderId = getEntityId(createdOrder)

      if (!orderId) {
        throw new Error('Não foi possível identificar a OS criada.')
      }

      if (files.length > 0) {
        await Promise.all(
          files.map((item) =>
            uploadAttachment({
              file: item.file,
              context: 'SERVICE_ORDER_ATTACHMENT',
              relatedTo: orderId,
            }),
          ),
        )
      }

      return createdOrder
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      resetForm()
      onClose()
    },
  })

  function handleClose() {
    if (!createMutation.isPending) {
      resetForm()
      onClose()
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (createMutation.isPending) return

    createMutation.mutate()
  }

    return (
    <Modal
      title="Nova ordem de serviço"
      description="Selecione um cliente existente ou cadastre um novo junto com o equipamento."
      isOpen={isOpen}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <section>
          <h3 className="mb-4 text-lg font-bold text-white">Cliente</h3>

          {selectedClient ? (
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-cyan-200">
                    <CheckCircle size={18} />
                    <strong>Cliente selecionado</strong>
                  </div>

                  <p className="mt-2 font-bold text-white">
                    {selectedClient.name}
                  </p>

                  <p className="text-sm text-slate-300">
                    {selectedClient.phone || '-'} •{' '}
                    {selectedClient.email || 'sem e-mail'} • CPF:{' '}
                    {selectedClient.cpf || '-'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearSelectedClient}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition hover:bg-red-400/20 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <Input
                  placeholder="Buscar cliente existente por nome, telefone, e-mail ou CPF..."
                  value={clientSearch}
                  onChange={(event) => setClientSearch(event.target.value)}
                  className="pl-11"
                />
              </div>

              {clientSearch.trim().length >= 2 && (
                <div className="mt-3 rounded-3xl border border-white/10 bg-slate-950/70 p-3">
                  {isLoadingClients && (
                    <p className="p-3 text-sm text-slate-500">
                      Buscando clientes...
                    </p>
                  )}

                  {!isLoadingClients && clients.length === 0 && (
                    <div className="flex items-center gap-2 p-3 text-sm text-slate-500">
                      <UserPlus size={16} />
                      Nenhum cliente encontrado. Preencha os dados abaixo para
                      criar um novo.
                    </div>
                  )}

                  {!isLoadingClients &&
                    clients.map((client) => (
                      <button
                        key={getEntityId(client)}
                        type="button"
                        onClick={() => handleSelectClient(client)}
                        className="block w-full rounded-2xl p-3 text-left transition hover:bg-white/5"
                      >
                        <strong className="block text-white">
                          {client.name}
                        </strong>

                        <span className="text-sm text-slate-400">
                          {client.phone || '-'} •{' '}
                          {client.email || 'sem e-mail'} • CPF:{' '}
                          {client.cpf || '-'}
                        </span>
                      </button>
                    ))}
                </div>
              )}

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Input
                  placeholder="Nome do cliente"
                  value={form.customerName}
                  onChange={(event) =>
                    updateField('customerName', event.target.value)
                  }
                  required
                />

                <Input
                  placeholder="Telefone / WhatsApp"
                  value={form.customerPhone}
                  onChange={(event) =>
                    updateField('customerPhone', event.target.value)
                  }
                  required
                />

                <Input
                  type="email"
                  placeholder="E-mail"
                  value={form.customerEmail}
                  onChange={(event) =>
                    updateField('customerEmail', event.target.value)
                  }
                />

                <Input
                  placeholder="CPF"
                  value={form.customerCpf}
                  onChange={(event) =>
                    updateField('customerCpf', event.target.value)
                  }
                />
              </div>
            </>
          )}
        </section>

        <section>
          <h3 className="mb-4 text-lg font-bold text-white">
            Dados do equipamento
          </h3>

          <div className="grid gap-5 md:grid-cols-2">
            <select
              value={form.deviceType}
              onChange={(event) => updateField('deviceType', event.target.value)}
              required
              className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
            >
              <option value="">Tipo de equipamento</option>

              {deviceTypes.map((type) => (
                <option key={getEntityId(type)} value={getEntityId(type)}>
                  {type.name}
                </option>
              ))}
            </select>

            <Input
              placeholder="Marca"
              value={form.brand}
              onChange={(event) => updateField('brand', event.target.value)}
              required
            />

            <Input
              placeholder="Modelo"
              value={form.model}
              onChange={(event) => updateField('model', event.target.value)}
              required
            />

            <Input
              placeholder="Cor"
              value={form.color}
              onChange={(event) => updateField('color', event.target.value)}
            />

            <Input
              placeholder="Número de série"
              value={form.serialNumber}
              onChange={(event) =>
                updateField('serialNumber', event.target.value)
              }
            />

            <Input
              placeholder="IMEI"
              value={form.imei}
              onChange={(event) => updateField('imei', event.target.value)}
            />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <textarea
              placeholder="Acessórios recebidos..."
              value={form.accessories}
              onChange={(event) =>
                updateField('accessories', event.target.value)
              }
              className="min-h-[110px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
            />

            <textarea
              placeholder="Estado físico..."
              value={form.physicalCondition}
              onChange={(event) =>
                updateField('physicalCondition', event.target.value)
              }
              className="min-h-[110px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
            />
          </div>

          <textarea
            placeholder="Problema relatado pelo cliente..."
            value={form.reportedIssue}
            onChange={(event) =>
              updateField('reportedIssue', event.target.value)
            }
            className="mt-5 min-h-[110px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
          />
        </section>

        <section>
          <h3 className="mb-4 text-lg font-bold text-white">
            Atendimento técnico
          </h3>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              placeholder="Técnico responsável"
              value={form.technician}
              onChange={(event) =>
                updateField('technician', event.target.value)
              }
            />

            <Input
              type="number"
              placeholder="Orçamento estimado"
              value={form.estimatedBudget}
              onChange={(event) =>
                updateField('estimatedBudget', event.target.value)
              }
            />
          </div>

          <textarea
            placeholder="Diagnóstico inicial..."
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
            placeholder="Observações gerais..."
            value={form.observations}
            onChange={(event) =>
              updateField('observations', event.target.value)
            }
            className="mt-5 min-h-[120px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
          />
        </section>

        <section>
          <h3 className="mb-4 text-lg font-bold text-white">Anexos da OS</h3>

          <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.03]">
            <UploadCloud size={36} className="text-cyan-300" />

            <span className="mt-4 font-semibold text-white">
              Clique para anexar fotos, documentos ou assinatura
            </span>

            <span className="mt-2 text-sm text-slate-500">
              Imagens, PDF, DOC ou DOCX
            </span>

            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFiles}
            />
          </label>

          {files.length > 0 && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {files.map((item, index) => (
                <div
                  key={`${item.file.name}-${index}`}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-3"
                >
                  {item.preview ? (
                    <div className="relative">
                      <img
                        src={item.preview}
                        alt={item.file.name}
                        className="h-36 w-full rounded-xl object-cover"
                      />

                      <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
                        <ImageIcon size={14} className="mr-1 inline" />
                        Imagem
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-36 flex-col items-center justify-center rounded-xl bg-white/5 text-sm text-slate-400">
                      <FileText className="mb-2 text-cyan-300" />
                      Documento
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-red-300 transition hover:bg-red-400/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {createMutation.isError && (
          <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
            {createMutation.error.message}
          </p>
        )}

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Criando OS...' : 'Criar OS'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
