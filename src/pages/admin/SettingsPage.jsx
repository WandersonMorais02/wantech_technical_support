import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  FileText,
  ImageIcon,
  LinkIcon,
  RefreshCcw,
  Save,
  UploadCloud,
} from 'lucide-react'

import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { getCompany, updateCompany } from '../../services/companyService'
import { uploadAttachment } from '../../services/attachmentService'
import { getMediaUrl } from '../../utils/media'

const initialForm = {
  name: '',
  document: '',
  email: '',
  phone: '',
  whatsapp: '',

  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',

  openingHours: '',

  logo: '',
  description: '',

  consentTerms: '',
  warrantyPolicy: '',

  instagram: '',
  facebook: '',
  tiktok: '',
  website: '',

  isActive: true,
}

function normalize(data) {
  return data?.data || data || null
}

function getEntityId(entity) {
  if (typeof entity?._id === 'string') return entity._id
  if (typeof entity?.id === 'string') return entity.id
  if (typeof entity === 'string') return entity
  return ''
}

function buildInitialForm(company) {
  if (!company) return initialForm

  return {
    name: company.name || '',
    document: company.document || '',
    email: company.email || '',
    phone: company.phone || '',
    whatsapp: company.whatsapp || '',

    street: company.address?.street || '',
    number: company.address?.number || '',
    neighborhood: company.address?.neighborhood || '',
    city: company.address?.city || '',
    state: company.address?.state || '',
    zipCode: company.address?.zipCode || '',

    openingHours: company.openingHours || '',

    logo: getEntityId(company.logo),
    description: company.description || '',

    consentTerms: company.consentTerms || '',
    warrantyPolicy: company.warrantyPolicy || '',

    instagram: company.socialLinks?.instagram || '',
    facebook: company.socialLinks?.facebook || '',
    tiktok: company.socialLinks?.tiktok || '',
    website: company.socialLinks?.website || '',

    isActive: company.isActive ?? true,
  }
}

