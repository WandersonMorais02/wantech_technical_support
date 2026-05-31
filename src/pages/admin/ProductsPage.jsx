import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Edit2,
  Eye,
  EyeOff,
  Package,
  Plus,
  RefreshCcw,
  Search,
  Star,
  Trash2,
} from 'lucide-react'

import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { Table } from '../../components/table/Table'
import { TableCell } from '../../components/table/TableCell'
import { TableHead } from '../../components/table/TableHead'
import { TableRow } from '../../components/table/TableRow'

import {
  deleteProduct,
  listProducts,
  updateProduct,
} from '../../services/productService'

import { ProductFormModal } from './components/ProductFormModal'
import { getMediaUrl } from '../../utils/media'

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

function getConditionLabel(condition) {
  const labels = {
    NEW: 'Novo',
    USED: 'Usado',
    REFURBISHED: 'Recondicionado',
  }

  return labels[condition] || condition || '-'
}

export function ProductsPage() {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () =>
      listProducts({
        limit: 100,
      }),
  })

  const products = useMemo(() => normalizeList(data), [data])

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products

    const value = search.toLowerCase()

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(value) ||
        product.slug?.toLowerCase().includes(value) ||
        product.category?.name?.toLowerCase().includes(value)
      )
    })
  }, [products, search])

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['public-products'] })
    },
  })

  const togglePublishedMutation = useMutation({
    mutationFn: ({ product, isPublished }) =>
      updateProduct(getEntityId(product), {
        isPublished,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['public-products'] })
    },
  })

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ product, isFeatured }) =>
      updateProduct(getEntityId(product), {
        isFeatured,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['public-products'] })
    },
  })

  function handleCreate() {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  function handleEdit(product) {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  function handleDelete(product) {
    const productId = getEntityId(product)

    if (!productId) {
      window.alert('Não foi possível identificar este produto.')
      return
    }

    const confirmed = window.confirm(
      `Deseja realmente remover o produto "${product.name}"?`,
    )

    if (confirmed) {
      deleteMutation.mutate(productId)
    }
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setSelectedProduct(null)
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Loja
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Produtos
          </h2>

          <p className="mt-2 text-slate-400">
            Cadastre produtos, peças, acessórios, preços, estoque e imagens.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => refetch()}>
            <RefreshCcw size={18} />
            Atualizar
          </Button>

          <Button onClick={handleCreate}>
            <Plus size={18} />
            Novo produto
          </Button>
        </div>
      </div>

      <Card className="mt-8 p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <Input
            placeholder="Buscar por nome, categoria ou slug..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-11"
          />
        </div>
      </Card>

      {isLoading && (
        <Card className="mt-6 p-8 text-center">
          <p className="text-slate-400">
            Carregando produtos...
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
                <TableCell head>Produto</TableCell>
                <TableCell head>Categoria</TableCell>
                <TableCell head>Preço</TableCell>
                <TableCell head>Estoque</TableCell>
                <TableCell head>Condição</TableCell>
                <TableCell head>Status</TableCell>
                <TableCell head>Ações</TableCell>
              </TableRow>
            </TableHead>

            <tbody>
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-slate-500"
                  >
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              )}

              {filteredProducts.map((product, index) => {
                const productId = getEntityId(product)
                const image = getMediaUrl(product.images?.[0])
                const hasPromotion =
                  product.promotionalPrice &&
                  Number(product.promotionalPrice) < Number(product.price)

                return (
                  <TableRow key={productId || `${product.slug}-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/5 text-slate-500">
                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package size={22} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <strong className="block truncate text-white">
                            {product.name}
                          </strong>

                          <span className="block truncate text-xs text-slate-500">
                            {product.slug}
                          </span>

                          {product.isFeatured && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                              <Star size={12} />
                              Destaque
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {product.category?.name || '-'}
                    </TableCell>

                    <TableCell>
                      <div>
                        {hasPromotion && (
                          <span className="block text-xs text-slate-500 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}

                        <strong className="text-white">
                          {formatCurrency(
                            hasPromotion
                              ? product.promotionalPrice
                              : product.price,
                          )}
                        </strong>
                      </div>
                    </TableCell>

                    <TableCell>
                      {product.stock ?? 0}
                    </TableCell>

                    <TableCell>
                      {getConditionLabel(product.condition)}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                            product.isPublished
                              ? 'bg-emerald-400/10 text-emerald-300'
                              : 'bg-slate-400/10 text-slate-400'
                          }`}
                        >
                          {product.isPublished ? 'Publicado' : 'Rascunho'}
                        </span>

                        {!product.isActive && (
                          <span className="w-fit rounded-full bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-300">
                            Inativo
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          title={
                            product.isPublished
                              ? 'Despublicar'
                              : 'Publicar'
                          }
                          onClick={() =>
                            togglePublishedMutation.mutate({
                              product,
                              isPublished: !product.isPublished,
                            })
                          }
                          disabled={togglePublishedMutation.isPending}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-cyan-400/20 hover:text-cyan-300 disabled:opacity-50"
                        >
                          {product.isPublished ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          title={
                            product.isFeatured
                              ? 'Remover destaque'
                              : 'Destacar'
                          }
                          onClick={() =>
                            toggleFeaturedMutation.mutate({
                              product,
                              isFeatured: !product.isFeatured,
                            })
                          }
                          disabled={toggleFeaturedMutation.isPending}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-amber-400/20 hover:text-amber-300 disabled:opacity-50"
                        >
                          <Star size={16} />
                        </button>

                        <button
                          type="button"
                          title="Editar"
                          onClick={() => handleEdit(product)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-cyan-400/20 hover:text-cyan-300"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          type="button"
                          title="Excluir"
                          onClick={() => handleDelete(product)}
                          disabled={deleteMutation.isPending}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-400/10 text-red-300 hover:bg-red-400/20 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </tbody>
          </Table>
        </div>
      )}

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        product={selectedProduct}
      />
    </div>
  )
}
