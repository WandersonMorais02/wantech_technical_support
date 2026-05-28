import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Container } from '../components/Container'

export function NotFoundPage() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
        404
      </p>

      <h1 className="mt-3 text-4xl font-black text-white">
        Página não encontrada
      </h1>

      <p className="mt-4 max-w-xl text-slate-300">
        A página que você tentou acessar não existe ou foi movida.
      </p>

      <Link to="/" className="mt-8">
        <Button>Voltar para o início</Button>
      </Link>
    </Container>
  )
}
