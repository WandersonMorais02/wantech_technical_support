import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Container } from '../components/Container'
import { getProductBySlug } from '../services/productService'
import { useCartStore } from '../store/cartStore'
import { getMediaUrl } from '../utils/media'

function normalize(data) {
  return data?.data || data
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function ProductDetailsPage() {
  const { slug } = useParams()
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  })

  const product = normalize(data)
  const image = getMediaUrl(product?.images?.[0])
  const hasPromotion =
    product?.promotionalPrice &&
    Number(product.promotionalPrice) < Number(product.price)

  function increase() {
    setQuantity((current) =>
      product?.stock && current >= product.stock ? current : current + 1,
    )
  }

  function decrease() {
    setQuantity((current) => (current <= 1 ? 1 : current - 1))
  }

  function handleAddToCart() {
    addItem(product, quantity)
  }

  if (isLoading) {
    return (
      <Container>
        <div className="py-20 text-center text-slate-400">
          Carregando produto...
        </div>
      </Container>
    )
  }

  if (isError || !product) {
    return (
      <Container>
        <Card className="my-20 border border-red-400/20 bg-red-400/10 p-6 text-red-200">
          {error?.message || 'Produto não encontrado.'}
        </Card>
      </Container>
    )
  }

  return (
    <main className="py-12">
      <Container>
        <Link
          to="/loja"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
        >
          <ArrowLeft size={18} />
          Voltar para loja
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <Card className="overflow-hidden">
            <div className="aspect-square bg-white/[0.03]">
              {image ? (
                <img
                  src={image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  Sem imagem
                </div>
              )}
            </div>
          </Card>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
              {product.category?.name || 'Produto'}
            </p>

            <h1 className="mt-3 text-4xl font-black text-white">
              {product.name}
            </h1>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
              {hasPromotion && (
                <p className="text-sm text-slate-500 line-through">
                  {formatCurrency(product.price)}
                </p>
              )}

              <strong className="block text-4xl text-white">
                {formatCurrency(
                  hasPromotion ? product.promotionalPrice : product.price,
                )}
              </strong>

              <p className="mt-2 text-sm text-slate-400">
                Estoque disponível: {product.stock ?? 0}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-12 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 sm:w-40">
                <button
                  type="button"
                  onClick={decrease}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white"
                >
                  <Minus size={16} />
                </button>

                <span className="font-bold text-white">{quantity}</span>

                <button
                  type="button"
                  onClick={increase}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white"
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button
                type="button"
                disabled={!product.stock}
                onClick={handleAddToCart}
                className="flex-1"
              >
                <ShoppingCart size={18} />
                Adicionar ao carrinho
              </Button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Card className="p-4">
                <p className="text-sm text-slate-500">Condição</p>
                <strong className="text-white">{product.condition}</strong>
              </Card>

              <Card className="p-4">
                <p className="text-sm text-slate-500">Disponibilidade</p>
                <strong className="text-white">
                  {product.isPublished ? 'Publicado' : 'Indisponível'}
                </strong>
              </Card>

            </div>
                        <div className="mt-4 whitespace-pre-line text-slate-400 leading-8">
              <strong><h2>Descrição:</h2></strong>
              {product.description || 'Produto disponível na loja Wantech.'}
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}
