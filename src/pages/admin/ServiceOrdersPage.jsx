import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit2, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react'

import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { Table } from '../../components/table/Table'
import { TableCell } from '../../components/table/TableCell'
import { TableHead } from '../../components/table/TableHead'
import { TableRow } from '../../components/table/TableRow'

import {
  deleteServiceOrder,
  listServiceOrders,
} from '../../services/serviceOrderService'

import { CreateServiceOrderModal } from './components/CreateServiceOrderModal'
import { EditServiceOrderModal } from './components/EditServiceOrderModal'

function normalizeOrders(data) {
  return data?.data || data?.items || data?.results || data || []
}

function getOrderId(order) {
  if (typeof order?._id === 'string') return order._id
  if (typeof order?.id === 'string') return order.id

  return ''
}

function getStatusColor(status = '') {
  const normalized = String(status).toLowerCase()

  if (normalized.includes('approval') || normalized.includes('aprovação')) {
    return 'bg-amber-400/10 text-amber-300'
  }

  if (
    normalized.includes('delivered') ||
    normalized.includes('finalizado') ||
    normalized.includes('entregue')
  ) {
    return 'bg-emerald-400/10 text-emerald-300'
  }

  if (normalized.includes('cancel')) {
    return 'bg-red-400/10 text-red-300'
  }

  return 'bg-cyan-400/10 text-cyan-300'
}

export function ServiceOrdersPage() {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['service-orders'],
    queryFn: () =>
      listServiceOrders({
        limit: 50,
      }),
  })

  const orders = useMemo(() => normalizeOrders(data), [data])

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders

    const value = search.toLowerCase()

    return orders.filter((order) => {
      const protocol = order.protocol?.toLowerCase() || ''
      const customer = order.client?.name?.toLowerCase() || ''
      const device = `${order.device?.brand || ''} ${order.device?.model || ''}`.toLowerCase()

      return (
        protocol.includes(value) ||
        customer.includes(value) ||
        device.includes(value)
      )
    })
  }, [orders, search])

  const deleteMutation = useMutation({
    mutationFn: deleteServiceOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] })
    },
  })

  function handleEdit(order) {
    setSelectedOrder(order)
    setIsEditModalOpen(true)
  }

  function handleDelete(order) {
    const id = getOrderId(order)

    if (!id) {
      window.alert('Não foi possível identificar esta ordem de serviço.')
      return
    }

    const confirmed = window.confirm(
      `Deseja realmente remover a OS ${order.protocol || id}?`,
    )

    if (confirmed) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Serviços
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Ordens de serviço
          </h2>

          <p className="mt-2 text-slate-400">
            Gerencie diagnósticos, reparos e acompanhamentos técnicos.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => refetch()}>
            <RefreshCcw size={18} />
            Atualizar
          </Button>

          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} />
            Nova OS
          </Button>
        </div>
      </div>

      <Card className="mt-8 p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <Input
            placeholder="Buscar por protocolo, cliente ou aparelho..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-11"
          />
        </div>
      </Card>

      {isLoading && (
        <Card className="mt-6 p-8 text-center">
          <p className="text-slate-400">
            Carregando ordens de serviço...
          </p>
        </Card>
      )}

      {isError && (
        <Card className="mt-6 border border-red-400/20 bg-red-400/10 p-6">
          <p className="text-red-200">
            {error.message}
          </p>
        </Card>
      )}

      {!isLoading && !isError && (
        <div className="mt-6">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell head>Protocolo</TableCell>
                <TableCell head>Cliente</TableCell>
                <TableCell head>Aparelho</TableCell>
                <TableCell head>Status</TableCell>
                <TableCell head>Orçamento</TableCell>
                <TableCell head>Criado em</TableCell>
                <TableCell head>Ações</TableCell>
              </TableRow>
            </TableHead>

            <tbody>
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-slate-500"
                  >
                    Nenhuma ordem de serviço encontrada.
                  </TableCell>
                </TableRow>
              )}

              {filteredOrders.map((order, index) => {
                const orderId = getOrderId(order)

                return (
                  <TableRow key={orderId || `${order.protocol}-${index}`}>
                    <TableCell>
                      {orderId ? (
                        <Link
                          to={`/admin/servicos/${orderId}`}
                          className="font-semibold text-cyan-300 hover:text-cyan-200"
                        >
                          {order.protocol || orderId}
                        </Link>
                      ) : (
                        <strong className="block text-white">
                          {order.protocol || '-'}
                        </strong>
                      )}

                      {orderId && (
                        <span className="mt-1 block text-xs text-slate-500">
                          {orderId}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {order.client?.name || '-'}
                    </TableCell>

                    <TableCell>
                      <div>
                        <strong className="block text-white">
                          {order.device?.brand || '-'}
                        </strong>

                        <span className="text-xs text-slate-500">
                          {order.device?.model || '-'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {order.status || 'Em andamento'}
                      </span>
                    </TableCell>

                    <TableCell>
                      {order.estimatedBudget
                        ? Number(order.estimatedBudget).toLocaleString(
                            'pt-BR',
                            {
                              style: 'currency',
                              currency: 'BRL',
                            },
                          )
                        : '-'}
                    </TableCell>

                    <TableCell>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            'pt-BR',
                          )
                        : '-'}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(order)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-cyan-400/20 hover:text-cyan-300"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(order)}
                          disabled={deleteMutation.isPending}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-400/10 text-red-300 hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </tbody>
          </Table>
        </div>
      )}

      <CreateServiceOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditServiceOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        serviceOrder={selectedOrder}
      />
    </div>
  )
}
