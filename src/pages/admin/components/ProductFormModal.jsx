import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, ImageIcon, Trash2, UploadCloud } from 'lucide-react'

import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { Modal } from '../../../components/Modal'

import {
  createProduct,
  updateProduct,
} from '../../../services/productService'
import { listProductCategories } from '../../../services/productCategoryService'
import { uploadAttachment } from '../../../services/attachmentService'
import { getMediaUrl } from '../../../utils/media'

const initialForm = {
  name: '',
  description: '',
  category: '',
  price: '',
  promotionalPrice: '',
  stock: '',
  condition: 'USED',
  isFeatured: false,
  isPublished: false,
}

function normalizeList(data) {
  return data?.data || data?.items || data?.results || data || []
}

function getEntityId(entity) {
  if (typeof entity?._id === 'string') return entity._id
  if (typeof entity?.id === 'string') return entity.id
  return ''
}

function buildInitialForm(product) {
  if (!product) return initialForm

  return {
    name: product.name || '',
    description: product.description || '',
    category: getEntityId(product.category),
    price: product.price ?? '',
    promotionalPrice: product.promotionalPrice ?? '',
    stock: product.stock ?? '',
    condition: product.condition || 'USED',
    isFeatured: Boolean(product.isFeatured),
    isPublished: Boolean(product.isPublished),
  }
}

export function ProductFormModal({ isOpen, onClose, product }) {
  if (!isOpen) return null

  return (
    <ProductForm
      key={product ? getEntityId(product) : 'new-product'}
      isOpen={isOpen}
      onClose={onClose}
      product={product}
    />
  )
}

function ProductForm({ isOpen, onClose, product }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(() => buildInitialForm(product))
  const [files, setFiles] = useState([])

  const isEditing = Boolean(product)
  const existingImages = useMemo(() => product?.images || [], [product])

  const { data: categoriesData } = useQuery({
    queryKey: ['product-categories'],
    queryFn: listProductCategories,
    enabled: isOpen,
  })

  const categories = useMemo(
    () => normalizeList(categoriesData),
    [categoriesData],
  )

  useEffect(() => {
    return () => {
      files.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview)
      })
    }
  }, [files])

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleFiles(event) {
    const selectedFiles = Array.from(event.target.files || [])

    const mappedFiles = selectedFiles.map((file) => ({
      file,
      preview: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null,
      type: file.type,
    }))

    setFiles((current) => [...current, ...mappedFiles])
    event.target.value = ''
  }

  function removeFile(index) {
    setFiles((current) => {
      const fileToRemove = current[index]

      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }

      return current.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      let uploadedImages = []

      if (files.length > 0) {
        uploadedImages = await Promise.all(
          files.map(async (item) => {
            const response = await uploadAttachment({
              file: item.file,
              context: 'PRODUCT_IMAGE',
            })

            const attachment = response?.data || response
            return getEntityId(attachment)
          }),
        )
      }

      const currentImages = existingImages
        .map((image) => getEntityId(image))
        .filter(Boolean)

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category || undefined,
        price: Number(form.price),
        stock: form.stock === '' ? 0 : Number(form.stock),
        condition: form.condition,
        images: [...currentImages, ...uploadedImages].filter(Boolean),
        isFeatured: form.isFeatured,
        isPublished: form.isPublished,
      }

      if (form.promotionalPrice !== '') {
        payload.promotionalPrice = Number(form.promotionalPrice)
      }

      if (isEditing) {
        return updateProduct(getEntityId(product), payload)
      }

      return createProduct(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['public-products'] })
      onClose()
    },
  })

  function handleSubmit(event) {
    event.preventDefault()

    if (saveMutation.isPending) return

    saveMutation.mutate()
  }

  return (
    <Modal
      title={isEditing ? 'Editar produto' : 'Novo produto'}
      description="Cadastre produtos, peças e acessórios para a loja pública."
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-7">
        <section className="grid gap-5 md:grid-cols-2">
          <Input
            placeholder="Nome do produto"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            required
          />

          <select
            value={form.category}
            onChange={(event) => updateField('category', event.target.value)}
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
          >
            <option value="">Categoria</option>

            {categories.map((category) => (
              <option key={getEntityId(category)} value={getEntityId(category)}>
                {category.name}
              </option>
            ))}
          </select>

          <Input
            type="number"
            placeholder="Preço"
            value={form.price}
            onChange={(event) => updateField('price', event.target.value)}
            required
          />

          <Input
            type="number"
            placeholder="Preço promocional"
            value={form.promotionalPrice}
            onChange={(event) =>
              updateField('promotionalPrice', event.target.value)
            }
          />

          <Input
            type="number"
            placeholder="Estoque"
            value={form.stock}
            onChange={(event) => updateField('stock', event.target.value)}
          />

          <select
            value={form.condition}
            onChange={(event) => updateField('condition', event.target.value)}
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
          >
            <option value="NEW">Novo</option>
            <option value="USED">Usado</option>
            <option value="REFURBISHED">Recondicionado</option>
          </select>
        </section>

        <textarea
          placeholder="Descrição do produto..."
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          className="min-h-[130px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
        />

        <section className="grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) =>
                updateField('isPublished', event.target.checked)
              }
              className="h-4 w-4"
            />

            <span>
              <strong className="block text-white">Publicado</strong>
              <small className="text-slate-500">
                Aparece na loja pública.
              </small>
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) =>
                updateField('isFeatured', event.target.checked)
              }
              className="h-4 w-4"
            />

            <span>
              <strong className="block text-white">Destaque</strong>
              <small className="text-slate-500">
                Marca o produto como destaque.
              </small>
            </span>
          </label>
        </section>

        <section>
          <h3 className="mb-4 text-lg font-bold text-white">
            Imagens do produto
          </h3>

          {existingImages.length > 0 && (
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              {existingImages.map((image) => {
                const imageUrl = getMediaUrl(image)

                return (
                  <div
                    key={getEntityId(image)}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Imagem do produto"
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center text-slate-500">
                        <ImageIcon />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.03]">
            <UploadCloud size={36} className="text-cyan-300" />

            <span className="mt-4 font-semibold text-white">
              Clique para adicionar imagens
            </span>

            <span className="mt-2 text-sm text-slate-500">
              PNG, JPG ou WEBP
            </span>

            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFiles}
            />
          </label>

          {files.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {files.map((item, index) => (
                <div
                  key={`${item.file.name}-${index}`}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-3"
                >
                  {item.preview ? (
                    <div className="relative">
                      <img
                        src={item.preview}
                        alt={item.file.name}
                        className="h-36 w-full rounded-xl object-cover"
                      />

                      <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
                        <ImageIcon size={14} className="mr-1 inline" />
                        Imagem
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-36 flex-col items-center justify-center rounded-xl bg-white/5 text-sm text-slate-400">
                      <FileText className="mb-2 text-cyan-300" />
                      Arquivo
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-red-300 transition hover:bg-red-400/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {saveMutation.isError && (
          <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
            {saveMutation.error.message}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending
              ? 'Salvando...'
              : isEditing
                ? 'Salvar alterações'
                : 'Criar produto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
