import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'

import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Container } from '../components/Container'
import { useCartStore } from '../store/cartStore'
import { getMediaUrl } from '../utils/media'

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function CartPage() {
  const navigate = useNavigate()

  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const subtotal = useCartStore((state) => state.getSubtotal())

  return (
    <main className="py-16">
      <Container>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
              Carrinho
            </p>

            <h1 className="mt-2 text-4xl font-black text-white">
              Seu carrinho
            </h1>

            <p className="mt-2 text-slate-400">
              Revise os produtos antes de finalizar a compra.
            </p>
          </div>

          {items.length > 0 && (
            <Button type="button" variant="secondary" onClick={clearCart}>
              Limpar carrinho
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <Card className="mt-8 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300">
              <ShoppingCart size={30} />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-white">
              Seu carrinho está vazio
            </h2>

            <p className="mt-2 text-slate-400">
              Adicione produtos da loja para continuar.
            </p>

            <Link
              to="/loja"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-cyan-400 px-6 text-sm font-bold text-slate-950"
            >
              Ir para loja
            </Link>
          </Card>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {items.map((item) => {
                const image = getMediaUrl(item.image)

                return (
                  <Card
                    key={item.productId}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                  >
                    <Link
                      to={`/produto/${item.slug}`}
                      className="h-28 w-full overflow-hidden rounded-2xl bg-white/[0.03] sm:w-28"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-500">
                          Sem imagem
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link to={`/produto/${item.slug}`}>
                        <h3 className="text-lg font-bold text-white hover:text-cyan-300">
                          {item.name}
                        </h3>
                      </Link>

                      <p className="mt-1 text-sm text-slate-400">
                        {formatCurrency(item.price)} cada
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Estoque: {item.stock}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="flex h-11 items-center rounded-2xl border border-white/10 bg-white/5 px-2">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.productId)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white"
                        >
                          <Minus size={15} />
                        </button>

                        <span className="w-10 text-center font-bold text-white">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.productId)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <strong className="w-28 text-right text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </strong>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10 text-red-300 hover:bg-red-400/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>

            <Card className="h-fit p-6">
              <h2 className="text-xl font-bold text-white">
                Resumo
              </h2>

              <div className="mt-5 space-y-3 border-b border-white/10 pb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <strong className="text-white">
                    {formatCurrency(subtotal)}
                  </strong>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Entrega</span>
                  <strong className="text-white">A combinar</strong>
                </div>
              </div>

              <div className="mt-5 flex justify-between">
                <span className="font-bold text-white">Total</span>
                <strong className="text-2xl text-white">
                  {formatCurrency(subtotal)}
                </strong>
              </div>

              <Button
                type="button"
                className="mt-6 w-full"
                onClick={() => navigate('/checkout')}
              >
                Finalizar compra
              </Button>

              <Link
                to="/loja"
                className="mt-3 flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Continuar comprando
              </Link>
            </Card>
          </div>
        )}
      </Container>
    </main>
  )
}
