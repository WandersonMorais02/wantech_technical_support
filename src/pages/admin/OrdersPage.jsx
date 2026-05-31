import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Ban,
  Eye,
  PackageCheck,
  RefreshCcw,
  Search,
  ShoppingBag,
} from 'lucide-react'

import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { Table } from '../../components/table/Table'
import { TableCell } from '../../components/table/TableCell'
import { TableHead } from '../../components/table/TableHead'
import { TableRow } from '../../components/table/TableRow'

import {
  cancelOrder,
  listOrders,
  updateOrderStatus,
} from '../../services/orderService'

function normalizeList(data) {
  return data?.data || data?.items || data?.results || data || []
}

function getEntityId(entity) {
  if (typeof entity?._id === 'string') return entity._id
  if (typeof entity?.id === 'string') return entity.id
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
  return new Date(value).toLocaleDateString('pt-BR')
}

const orderStatusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'PAID', label: 'Pago' },
  { value: 'PROCESSING', label: 'Preparando' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELED', label: 'Cancelado' },
]

const paymentStatusOptions = [
  { value: '', label: 'Todos pagamentos' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'PAID', label: 'Pago' },
  { value: 'FAILED', label: 'Falhou' },
  { value: 'REFUNDED', label: 'Reembolsado' },
  { value: 'CANCELED', label: 'Cancelado' },
]

const statusLabels = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  PAID: 'Pago',
  PROCESSING: 'Preparando',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
}

const paymentLabels = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  FAILED: 'Falhou',
  REFUNDED: 'Reembolsado',
  CANCELED: 'Cancelado',
}

