import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Wrench,
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  Bot,
  Settings,
  MessageCircle,
  BrainCircuit,
  LogOut,
} from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/Button'

const links = [
  { label: 'Resumo', to: '/admin', icon: LayoutDashboard },
  { label: 'Serviços', to: '/admin/servicos', icon: Wrench },
  { label: 'Clientes', to: '/admin/clientes', icon: Users },
  { label: 'Produtos', to: '/admin/produtos', icon: Package },
  { label: 'Pedidos', to: '/admin/pedidos', icon: ShoppingBag },
  { label: 'Pagamentos', to: '/admin/pagamentos', icon: CreditCard },

  { label: 'Chat', to: '/admin/chat', icon: MessageCircle },
  { label: 'Bot', to: '/admin/bot', icon: Bot },
  { label: 'IA Training', to: '/admin/ia-training', icon: BrainCircuit },

  { label: 'Configurações', to: '/admin/configuracoes', icon: Settings },
]

export function DashboardLayout() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/10 bg-slate-950/95 p-4 lg:block">
        <div className="rounded-3xl bg-cyan-400 p-4 text-slate-950">
          <strong className="block text-lg">WanTech</strong>
          <span className="text-sm font-medium">
            Painel administrativo
          </span>
        </div>

        <nav className="mt-6 space-y-2">
          {links.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  isActive
                    ? 'flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950'
                    : 'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white'
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Painel</p>
              <h1 className="text-xl font-black">Dashboard</h1>
            </div>

            <Button
              variant="secondary"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Sair
            </Button>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
