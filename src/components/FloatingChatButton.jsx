import { useEffect, useMemo, useState } from 'react'
import { Bot, MessageCircle, Send, X } from 'lucide-react'

import { Button } from './Button'
import { Input } from './Input'
import {
  listPublicChatMessages,
  sendPublicChatMessage,
  startPublicChat,
} from '../services/publicChatService'

const STORAGE_KEY = 'wantech_public_chat_token'

const initialMessages = [
  {
    id: 'welcome',
    from: 'bot',
    text: 'Olá! Sou o assistente da Wantech. Para iniciar atendimento, informe seu nome, telefone e mensagem.',
  },
]

function normalizeMessages(data) {
  return data?.data || data?.items || data?.results || data || []
}

function mapApiMessage(message) {
  if (message.type === 'BOT') {
    return {
      id: message.id || message._id,
      from: 'bot',
      author: 'Bot',
      text: message.content,
      createdAt: message.createdAt,
    }
  }

  if (message.sender) {
    return {
      id: message.id || message._id,
      from: 'attendant',
      author: message.sender.name || 'Atendente',
      text: message.content,
      createdAt: message.createdAt,
    }
  }

  return {
    id: message.id || message._id,
    from: 'user',
    author: 'Você',
    text: message.content,
    createdAt: message.createdAt,
  }
}

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [messages, setMessages] = useState(initialMessages)
  const [message, setMessage] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const hasStarted = Boolean(token)

  const orderedMessages = useMemo(
    () =>
      [...messages].sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }),
    [messages],
  )

  useEffect(() => {
    if (!isOpen || !token) return

    let active = true

    async function loadMessages() {
      try {
        const response = await listPublicChatMessages(token)

        if (!active) return

        const apiMessages = normalizeMessages(response).map(mapApiMessage)

        setMessages(apiMessages.length > 0 ? apiMessages : initialMessages)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        setToken('')
        setMessages(initialMessages)
      }
    }

    loadMessages()

    const interval = setInterval(loadMessages, 5000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [isOpen, token])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!message.trim() || isLoading) return

    setIsLoading(true)

    try {
      if (!token) {
        const response = await startPublicChat({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          message: message.trim(),
        })

        localStorage.setItem(STORAGE_KEY, response.token)
        setToken(response.token)

        const apiMessages = normalizeMessages(response.messages).map(mapApiMessage)
        setMessages(apiMessages)
      } else {
        const sentMessage = await sendPublicChatMessage(token, {
          message: message.trim(),
        })

        const newMessages = []

        if (sentMessage.message) {
          newMessages.push(
            mapApiMessage(sentMessage.message)
          )
        }

        if (sentMessage.bot) {
          newMessages.push(
            mapApiMessage(sentMessage.bot)
          )
        }

        if (
          !sentMessage.message &&
          !sentMessage.bot
        ) {
          newMessages.push(
            mapApiMessage(sentMessage)
          )
        }

        setMessages((current) => [
          ...current,
          ...newMessages,
        ])
      }

      setMessage('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-[70] w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/40 md:right-6">
          <header className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                <Bot size={22} />
              </div>

              <div>
                <strong className="block text-sm text-white">
                  Atendimento Wantech
                </strong>
                <span className="text-xs text-emerald-300">
                  Online agora
                </span>
              </div>
            </div>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </button>
          </header>

          <div className="h-80 space-y-3 overflow-y-auto p-4">
            {orderedMessages.map((item, index) => (
              <div
                key={item.id || `${item.from}-${index}`}
                className={
                  item.from === 'user'
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }
              >
                <p
                  className={
                    item.from === 'user'
                      ? 'max-w-[80%] rounded-2xl bg-cyan-400 px-4 py-3 text-sm text-slate-950'
                      : 'max-w-[80%] rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-100'
                  }
                >
                  <>
              <span className="mb-1 block text-[11px] font-bold opacity-70">
                {item.author}
              </span>

              {item.text}
            </>
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-2 border-t border-white/10 p-3">
            {!hasStarted && (
              <div className="grid gap-2">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  className="h-11"
                  required
                />

                <Input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Seu telefone"
                  className="h-11"
                  required
                />

                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Seu e-mail opcional"
                  className="h-11"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={
                  hasStarted
                    ? 'Digite sua mensagem...'
                    : 'Como podemos ajudar?'
                }
                className="h-11"
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-11 shrink-0 px-0"
              >
                <Send size={18} />
              </Button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        className="fixed bottom-5 right-4 z-[70] flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-2xl shadow-cyan-500/30 transition hover:scale-105 hover:bg-cyan-300 md:right-6"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Abrir chat"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={28} />}
      </button>
    </>
  )
}
