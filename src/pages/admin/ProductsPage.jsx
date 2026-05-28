import { Card } from '../../components/Card'

export function ProductsPage() {
  return (
    <div>
      <h2 className="text-3xl font-black">Produtos</h2>
      <p className="mt-2 text-slate-400">
        Gerencie produtos, peças, estoque e itens da loja.
      </p>

      <Card className="mt-6 p-6">
        <p className="text-slate-300">Nenhum produto cadastrado ainda.</p>
      </Card>
    </div>
  )
}
