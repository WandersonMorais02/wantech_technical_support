import { useMemo, useState } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { MessageCircle, Send } from 'lucide-react'

import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import {
  listChatMessages,
  listChatRooms,
  sendChatMessage,
} from '../../services/chatService'

function normalizeList(data) {
  return data?.data || data?.items || data?.results || data || []
}

function getEntityId(entity) {
  return entity?.id || entity?._id || ''
}

export function ChatWorkspacePage() {
  const queryClient = useQueryClient()

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [message, setMessage] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: listChatRooms,
    refetchInterval: 5000,
  })

  const rooms = normalizeList(data)
  const selectedRoomId = getEntityId(selectedRoom)

  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chat-messages', selectedRoomId],
    queryFn: () => listChatMessages(selectedRoomId),
    enabled: Boolean(selectedRoomId),
    refetchInterval: 3000,
  })

  const messages = useMemo(
    () =>
      [...normalizeList(messagesData)].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime(),
      ),
    [messagesData],
  )

  const sendMutation = useMutation({
    mutationFn: () =>
      sendChatMessage({
        room: selectedRoomId,
        type: 'TEXT',
        content: message.trim(),
      }),
    onSuccess: () => {
      setMessage('')

      queryClient.invalidateQueries({
        queryKey: ['chat-messages', selectedRoomId],
      })

      queryClient.invalidateQueries({
        queryKey: ['chat-rooms'],
      })
    },
  })

  function handleSendMessage(event) {
    event.preventDefault()

    if (!message.trim() || !selectedRoomId || sendMutation.isPending) return

    sendMutation.mutate()
  }

  return (
    <div className="h-[calc(100vh-180px)]">
      <div className="grid h-full grid-cols-[320px_1fr] gap-4">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-4">
            <h2 className="font-bold text-white">Conversas</h2>
          </div>

          <div className="h-full overflow-y-auto pb-16">
            {isLoading && (
              <p className="p-4 text-sm text-slate-500">
                Carregando...
              </p>
            )}

            {!isLoading && rooms.length === 0 && (
              <p className="p-4 text-sm text-slate-500">
                Nenhuma conversa encontrada.
              </p>
            )}

            {rooms.map((room) => {
              const roomId = getEntityId(room)

              return (
                <button
                  key={roomId}
                  type="button"
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full border-b border-white/5 p-4 text-left transition ${
                    selectedRoomId === roomId
                      ? 'bg-cyan-400/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <strong className="block text-white">
                    {room.name || 'Conversa'}
                  </strong>

                  <span className="text-sm text-slate-500">
                    {room.type || 'CHAT'}
                  </span>
                </button>
              )
            })}
          </div>
        </Card>

        <Card className="flex min-h-0 flex-col overflow-hidden p-0">
          {!selectedRoom ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <MessageCircle
                  size={48}
                  className="mx-auto text-slate-600"
                />

                <h3 className="mt-4 text-xl font-bold">
                  Selecione uma conversa
                </h3>

                <p className="mt-2 text-slate-500">
                  Escolha uma conversa na lateral.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-white/10 p-4">
                <h2 className="font-bold text-white">
                  {selectedRoom.name || 'Conversa'}
                </h2>

                <p className="text-sm text-slate-500">
                  {selectedRoom.type || 'CHAT'}
                </p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {isLoadingMessages && (
                  <p className="text-sm text-slate-500">
                    Carregando mensagens...
                  </p>
                )}

                {!isLoadingMessages && messages.length === 0 && (
                  <p className="text-sm text-slate-500">
                    Nenhuma mensagem nesta conversa.
                  </p>
                )}

                {!isLoadingMessages &&
                  messages.map((item) => {
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
                          className={`max-w-[75%] rounded-3xl px-4 py-3 text-sm ${
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
                              isMine
                                ? 'text-slate-800'
                                : 'text-slate-500'
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
                onSubmit={handleSendMessage}
                className="flex gap-3 border-t border-white/10 p-4"
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
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
