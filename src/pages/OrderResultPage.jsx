import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Clock, ShoppingBag } from 'lucide-react'

import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Container } from '../components/Container'

const contentByStatus = {
  sucesso: {
    icon: CheckCircle2,
    title: 'Pagamento aprovado',
    description:
      'Recebemos a confirmação do pagamento. Seu pedido será preparado em breve.',
    color: 'text-emerald-300',
    bg: 'bg-emerald-400/10',
  },
  falha: {
    icon: AlertTriangle,
    title: 'Pagamento não concluído',
    description:
      'Não conseguimos confirmar o pagamento. Você pode tentar novamente ou falar conosco.',
    color: 'text-red-300',
    bg: 'bg-red-400/10',
  },
  pendente: {
    icon: Clock,
    title: 'Pagamento pendente',
    description:
      'Seu pedido foi criado, mas o pagamento ainda está em processamento.',
    color: 'text-amber-300',
    bg: 'bg-amber-400/10',
  },
}

export function OrderResultPage({ status = 'pendente' }) {
  const { id } = useParams()
  const content = contentByStatus[status] || contentByStatus.pendente
  const Icon = content.icon

  return (
    <main className="py-20">
      <Container>
        <Card className="mx-auto max-w-2xl p-8 text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] ${content.bg} ${content.color}`}
          >
            <Icon size={38} />
          </div>

          <h1 className="mt-6 text-4xl font-black text-white">
            {content.title}
          </h1>

          <p className="mt-3 text-slate-400">
            {content.description}
          </p>

          {id && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-500">Código do pedido</p>
              <strong className="mt-1 block break-all text-white">{id}</strong>
            </div>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/loja">
              <Button type="button">
                <ShoppingBag size={18} />
                Voltar para loja
              </Button>
            </Link>

            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Falar no WhatsApp
            </a>
          </div>
        </Card>
      </Container>
    </main>
  )
}