function StatusBadge({ value, type = 'order' }) {
  const labels = type === 'payment' ? paymentLabels : statusLabels
  const normalized = value || 'PENDING'

  const classes = {
    PENDING: 'bg-amber-400/10 text-amber-300',
    CONFIRMED: 'bg-cyan-400/10 text-cyan-300',
    PAID: 'bg-emerald-400/10 text-emerald-300',
    PROCESSING: 'bg-blue-400/10 text-blue-300',
    DELIVERED: 'bg-emerald-400/10 text-emerald-300',
    FAILED: 'bg-red-400/10 text-red-300',
    REFUNDED: 'bg-purple-400/10 text-purple-300',
    CANCELED: 'bg-red-400/10 text-red-300',
  }

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
        classes[normalized] || 'bg-slate-400/10 text-slate-300'
      }`}
    >
      {labels[normalized] || normalized}
    </span>
  )
}

function OrderDetailsModal({ isOpen, onClose, order }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState(order?.status || '')
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || '')

  if (!isOpen || !order) return null

  const orderId = getEntityId(order)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const updateMutation = useMutation({
    mutationFn: () =>
      updateOrderStatus(orderId, {
        status,
        paymentStatus,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      onClose()
    },
  })

  function handleUpdate(event) {
    event.preventDefault()
    updateMutation.mutate()
  }

  return (
    <Modal
      title={`Pedido ${orderId}`}
      description="Confira os itens, cliente e atualize o andamento."
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleUpdate} className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-bold text-white">Cliente</h3>

          <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
            <p>
              <span className="text-slate-500">Nome: </span>
              {order.customerName || '-'}
            </p>

            <p>
              <span className="text-slate-500">Telefone: </span>
              {order.customerPhone || '-'}
            </p>

            <p>
              <span className="text-slate-500">E-mail: </span>
              {order.customerEmail || '-'}
            </p>

            <p>
              <span className="text-slate-500">Criado em: </span>
              {formatDate(order.createdAt)}
            </p>
          </div>
        </section>

        {order.shippingAddress && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-bold text-white">Endereço</h3>

            <p className="mt-3 text-sm text-slate-300">
              {order.shippingAddress.street}, {order.shippingAddress.number}
              {order.shippingAddress.complement
                ? ` - ${order.shippingAddress.complement}`
                : ''}{' '}
              - {order.shippingAddress.neighborhood},{' '}
              {order.shippingAddress.city}/{order.shippingAddress.state} - CEP:{' '}
              {order.shippingAddress.zipCode}
            </p>
          </section>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-bold text-white">Itens</h3>

          <div className="mt-3 space-y-3">
            {order.items?.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex justify-between gap-4 rounded-2xl bg-slate-950/60 p-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-slate-500">
                    Qtd: {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>

                <strong className="text-white">
                  {formatCurrency(item.subtotal)}
                </strong>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
            <span className="font-bold text-white">Total</span>
            <strong className="text-xl text-white">
              {formatCurrency(order.total)}
            </strong>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Status do pedido
            </label>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none"
            >
              {orderStatusOptions
                .filter((item) => item.value)
                .map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Status do pagamento
            </label>

            <select
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none"
            >
              {paymentStatusOptions
                .filter((item) => item.value)
                .map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
            </select>
          </div>
        </section>

        {updateMutation.isError && (
          <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
            {updateMutation.error.message}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Fechar
          </Button>

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Salvando...' : 'Salvar status'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function OrdersPage() {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders', status, paymentStatus],
    queryFn: () =>
      listOrders({
        limit: 100,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
      }),
  })

  const orders = useMemo(() => normalizeList(data), [data])

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders

    const value = search.toLowerCase()

    return orders.filter((order) => {
      return (
        order.customerName?.toLowerCase().includes(value) ||
        order.customerPhone?.toLowerCase().includes(value) ||
        order.customerEmail?.toLowerCase().includes(value) ||
        order.items?.some((item) => item.name?.toLowerCase().includes(value))
      )
    })
  }, [orders, search])

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  function handleCancel(order) {
    const orderId = getEntityId(order)

    if (!orderId) {
      window.alert('Não foi possível identificar este pedido.')
      return
    }

    const confirmed = window.confirm(`Cancelar o pedido ${orderId}?`)

    if (confirmed) {
      cancelMutation.mutate(orderId)
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Loja
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Pedidos
          </h2>

          <p className="mt-2 text-slate-400">
            Gerencie pedidos da loja, pagamentos e entregas.
          </p>
        </div>

        <Button variant="secondary" onClick={() => refetch()}>
          <RefreshCcw size={18} />
          Atualizar
        </Button>
      </div>

      <Card className="mt-8 p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <Input
              placeholder="Buscar por cliente, telefone, e-mail ou produto..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-11"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none"
          >
            {orderStatusOptions.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value)}
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none"
          >
            {paymentStatusOptions.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {isLoading && (
        <Card className="mt-6 p-8 text-center">
          <p className="text-slate-400">
            Carregando pedidos...
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
                <TableCell head>Pedido</TableCell>
                <TableCell head>Cliente</TableCell>
                <TableCell head>Itens</TableCell>
                <TableCell head>Total</TableCell>
                <TableCell head>Status</TableCell>
                <TableCell head>Pagamento</TableCell>
                <TableCell head>Criado em</TableCell>
                <TableCell head>Ações</TableCell>
              </TableRow>
            </TableHead>

            <tbody>
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-slate-500"
                  >
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}

              {filteredOrders.map((order, index) => {
                const orderId = getEntityId(order)

                return (
                  <TableRow key={orderId || index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                          <ShoppingBag size={20} />
                        </div>

                        <div>
                          <strong className="block text-white">
                            #{orderId?.slice(-6) || '-'}
                          </strong>

                          <span className="text-xs text-slate-500">
                            {order.gateway || 'MANUAL'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <strong className="block text-white">
                        {order.customerName || '-'}
                      </strong>

                      <span className="text-xs text-slate-500">
                        {order.customerPhone || order.customerEmail || '-'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-slate-300">
                        {order.items?.length || 0} item(ns)
                      </span>
                    </TableCell>

                    <TableCell>
                      <strong className="text-white">
                        {formatCurrency(order.total)}
                      </strong>
                    </TableCell>

                    <TableCell>
                      <StatusBadge value={order.status} />
                    </TableCell>

                    <TableCell>
                      <StatusBadge value={order.paymentStatus} type="payment" />
                    </TableCell>

                    <TableCell>
                      {formatDate(order.createdAt)}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          title="Ver detalhes"
                          onClick={() => setSelectedOrder(order)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-cyan-400/20 hover:text-cyan-300"
                        >
                          <Eye size={16} />
                        </button>

                        {order.status !== 'CANCELED' && (
                          <button
                            type="button"
                            title="Cancelar pedido"
                            onClick={() => handleCancel(order)}
                            disabled={cancelMutation.isPending}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-400/10 text-red-300 hover:bg-red-400/20 disabled:opacity-50"
                          >
                            <Ban size={16} />
                          </button>
                        )}

                        {order.paymentStatus === 'PAID' && (
                          <span
                            title="Pago"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"
                          >
                            <PackageCheck size={16} />
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </tbody>
          </Table>
        </div>
      )}

      <OrderDetailsModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  )
}
