import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function getProductId(product) {
  return product.id || product._id
}

function getProductPrice(product) {
  return Number(product.promotionalPrice || product.price || 0)
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem(product, quantity = 1) {
        const productId = getProductId(product)

        if (!productId) return

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === productId,
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === productId
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                    }
                  : item,
              ),
            }
          }

          return {
            items: [
              ...state.items,
              {
                productId,
                slug: product.slug,
                name: product.name,
                image: product.images?.[0] || null,
                price: getProductPrice(product),
                originalPrice: Number(product.price || 0),
                quantity,
                stock: product.stock ?? 0,
              },
            ],
          }
        })
      },

      removeItem(productId) {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }))
      },

      increaseQuantity(productId) {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity:
                    item.stock && item.quantity >= item.stock
                      ? item.quantity
                      : item.quantity + 1,
                }
              : item,
          ),
        }))
      },

      decreaseQuantity(productId) {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item,
            )
            .filter((item) => item.quantity > 0),
        }))
      },

      clearCart() {
        set({ items: [] })
      },

      getTotalItems() {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal() {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        )
      },

      getCheckoutItems() {
        return get().items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        }))
      },
    }),
    {
      name: 'wantech-cart',
    },
  ),
)
