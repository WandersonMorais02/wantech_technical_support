import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, CreditCard } from 'lucide-react'

import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Container } from '../components/Container'
import { Input } from '../components/Input'
import { createCheckoutOrder } from '../services/orderService'
import { useCartStore } from '../store/cartStore'

const initialForm = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',

  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  notes: '',
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function normalize(data) {
  return data?.data || data
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)

  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const getCheckoutItems = useCartStore((state) => state.getCheckoutItems)
  const clearCart = useCartStore((state) => state.clearCart)

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const checkoutMutation = useMutation({
    mutationFn: () =>
      createCheckoutOrder({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerEmail: form.customerEmail.trim(),
        notes: form.notes.trim() || undefined,
        shippingAddress: {
          zipCode: form.zipCode.trim(),
          street: form.street.trim(),
          number: form.number.trim(),
          complement: form.complement.trim() || undefined,
          neighborhood: form.neighborhood.trim(),
          city: form.city.trim(),
          state: form.state.trim().toUpperCase(),
        },
        items: getCheckoutItems(),
      }),
    onSuccess: (data) => {
      const order = normalize(data)

      if (order?.checkoutUrl) {
        clearCart()
        window.location.href = order.checkoutUrl
        return
      }

      navigate(`/pedido/pendente/${order.id}`)
    },
  })

  function handleSubmit(event) {
    event.preventDefault()

    if (items.length === 0) {
      navigate('/carrinho')
      return
    }

    checkoutMutation.mutate()
  }

  return (
    <main className="py-16">
      <Container>
        <Link
          to="/carrinho"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
        >
          <ArrowLeft size={18} />
          Voltar para carrinho
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6">
              <h1 className="text-3xl font-black text-white">
                Finalizar compra
              </h1>

              <p className="mt-2 text-slate-400">
                Informe seus dados para gerar o pagamento.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Nome completo"
                  value={form.customerName}
                  onChange={(event) =>
                    updateField('customerName', event.target.value)
                  }
                  required
                />

                <Input
                  placeholder="Telefone / WhatsApp"
                  value={form.customerPhone}
                  onChange={(event) =>
                    updateField('customerPhone', event.target.value)
                  }
                  required
                />

                <Input
                  type="email"
                  placeholder="E-mail"
                  value={form.customerEmail}
                  onChange={(event) =>
                    updateField('customerEmail', event.target.value)
                  }
                  required
                  className="md:col-span-2"
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-white">
                Endereço de entrega
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="CEP"
                  value={form.zipCode}
                  onChange={(event) => updateField('zipCode', event.target.value)}
                  required
                />

                <Input
                  placeholder="Rua"
                  value={form.street}
                  onChange={(event) => updateField('street', event.target.value)}
                  required
                />

                <Input
                  placeholder="Número"
                  value={form.number}
                  onChange={(event) => updateField('number', event.target.value)}
                  required
                />

                <Input
                  placeholder="Complemento"
                  value={form.complement}
                  onChange={(event) =>
                    updateField('complement', event.target.value)
                  }
                />

                <Input
                  placeholder="Bairro"
                  value={form.neighborhood}
                  onChange={(event) =>
                    updateField('neighborhood', event.target.value)
                  }
                  required
                />

                <Input
                  placeholder="Cidade"
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  required
                />

                <Input
                  placeholder="UF"
                  maxLength={2}
                  value={form.state}
                  onChange={(event) => updateField('state', event.target.value)}
                  required
                />
              </div>

              <textarea
                placeholder="Observações do pedido..."
                value={form.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                className="mt-4 min-h-[110px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10"
              />
            </Card>

            {checkoutMutation.isError && (
              <Card className="border border-red-400/20 bg-red-400/10 p-4">
                <p className="text-sm text-red-200">
                  {checkoutMutation.error.message}
                </p>
              </Card>
            )}

            <Button
              type="submit"
              disabled={checkoutMutation.isPending || items.length === 0}
              className="w-full"
            >
              <CreditCard size={18} />
              {checkoutMutation.isPending
                ? 'Gerando pagamento...'
                : 'Pagar com Mercado Pago'}
            </Button>
          </form>

          <Card className="h-fit p-6">
            <h2 className="text-xl font-bold text-white">
              Resumo do pedido
            </h2>

            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between gap-4 border-b border-white/10 pb-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-slate-500">Qtd: {item.quantity}</p>
                  </div>

                  <strong className="text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-between">
              <span className="font-bold text-white">Total</span>
              <strong className="text-2xl text-white">
                {formatCurrency(subtotal)}
              </strong>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  )
}