export function SettingsPage() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['company'],
    queryFn: getCompany,
  })

  const company = useMemo(() => normalize(data), [data])

  useEffect(() => {
    if (company && !isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(buildInitialForm(company))
    }
  }, [company, isEditing])

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview)
      }
    }
  }, [logoPreview])

  function updateField(field, value) {
    setIsEditing(true)

    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleLogoFile(event) {
    const file = event.target.files?.[0]

    if (!file) return

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }

    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setIsEditing(true)

    event.target.value = ''
  }

  function getCurrentLogoUrl() {
    if (logoPreview) return logoPreview

    if (!company?.logo || typeof company.logo === 'string') {
      return ''
    }

    return getMediaUrl(company.logo)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      let logoId = form.logo || undefined

      if (logoFile) {
        const response = await uploadAttachment({
          file: logoFile,
          context: 'COMPANY_LOGO',
        })

        const attachment = response?.data || response
        logoId = getEntityId(attachment)
      }

      const payload = {
        name: form.name?.trim(),
        document: form.document?.trim() || undefined,
        email: form.email?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        whatsapp: form.whatsapp?.trim() || undefined,

        address: {
          street: form.street?.trim() || undefined,
          number: form.number?.trim() || undefined,
          neighborhood: form.neighborhood?.trim() || undefined,
          city: form.city?.trim() || undefined,
          state: form.state?.trim() || undefined,
          zipCode: form.zipCode?.trim() || undefined,
        },

        openingHours: form.openingHours?.trim() || undefined,

        description: form.description?.trim() || undefined,
        consentTerms: form.consentTerms?.trim() || undefined,
        warrantyPolicy: form.warrantyPolicy?.trim() || undefined,

        socialLinks: {
          instagram: form.instagram?.trim() || undefined,
          facebook: form.facebook?.trim() || undefined,
          tiktok: form.tiktok?.trim() || undefined,
          website: form.website?.trim() || undefined,
        },

        isActive: form.isActive,
      }

      if (logoId) {
        payload.logo = logoId
      }

      return updateCompany(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] })
      setLogoFile(null)
      setLogoPreview('')
      setIsEditing(false)
    },
  })

  function handleSubmit(event) {
    event.preventDefault()
    saveMutation.mutate()
  }

  const currentLogoUrl = getCurrentLogoUrl()

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Sistema
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Configurações da empresa
          </h2>

          <p className="mt-2 text-slate-400">
            Dados usados no site, PDFs, recibos, atendimento e loja.
          </p>
        </div>

        <Button variant="secondary" onClick={() => refetch()}>
          <RefreshCcw size={18} />
          Atualizar
        </Button>
      </div>

      {isLoading && (
        <Card className="mt-8 p-8 text-center">
          <p className="text-slate-400">Carregando configurações...</p>
        </Card>
      )}

      {isError && (
        <Card className="mt-8 border border-red-400/20 bg-red-400/10 p-6">
          <p className="text-red-200">{error.message}</p>
        </Card>
      )}

      {!isLoading && !isError && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <Building2 size={22} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Dados principais
                </h3>

                <p className="text-sm text-slate-500">
                  Identificação e contato da assistência.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                placeholder="Nome da empresa"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />

              <Input
                placeholder="CNPJ / CPF"
                value={form.document}
                onChange={(event) =>
                  updateField('document', event.target.value)
                }
              />

              <Input
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
              />

              <Input
                placeholder="Telefone"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
              />

              <Input
                placeholder="WhatsApp"
                value={form.whatsapp}
                onChange={(event) =>
                  updateField('whatsapp', event.target.value)
                }
              />

              <Input
                placeholder="Horário de funcionamento"
                value={form.openingHours}
                onChange={(event) =>
                  updateField('openingHours', event.target.value)
                }
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-white">
                  Logo da empresa
                </label>

                <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.03]">
                  {currentLogoUrl ? (
                    <img
                      src={currentLogoUrl}
                      alt="Logo da empresa"
                      className="max-h-28 rounded-2xl object-contain"
                    />
                  ) : (
                    <>
                      <UploadCloud size={36} className="text-cyan-300" />

                      <span className="mt-4 font-semibold text-white">
                        Clique para enviar a logo
                      </span>

                      <span className="mt-2 text-sm text-slate-500">
                        PNG, JPG ou WEBP
                      </span>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoFile}
                  />
                </label>

                {currentLogoUrl && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                    <ImageIcon size={16} />
                    Clique na área acima para trocar a logo.
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-white">
              Descrição pública
            </h3>

            <textarea
              placeholder="Descrição da empresa..."
              value={form.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              className="mt-5 min-h-[130px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-white">Endereço</h3>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Input
                placeholder="Rua / Avenida"
                value={form.street}
                onChange={(event) => updateField('street', event.target.value)}
                className="md:col-span-2"
              />

              <Input
                placeholder="Número"
                value={form.number}
                onChange={(event) => updateField('number', event.target.value)}
              />

              <Input
                placeholder="Bairro"
                value={form.neighborhood}
                onChange={(event) =>
                  updateField('neighborhood', event.target.value)
                }
              />

              <Input
                placeholder="Cidade"
                value={form.city}
                onChange={(event) => updateField('city', event.target.value)}
              />

              <Input
                placeholder="Estado"
                value={form.state}
                onChange={(event) => updateField('state', event.target.value)}
              />

              <Input
                placeholder="CEP"
                value={form.zipCode}
                onChange={(event) => updateField('zipCode', event.target.value)}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <FileText size={22} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Políticas e termos
                </h3>

                <p className="text-sm text-slate-500">
                  Conteúdos usados em OS, recibos e documentos.
                </p>
              </div>
            </div>

            <textarea
              placeholder="Termos de consentimento..."
              value={form.consentTerms}
              onChange={(event) =>
                updateField('consentTerms', event.target.value)
              }
              className="min-h-[140px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
            />

            <textarea
              placeholder="Política de garantia..."
              value={form.warrantyPolicy}
              onChange={(event) =>
                updateField('warrantyPolicy', event.target.value)
              }
              className="mt-5 min-h-[140px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
            />
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <LinkIcon size={22} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Redes sociais
                </h3>

                <p className="text-sm text-slate-500">
                  Links públicos da empresa.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                placeholder="Instagram"
                value={form.instagram}
                onChange={(event) =>
                  updateField('instagram', event.target.value)
                }
              />

              <Input
                placeholder="Facebook"
                value={form.facebook}
                onChange={(event) =>
                  updateField('facebook', event.target.value)
                }
              />

              <Input
                placeholder="TikTok"
                value={form.tiktok}
                onChange={(event) => updateField('tiktok', event.target.value)}
              />

              <Input
                placeholder="Website"
                value={form.website}
                onChange={(event) => updateField('website', event.target.value)}
              />
            </div>
          </Card>

          <Card className="p-6">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateField('isActive', event.target.checked)
                }
                className="h-4 w-4"
              />

              <span>
                <strong className="block text-white">Empresa ativa</strong>
                <small className="text-slate-500">
                  Mantém os dados públicos disponíveis no site.
                </small>
              </span>
            </label>
          </Card>

          {saveMutation.isError && (
            <Card className="border border-red-400/20 bg-red-400/10 p-4">
              <p className="text-sm text-red-200">
                {saveMutation.error.message}
              </p>
            </Card>
          )}

          {saveMutation.isSuccess && (
            <Card className="border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-sm text-emerald-200">
                Configurações salvas com sucesso.
              </p>
            </Card>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={saveMutation.isPending}>
              <Save size={18} />
              {saveMutation.isPending ? 'Salvando...' : 'Salvar configurações'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
