import { Card } from '../components/Card'

const cards = [
  { label: 'Serviços abertos', value: '0' },
  { label: 'Aguardando orçamento', value: '0' },
  { label: 'Pedidos pendentes', value: '0' },
  { label: 'Faturamento do mês', value: 'R$ 0,00' },
]

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Visão geral
        </p>

        <h2 className="mt-2 text-3xl font-black">
          Controle da assistência
        </h2>

        <p className="mt-2 text-slate-400">
          Aqui vamos acompanhar serviços, vendas, pagamentos e indicadores.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="p-5">
            <p className="text-sm text-slate-400">{card.label}</p>
            <strong className="mt-2 block text-3xl">{card.value}</strong>
          </Card>
        ))}
      </div>
    </div>
  )
}
