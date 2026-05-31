import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, RefreshCcw } from 'lucide-react'

import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { listChatRooms } from '../../services/chatService'

function normalizeList(data) {
  return data?.data || data?.items || data?.results || data || []
}

function getEntityId(entity) {
  return entity?.id || entity?._id || ''
}

export function ChatPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: listChatRooms,
    refetchInterval: 5000,
  })

  const rooms = normalizeList(data)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Atendimento
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Chat
          </h2>

          <p className="mt-2 text-slate-400">
            Conversas recebidas pelo site e atendimento interno.
          </p>
        </div>

        <Button variant="secondary" onClick={() => refetch()}>
          <RefreshCcw size={18} />
          Atualizar
        </Button>
      </div>

      {isLoading && (
        <Card className="p-6 text-slate-400">
          Carregando conversas...
        </Card>
      )}

      {isError && (
        <Card className="border border-red-400/20 bg-red-400/10 p-6 text-red-200">
          {error.message}
        </Card>
      )}

      {!isLoading && !isError && rooms.length === 0 && (
        <Card className="p-6 text-slate-400">
          Nenhuma conversa encontrada.
        </Card>
      )}

      <div className="grid gap-3">
        {rooms.map((room) => {
          const roomId = getEntityId(room)

          return (
            <Link
              key={roomId}
              to={`/admin/chat/${roomId}`}
              className="block"
            >
              <Card className="p-5 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <MessageCircle size={20} />
                  </div>

                  <div>
                    <strong className="block text-white">
                      {room.name || 'Conversa'}
                    </strong>

                    <span className="text-sm text-slate-500">
                      {room.type || 'CHAT'}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
