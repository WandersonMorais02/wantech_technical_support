import { useState } from 'react'
import { Bot, MessageCircle, Send, X } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'

const initialMessages = [
  {
    from: 'bot',
    text: 'Olá! Sou o assistente da Wantech. Posso ajudar a consultar serviço, tirar dúvidas ou chamar um atendente.',
  },
]

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (!message.trim()) return

    setMessages((current) => [
      ...current,
      {
        from: 'user',
        text: message,
      },
      {
        from: 'bot',
        text: 'Entendi. No próximo passo vamos conectar este chat à API do bot e também preparar atendimento humano.',
      },
    ])

    setMessage('')
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
                  Assistente Wantech
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
            {messages.map((item, index) => (
              <div
                key={`${item.from}-${index}`}
                className={item.from === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                <p
                  className={
                    item.from === 'user'
                      ? 'max-w-[80%] rounded-2xl bg-cyan-400 px-4 py-3 text-sm text-slate-950'
                      : 'max-w-[80%] rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-100'
                  }
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 p-3">
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Digite sua mensagem..."
              className="h-11"
            />

            <Button type="submit" className="h-11 w-11 shrink-0 px-0">
              <Send size={18} />
            </Button>
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
