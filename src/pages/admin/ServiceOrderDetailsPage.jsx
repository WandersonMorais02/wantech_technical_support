import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import {
  Download,
  FileText,
  Receipt,
  Smartphone,
  User,
  Wrench,
} from 'lucide-react'

import {
  // generateReceiptPdf,
  // generateServiceOrderPdf,
  getServiceOrderById,
  // downloadReceiptPdf,
  downloadServiceOrderPdf,
} from '../../services/serviceOrderService'

import { ServiceOrderAttachments } from './components/ServiceOrderAttachments'

function getEntityId(entity) {
  if (typeof entity?._id === 'string') return entity._id
  if (typeof entity?.id === 'string') return entity.id
  return ''
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <Icon size={20} />
        </div>

        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>
      </div>

      <div className="space-y-3 text-sm text-slate-300">
        {children}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <span className="text-slate-500">{label}: </span>
      <span className="text-white">{value || '-'}</span>
    </div>
  )
}

export function ServiceOrderDetailsPage() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['service-order-details', id],
    queryFn: () => getServiceOrderById(id),
    enabled: Boolean(id),
  })

  const order = data?.data || data
  const orderId = getEntityId(order)

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">
        Ordem de serviço não encontrada.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Ordem de serviço
          </span>

          <h1 className="mt-4 text-3xl font-black text-white">
            {order.protocol}
          </h1>

          <p className="mt-2 text-slate-400">
            Status atual: {order.status}
          </p>
        </div>

        {orderId && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadServiceOrderPdf(orderId)}
              className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
            >
              <FileText size={18} />
              PDF da OS
            </button>

            <button
              type="button"
              disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-500"
            >
              <Receipt size={18} />
              Recibo indisponível
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCard icon={User} title="Cliente">
          <InfoRow label="Nome" value={order.client?.name} />
          <InfoRow label="Telefone" value={order.client?.phone} />
          <InfoRow label="E-mail" value={order.client?.email} />
          <InfoRow label="CPF" value={order.client?.cpf} />
        </InfoCard>

        <InfoCard icon={Smartphone} title="Equipamento">
          <InfoRow label="Tipo" value={order.device?.deviceType?.name} />
          <InfoRow label="Marca" value={order.device?.brand} />
          <InfoRow label="Modelo" value={order.device?.model} />
          <InfoRow label="IMEI" value={order.device?.imei} />
          <InfoRow label="Cor" value={order.device?.color} />
        </InfoCard>

        <InfoCard icon={Wrench} title="Diagnóstico">
          <InfoRow label="Problema relatado" value={order.device?.reportedIssue} />
          <InfoRow label="Condição física" value={order.device?.physicalCondition} />
          <InfoRow label="Diagnóstico técnico" value={order.diagnosis} />
          <InfoRow label="Relatório técnico" value={order.technicalReport} />
        </InfoCard>

        <InfoCard icon={Download} title="Financeiro">
          <InfoRow
            label="Orçamento"
            value={
              order.estimatedBudget
                ? `R$ ${Number(order.estimatedBudget).toFixed(2)}`
                : '-'
            }
          />

          <InfoRow
            label="Valor final"
            value={
              order.finalPrice
                ? `R$ ${Number(order.finalPrice).toFixed(2)}`
                : '-'
            }
          />

          <InfoRow
            label="Aprovado pelo cliente"
            value={order.approvedByClient ? 'Sim' : 'Não'}
          />
        </InfoCard>
      </div>

      {orderId && (
        <ServiceOrderAttachments serviceOrderId={orderId} />
      )}
    </div>
  )
}
