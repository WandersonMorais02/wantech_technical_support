import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send } from 'lucide-react'

import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import {
  getChatRoomById,
  listChatMessages,
  sendChatMessage,
} from '../../services/chatService'

function normalizeList(data) {
  return data?.data || data?.items || data?.results || data || []
}

function normalize(data) {
  return data?.data || data || null
}

export function ChatRoomPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')

  const { data: roomData } = useQuery({
    queryKey: ['chat-room', id],
    queryFn: () => getChatRoomById(id),
    enabled: Boolean(id),
  })

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['chat-messages', id],
    queryFn: () => listChatMessages(id),
    enabled: Boolean(id),
    refetchInterval: 5000,
  })

  const room = normalize(roomData)
  const messages = [...normalizeList(data)].reverse()

  const sendMutation = useMutation({
    mutationFn: () =>
      sendChatMessage({
        room: id,
        type: 'TEXT',
        content: message.trim(),
      }),
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['chat-messages', id] })
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
    },
  })

  function handleSubmit(event) {
    event.preventDefault()

    if (!message.trim() || sendMutation.isPending) return

    sendMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/chat"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <h2 className="mt-3 text-3xl font-black">
          {room?.name || 'Conversa'}
        </h2>

        <p className="mt-2 text-slate-400">
          Atendimento pelo site.
        </p>
      </div>

      <Card className="flex min-h-[520px] flex-col p-4">
        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
          {isLoading && (
            <p className="text-sm text-slate-500">
              Carregando mensagens...
            </p>
          )}

          {isError && (
            <p className="text-sm text-red-300">
              {error.message}
            </p>
          )}

          {!isLoading && !isError && messages.length === 0 && (
            <p className="text-sm text-slate-500">
              Nenhuma mensagem ainda.
            </p>
          )}

          {messages.map((item) => {
            const isMine =
              item.sender?.role === 'ADMIN' ||
              item.sender?.role === 'ATTENDANT' ||
              item.sender?.role === 'TECHNICIAN'

            return (
              <div
                key={item.id || item._id}
                className={`flex ${
                  isMine ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm ${
                    isMine
                      ? 'bg-cyan-400 text-slate-950'
                      : 'bg-white/10 text-slate-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {item.content}
                  </p>

                  <span
                    className={`mt-2 block text-xs ${
                      isMine ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {item.sender?.name || 'Cliente'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex gap-3 border-t border-white/10 pt-4"
        >
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Digite sua resposta..."
            className="h-12 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60"
          />

          <Button type="submit" disabled={sendMutation.isPending}>
            <Send size={18} />
            Enviar
          </Button>
        </form>
      </Card>
    </div>
  )
}
