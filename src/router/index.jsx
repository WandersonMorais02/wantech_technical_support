import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '../layouts/PublicLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'

import { HomePage } from '../pages/HomePage'
import { ShopPage } from '../pages/ShopPage'
import { TrackServiceOrderPage } from '../pages/TrackServiceOrderPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { LoginPage } from '../pages/LoginPage'

import { DashboardPage } from '../pages/DashboardPage'
import { ServiceOrdersPage } from '../pages/admin/ServiceOrdersPage'
import { ServiceOrderDetailsPage } from '../pages/admin/ServiceOrderDetailsPage'
import { ClientsPage } from '../pages/admin/ClientsPage'
import { ProductsPage } from '../pages/admin/ProductsPage'
import { OrdersPage } from '../pages/admin/OrdersPage'
import { PaymentsPage } from '../pages/admin/PaymentsPage'
import { SettingsPage } from '../pages/admin/SettingsPage'
import { ProductDetailsPage } from '../pages/ProductDetailsPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { OrderResultPage } from '../pages/OrderResultPage'
import { BotPage } from '../pages/admin/BotPage'
import { IATrainingPage } from '../pages/admin/IATrainingPage'
import { ChatRoomPage } from '../pages/admin/ChatRoomPage'
import { ChatWorkspacePage } from '../pages/admin/ChatWorkspacePage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/loja" element={<ShopPage />} />
          <Route path="/acompanhar" element={<TrackServiceOrderPage />} />
          <Route path="/produto/:slug" element={<ProductDetailsPage />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/pedido/sucesso/:id"
            element={<OrderResultPage status="sucesso" />}
          />

          <Route
            path="/pedido/falha/:id"
            element={<OrderResultPage status="falha" />}
          />

          <Route
            path="/pedido/pendente/:id"
            element={<OrderResultPage status="pendente" />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="servicos" element={<ServiceOrdersPage />} />
            <Route path="servicos/:id" element={<ServiceOrderDetailsPage />} />
            <Route path="servicos/:id" element={<ServiceOrderDetailsPage />} />
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="produtos" element={<ProductsPage />} />
            <Route path="pedidos" element={<OrdersPage />} />
            <Route path="pagamentos" element={<PaymentsPage />} />
            <Route path="chat" element={<ChatWorkspacePage />} />
            <Route path="bot" element={<BotPage />} />
            <Route path="ia-training" element={<IATrainingPage />} />
            <Route path="chat/:id" element={<ChatRoomPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
