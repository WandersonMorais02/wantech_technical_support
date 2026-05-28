import { Card } from '../../components/Card'

export function OrdersPage() {
  return (
    <div>
      <h2 className="text-3xl font-black">Pedidos</h2>
      <p className="mt-2 text-slate-400">
        Acompanhe pedidos realizados pela loja.
      </p>

      <Card className="mt-6 p-6">
        <p className="text-slate-300">Nenhum pedido cadastrado ainda.</p>
      </Card>
    </div>
  )
}
