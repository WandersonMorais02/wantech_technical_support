import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X, Cpu } from 'lucide-react'
// import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { FloatingChatButton } from '../components/FloatingChatButton'
import { useQuery } from '@tanstack/react-query'
import { getCompany } from '../services/companyService'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Loja', to: '/loja' },
  { label: 'Acompanhar OS', to: '/acompanhar' },
]

export function PublicLayout() {
  const [isOpen, setIsOpen] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())

  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: getCompany,
  })

  const linkClass = ({ isActive }) =>
    isActive
      ? 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950'
      : 'rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white'

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <Container className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
              <Cpu size={24} />
            </div>

            <div>
              <strong className="block text-sm leading-none">
                {company?.name || 'Wantech Assistência'}
              </strong>
              <span className="text-xs text-slate-400">
                {company?.city && company?.state
                ? `${company.city} - ${company.state}`
                : 'Assistência técnica'}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
            {links.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* <div className="hidden md:block">
            <Link to="/acompanhar">
              <Button>Acompanhar OS</Button>
            </Link>
          </div>*/}

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 md:hidden"
            onClick={() => setIsOpen(true)}
          >
            <Menu />
          </button>

          <Link
            to="/carrinho"
            className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <ShoppingCart size={18} />
            Carrinho

            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-cyan-400 px-2 text-xs font-black text-slate-950">
                {totalItems}
              </span>
            )}
          </Link>
        </Container>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950 p-4 md:hidden">
          <div className="flex items-center justify-between">
            <strong>Menu</strong>

            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
              onClick={() => setIsOpen(false)}
            >
              <X />
            </button>
          </div>

          <nav className="mt-8 grid gap-3">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 font-semibold text-white"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      <Outlet />

      <FloatingChatButton />

      <footer className="border-t border-white/10 py-8">
        <Container className="flex flex-col justify-between gap-4 text-sm text-slate-400 md:flex-row">
          <p>© 2026 Wantech Assistência. Todos os direitos reservados.</p>
          <p>Assistência técnica, loja e atendimento inteligente.</p>
        </Container>
      </footer>
    </div>
  )
}
