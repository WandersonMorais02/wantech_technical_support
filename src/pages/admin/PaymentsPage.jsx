import { Card } from '../../components/Card'

export function PaymentsPage() {
  return (
    <div>
      <h2 className="text-3xl font-black">Pagamentos</h2>
      <p className="mt-2 text-slate-400">
        Controle recebimentos, formas de pagamento e status financeiro.
      </p>

      <Card className="mt-6 p-6">
        <p className="text-slate-300">Nenhum pagamento registrado ainda.</p>
      </Card>
    </div>
  )
}
