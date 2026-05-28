import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Container } from '../components/Container'
import { Input } from '../components/Input'
import { SectionHeader } from '../components/SectionHeader'
import {
  approveServiceOrderBudget,
  getServiceOrderByProtocol,
} from '../services/serviceOrderService'

export function TrackServiceOrderPage() {
  const [protocol, setProtocol] = useState('')
  const [serviceOrder, setServiceOrder] = useState(null)

  const searchMutation = useMutation({
    mutationFn: getServiceOrderByProtocol,
    onSuccess: (data) => {
      setServiceOrder(data?.data || data)
    },
  })

  const approveMutation = useMutation({
    mutationFn: ({ approved }) =>
      approveServiceOrderBudget(protocol, {
        approved,
        customerNote: approved
          ? 'Cliente aprovou o orçamento pelo site.'
          : 'Cliente recusou o orçamento pelo site.',
      }),
    onSuccess: (data) => {
      setServiceOrder(data?.data || data)
    },
  })

  function handleSubmit(event) {
    event.preventDefault()

    if (!protocol.trim()) return

    searchMutation.mutate(protocol.trim())
  }

  return (
    <Container className="py-20">
      <SectionHeader
        eyebrow="Acompanhamento"
        title="Consulte sua ordem de serviço"
        description="Digite seu protocolo para acompanhar o status do reparo e responder ao orçamento."
      />

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1fr_auto]"
      >
        <Input
          value={protocol}
          onChange={(event) => setProtocol(event.target.value)}
          placeholder="Ex: OS-2026-0001"
        />

        <Button type="submit" disabled={searchMutation.isPending}>
          <Search size={18} />
          {searchMutation.isPending ? 'Consultando...' : 'Consultar'}
        </Button>
      </form>

      {searchMutation.isError && (
        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {searchMutation.error.message}
        </p>
      )}

      {serviceOrder && (
        <Card className="mt-8 p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-slate-400">Protocolo</p>
              <h2 className="text-3xl font-black text-white">
                {serviceOrder.protocol || protocol}
              </h2>
            </div>

            <span className="w-fit rounded-full bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
              {serviceOrder.status || 'Em andamento'}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Cliente</p>
              <p className="mt-1 font-semibold text-white">
                {serviceOrder.client?.name || serviceOrder.customerName || 'Cliente'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Equipamento</p>
              <p className="mt-1 font-semibold text-white">
                {serviceOrder.device?.brand} {serviceOrder.device?.model}
              </p>
            </div>
          </div>

          {serviceOrder.budget?.total && (
            <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <p className="text-sm text-cyan-200">Orçamento</p>
              <p className="mt-2 text-3xl font-black text-white">
                {Number(serviceOrder.budget.total).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate({ approved: true })}
                >
                  Aprovar orçamento
                </Button>

                <Button
                  variant="secondary"
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate({ approved: false })}
                >
                  Recusar
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </Container>
  )
}
