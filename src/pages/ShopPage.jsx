import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, Search, ShoppingBag, ShoppingCart } from 'lucide-react'

import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Container } from '../components/Container'
import { Input } from '../components/Input'
import { SectionHeader } from '../components/SectionHeader'
import { listProducts } from '../services/productService'
import { useCartStore } from '../store/cartStore'
import { getMediaUrl } from '../utils/media'

function normalizeList(data) {
  return data?.data || data?.items || data?.results || data || []
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function ShopPage() {
  const [search, setSearch] = useState('')
  const addItem = useCartStore((state) => state.addItem)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['public-products'],
    queryFn: () =>
      listProducts({
        limit: 50,
        onlyPublished: true,
      }),
  })

  const products = useMemo(() => normalizeList(data), [data])

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products

    const value = search.toLowerCase()

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(value) ||
        product.description?.toLowerCase().includes(value) ||
        product.category?.name?.toLowerCase().includes(value)
      )
    })
  }, [products, search])

  return (
    <main>
      <section className="py-20">
        <Container>
          <SectionHeader
            eyebrow="Loja"
            title="Produtos, acessórios e peças disponíveis"
            description="Confira produtos disponíveis, veja os detalhes e adicione ao carrinho."
          />

          <Card className="mt-8 p-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar produto, peça ou acessório..."
                className="pl-11"
              />
            </div>
          </Card>

          {isLoading && (
            <Card className="mt-8 p-8 text-center">
              <p className="text-slate-400">Carregando produtos...</p>
            </Card>
          )}

          {isError && (
            <Card className="mt-8 border border-red-400/20 bg-red-400/10 p-6">
              <p className="text-red-200">{error.message}</p>
            </Card>
          )}

          {!isLoading && !isError && filteredProducts.length === 0 && (
            <Card className="mt-8 p-8 text-center">
              <p className="text-slate-400">Nenhum produto encontrado.</p>
            </Card>
          )}

          {!isLoading && !isError && filteredProducts.length > 0 && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const image = getMediaUrl(product.images?.[0])
                const hasPromotion =
                  product.promotionalPrice &&
                  Number(product.promotionalPrice) < Number(product.price)

                return (
                  <Card key={product.id || product._id} className="overflow-hidden">
                    <Link
                      to={`/produto/${product.slug}`}
                      className="block"
                    >
                      <div className="relative h-52 bg-white/[0.03]">
                        {image ? (
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-500">
                            <ShoppingBag size={42} />
                          </div>
                        )}

                        {product.isFeatured && (
                          <span className="absolute left-3 top-3 rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold text-slate-950">
                            Destaque
                          </span>
                        )}

                        {hasPromotion && (
                          <span className="absolute right-3 top-3 rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950">
                            Promoção
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                        {product.category?.name || 'Produto'}
                      </p>

                      <Link to={`/produto/${product.slug}`}>
                        <h3 className="mt-2 line-clamp-2 text-lg font-bold text-white hover:text-cyan-300">
                          {product.name}
                        </h3>
                      </Link>

                      {product.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-4">
                        {hasPromotion && (
                          <p className="text-sm text-slate-500 line-through">
                            {formatCurrency(product.price)}
                          </p>
                        )}

                        <strong className="block text-2xl text-white">
                          {formatCurrency(
                            hasPromotion
                              ? product.promotionalPrice
                              : product.price,
                          )}
                        </strong>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-400">
                          Estoque: {product.stock ?? 0}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <Link
                          to={`/produto/${product.slug}`}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                          <Eye size={16} />
                          Ver
                        </Link>

                        <Button
                          type="button"
                          disabled={!product.stock}
                          onClick={() => addItem(product, 1)}
                        >
                          <ShoppingCart size={16} />
                          Add
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </Container>
      </section>
    </main>
  )
}
