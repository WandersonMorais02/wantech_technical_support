import { Card } from '../../components/Card'

export function ClientsPage() {
  return (
    <div>
      <h2 className="text-3xl font-black">Clientes</h2>
      <p className="mt-2 text-slate-400">
        Cadastro e gerenciamento de clientes.
      </p>

      <Card className="mt-6 p-6">
        <p className="text-slate-300">Nenhum cliente cadastrado ainda.</p>
      </Card>
    </div>
  )
}
