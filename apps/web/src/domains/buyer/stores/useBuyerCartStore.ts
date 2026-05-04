import { defineStore } from 'pinia'
import type { Product } from '../api'
import {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  type CartItemDto
} from '../api'

export interface BuyerCartItem {
  id: number
  sku: string
  name: string
  description: string
  price: number
  category: string
  plantingMonth: string
  suitableRegion: string
  imageUrl: string
  onlineStock: number
  quantity: number
}

function toCartItem(dto: CartItemDto): BuyerCartItem {
  return {
    id: dto.productId,
    sku: dto.sku,
    name: dto.name,
    description: dto.description,
    price: dto.price,
    category: dto.category,
    plantingMonth: dto.plantingMonth,
    suitableRegion: dto.suitableRegion,
    imageUrl: dto.imageUrl,
    onlineStock: dto.onlineStock,
    quantity: dto.quantity
  }
}

export const useBuyerCartStore = defineStore('buyer-cart', {
  state: () => ({
    items: [] as BuyerCartItem[],
    loaded: false
  }),
  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    uniqueCount: (state) => state.items.length,
    totalAmount: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    isEmpty: (state) => state.items.length === 0
  },
  actions: {
    async loadCart() {
      try {
        const dtos = await fetchCart()
        this.items = dtos.map(toCartItem)
        this.loaded = true
      } catch {
        this.items = []
        this.loaded = false
      }
    },
    syncProduct(product: Product) {
      const current = this.items.find((item) => item.id === product.id)
      if (!current) return

      current.sku = product.sku
      current.name = product.name
      current.description = product.description
      current.price = product.price
      current.category = product.category
      current.plantingMonth = product.plantingMonth
      current.suitableRegion = product.suitableRegion
      current.imageUrl = product.imageUrl
      current.onlineStock = product.onlineStock
      if (current.quantity > product.onlineStock && product.onlineStock > 0) {
        current.quantity = product.onlineStock
      }
    },
    async addItem(product: Product, quantity = 1) {
      const safeQuantity = Math.max(1, Number(quantity) || 1)
      const existed = this.items.find((item) => item.id === product.id)

      if (existed) {
        const newQty = Math.max(
          1,
          Math.min(existed.quantity + safeQuantity, Math.max(1, product.onlineStock || 1))
        )
        await updateCartItem(product.id, newQty)
      } else {
        await addCartItem(product.id, Math.min(safeQuantity, Math.max(1, product.onlineStock || 1)))
      }
      await this.loadCart()
    },
    async setQuantity(productId: number, quantity: number) {
      const item = this.items.find((entry) => entry.id === productId)
      if (!item) return

      const safeQuantity = Math.max(1, Math.min(Number(quantity) || 1, Math.max(1, item.onlineStock || 1)))
      await updateCartItem(productId, safeQuantity)
      await this.loadCart()
    },
    async increase(productId: number) {
      const item = this.items.find((entry) => entry.id === productId)
      if (!item) return
      await this.setQuantity(productId, item.quantity + 1)
    },
    async decrease(productId: number) {
      const item = this.items.find((entry) => entry.id === productId)
      if (!item) return
      if (item.quantity <= 1) {
        await this.removeItem(productId)
        return
      }
      await this.setQuantity(productId, item.quantity - 1)
    },
    async removeItem(productId: number) {
      await removeCartItem(productId)
      await this.loadCart()
    },
    async clear() {
      await clearCart()
      this.items = []
    },
    buildOrderPayload() {
      return this.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity
      }))
    }
  }
})
