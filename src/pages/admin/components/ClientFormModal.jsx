import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { Modal } from '../../../components/Modal'
import { createClient, updateClient } from '../../../services/clientService'

const initialForm = {
  name: '',
  phone: '',
  email: '',
  cpf: '',
}

function getEntityId(entity) {
  if (typeof entity?._id === 'string') return entity._id
  if (typeof entity?.id === 'string') return entity.id
  return ''
}

function buildInitialForm(client) {
  if (!client) return initialForm

  return {
    name: client.name || '',
    phone: client.phone || '',
    email: client.email || '',
    cpf: client.cpf || '',
  }
}

export function ClientFormModal({ isOpen, onClose, client }) {
  if (!isOpen) return null

  return (
    <ClientForm
      key={client ? getEntityId(client) : 'new-client'}
      isOpen={isOpen}
      onClose={onClose}
      client={client}
    />
  )
}

function ClientForm({ isOpen, onClose, client }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(() => buildInitialForm(client))

  const isEditing = Boolean(client)

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        cpf: form.cpf.trim() || undefined,
      }

      if (isEditing) {
        return updateClient(getEntityId(client), payload)
      }

      return createClient(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
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
      title={isEditing ? 'Editar cliente' : 'Novo cliente'}
      description="Cadastre ou atualize os dados do cliente."
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          placeholder="Nome completo"
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
          required
        />

        <Input
          placeholder="Telefone / WhatsApp"
          value={form.phone}
          onChange={(event) => updateField('phone', event.target.value)}
          required
        />

        <Input
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
        />

        <Input
          placeholder="CPF"
          value={form.cpf}
          onChange={(event) => updateField('cpf', event.target.value)}
        />

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
                : 'Criar cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
