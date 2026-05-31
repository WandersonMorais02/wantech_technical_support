import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ClipboardList,
  Clock,
  PackageCheck,
  ReceiptText,
  RefreshCcw,
} from 'lucide-react'

import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { getDashboardSummary } from '../services/dashboardService'

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function normalize(data) {
  return data?.data || data || {}
}

function getOrderId(order) {
  return order?.id || order?._id || ''
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('pt-BR')
}

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  })

  const summary = normalize(data)
  const latestServiceOrders = summary.latestServiceOrders || []

  const cards = [
    {
      label: 'Serviços abertos',
      value: summary.openOrders || 0,
      icon: ClipboardList,
    },
    {
      label: 'Aguardando aprovação',
      value: summary.waitingApproval || 0,
      icon: Clock,
    },
    {
      label: 'Prontas para entrega',
      value: summary.readyOrders || 0,
      icon: PackageCheck,
    },
    {
      label: 'Faturamento',
      value: formatCurrency(summary.revenue),
      icon: ReceiptText,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Visão geral
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Controle da assistência
          </h2>

          <p className="mt-2 text-slate-400">
            Acompanhe serviços, vendas, pagamentos e indicadores.
          </p>
        </div>

        <Button variant="secondary" onClick={() => refetch()}>
          <RefreshCcw size={18} />
          Atualizar
        </Button>
      </div>

      {isError && (
        <Card className="border border-red-400/20 bg-red-400/10 p-4">
          <p className="text-sm text-red-200">
            {error.message}
          </p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.label} className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">
                    {card.label}
                  </p>

                  <strong className="mt-2 block text-3xl text-white">
                    {isLoading ? '...' : card.value}
                  </strong>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <Icon size={22} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">
              Últimas ordens de serviço
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Serviços recentes cadastrados no sistema.
            </p>
          </div>

          <Link
            to="/admin/servicos"
            className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Ver todas
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {isLoading && (
            <p className="text-sm text-slate-500">
              Carregando últimas OS...
            </p>
          )}

          {!isLoading && latestServiceOrders.length === 0 && (
            <p className="text-sm text-slate-500">
              Nenhuma ordem de serviço encontrada.
            </p>
          )}

          {!isLoading &&
            latestServiceOrders.map((order) => {
              const orderId = getOrderId(order)

              return (
                <Link
                  key={orderId || order.protocol}
                  to={orderId ? `/admin/servicos/${orderId}` : '/admin/servicos'}
                  className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.03]"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <strong className="block text-white">
                        {order.protocol || orderId || 'OS'}
                      </strong>

                      <span className="text-sm text-slate-400">
                        {order.client?.name || '-'} •{' '}
                        {order.device?.brand || '-'} {order.device?.model || ''}
                      </span>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                        {order.status || '-'}
                      </span>

                      <p className="mt-2 text-xs text-slate-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
        </div>
      </Card>
    </div>
  )
}
