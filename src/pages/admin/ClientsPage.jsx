import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Edit2,
  Mail,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  User,
} from 'lucide-react'

import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { Table } from '../../components/table/Table'
import { TableCell } from '../../components/table/TableCell'
import { TableHead } from '../../components/table/TableHead'
import { TableRow } from '../../components/table/TableRow'

import { deleteClient, listClients } from '../../services/clientService'
import { ClientFormModal } from './components/ClientFormModal'

function normalizeList(data) {
  return data?.data || data?.items || data?.results || data || []
}

function getEntityId(entity) {
  if (typeof entity?._id === 'string') return entity._id
  if (typeof entity?.id === 'string') return entity.id
  return ''
}

function onlyNumbers(value = '') {
  return String(value).replace(/\D/g, '')
}

export function ClientsPage() {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: () =>
      listClients({
        limit: 100,
      }),
  })

  const clients = useMemo(() => normalizeList(data), [data])

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients

    const value = search.toLowerCase()
    const numericValue = onlyNumbers(search)

    return clients.filter((client) => {
      return (
        client.name?.toLowerCase().includes(value) ||
        client.email?.toLowerCase().includes(value) ||
        onlyNumbers(client.phone).includes(numericValue) ||
        onlyNumbers(client.cpf).includes(numericValue)
      )
    })
  }, [clients, search])

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })

  function handleCreate() {
    setSelectedClient(null)
    setIsFormOpen(true)
  }

  function handleEdit(client) {
    setSelectedClient(client)
    setIsFormOpen(true)
  }

  function handleDelete(client) {
    const clientId = getEntityId(client)

    if (!clientId) {
      window.alert('Não foi possível identificar este cliente.')
      return
    }

    const confirmed = window.confirm(
      `Deseja realmente remover o cliente "${client.name}"?`,
    )

    if (confirmed) {
      deleteMutation.mutate(clientId)
    }
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setSelectedClient(null)
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Atendimento
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Clientes
          </h2>

          <p className="mt-2 text-slate-400">
            Gerencie contatos, WhatsApp, e-mail e documentos dos clientes.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => refetch()}>
            <RefreshCcw size={18} />
            Atualizar
          </Button>

          <Button onClick={handleCreate}>
            <Plus size={18} />
            Novo cliente
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
            placeholder="Buscar por nome, telefone, e-mail ou CPF..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-11"
          />
        </div>
      </Card>

      {isLoading && (
        <Card className="mt-6 p-8 text-center">
          <p className="text-slate-400">
            Carregando clientes...
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
                <TableCell head>Cliente</TableCell>
                <TableCell head>Telefone</TableCell>
                <TableCell head>E-mail</TableCell>
                <TableCell head>CPF</TableCell>
                <TableCell head>Ações</TableCell>
              </TableRow>
            </TableHead>

            <tbody>
              {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-slate-500"
                  >
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}

              {filteredClients.map((client, index) => {
                const clientId = getEntityId(client)
                const phoneNumber = onlyNumbers(client.phone)
                const whatsappUrl = phoneNumber
                  ? `https://wa.me/55${phoneNumber}`
                  : ''

                return (
                  <TableRow key={clientId || index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                          <User size={20} />
                        </div>

                        <div>
                          <strong className="block text-white">
                            {client.name || '-'}
                          </strong>

                          <span className="text-xs text-slate-500">
                            {clientId}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {client.phone ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200"
                        >
                          <Phone size={15} />
                          {client.phone}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>

                    <TableCell>
                      {client.email ? (
                        <a
                          href={`mailto:${client.email}`}
                          className="inline-flex items-center gap-2 text-slate-300 hover:text-white"
                        >
                          <Mail size={15} />
                          {client.email}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>

                    <TableCell>
                      {client.cpf || '-'}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          title="Editar"
                          onClick={() => handleEdit(client)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-cyan-400/20 hover:text-cyan-300"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          type="button"
                          title="Excluir"
                          onClick={() => handleDelete(client)}
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

      <ClientFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        client={selectedClient}
      />
    </div>
  )
}
