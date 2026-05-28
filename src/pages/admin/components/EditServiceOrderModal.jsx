import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { Modal } from '../../../components/Modal'
import { updateServiceOrder } from '../../../services/serviceOrderService'

function buildInitialForm(serviceOrder) {
  return {
    status: serviceOrder?.status || '',
    estimatedBudget: serviceOrder?.estimatedBudget || '',
    diagnosis: serviceOrder?.diagnosis || '',
    technicalReport: serviceOrder?.technicalReport || '',
    observations: serviceOrder?.observations || '',
  }
}

export function EditServiceOrderModal({ isOpen, onClose, serviceOrder }) {
  if (!serviceOrder) return null

  return (
    <EditServiceOrderForm
      key={serviceOrder._id || serviceOrder.id}
      isOpen={isOpen}
      onClose={onClose}
      serviceOrder={serviceOrder}
    />
  )
}

function EditServiceOrderForm({ isOpen, onClose, serviceOrder }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(() => buildInitialForm(serviceOrder))

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      updateServiceOrder(serviceOrder._id || serviceOrder.id, {
        status: form.status || undefined,
        estimatedBudget: form.estimatedBudget
          ? Number(form.estimatedBudget)
          : undefined,
        diagnosis: form.diagnosis || undefined,
        technicalReport: form.technicalReport || undefined,
        // observations: form.observations || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] })
      onClose()
    },
  })

  function handleSubmit(event) {
    event.preventDefault()
    updateMutation.mutate()
  }

  return (
    <Modal
      title="Editar ordem de serviço"
      description={serviceOrder?.protocol || 'Atualize os dados da OS.'}
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <select
          value={form.status}
          onChange={(event) => updateField('status', event.target.value)}
          className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
        >
          <option value="">Status</option>
          <option value="RECEIVED">Recebido</option>
          <option value="IN_DIAGNOSIS">Em diagnóstico</option>
          <option value="WAITING_APPROVAL">Aguardando aprovação</option>
          <option value="APPROVED">Aprovado</option>
          <option value="IN_REPAIR">Em reparo</option>
          <option value="READY">Pronto</option>
          <option value="DELIVERED">Entregue</option>
          <option value="CANCELLED">Cancelado</option>
        </select>

        <Input
          type="number"
          placeholder="Orçamento estimado"
          value={form.estimatedBudget}
          onChange={(event) =>
            updateField('estimatedBudget', event.target.value)
          }
        />

        <textarea
          placeholder="Diagnóstico..."
          value={form.diagnosis}
          onChange={(event) => updateField('diagnosis', event.target.value)}
          className="min-h-[120px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
        />

        <textarea
          placeholder="Relatório técnico..."
          value={form.technicalReport}
          onChange={(event) =>
            updateField('technicalReport', event.target.value)
          }
          className="min-h-[120px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
        />

        {/* <textarea
          placeholder="Observações..."
          value={form.observations}
          onChange={(event) => updateField('observations', event.target.value)}
          className="min-h-[120px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
        /> */}

        {updateMutation.isError && (
          <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
            {updateMutation.error.message}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
