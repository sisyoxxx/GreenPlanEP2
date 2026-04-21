import { defineStore } from 'pinia'
import type { Product } from '../api'

const STORAGE_KEY = 'gp2_buyer_cart'

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

function safeParseCart(value: string | null): BuyerCartItem[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as BuyerCartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCart(items: BuyerCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function toCartItem(product: Product, quantity = 1): BuyerCartItem {
  return {
    ...product,
    quantity
  }
}

export const useBuyerCartStore = defineStore('buyer-cart', {
  state: () => ({
    items: safeParseCart(localStorage.getItem(STORAGE_KEY))
  }),
  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    uniqueCount: (state) => state.items.length,
    totalAmount: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    isEmpty: (state) => state.items.length === 0
  },
  actions: {
    persist() {
      saveCart(this.items)
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
      this.persist()
    },
    addItem(product: Product, quantity = 1) {
      const safeQuantity = Math.max(1, Number(quantity) || 1)
      const existed = this.items.find((item) => item.id === product.id)

      if (existed) {
        existed.quantity = Math.max(1, Math.min(existed.quantity + safeQuantity, Math.max(1, product.onlineStock || 1)))
        this.syncProduct(product)
        return
      }

      this.items.push(toCartItem(product, Math.min(safeQuantity, Math.max(1, product.onlineStock || 1))))
      this.persist()
    },
    setQuantity(productId: number, quantity: number) {
      const item = this.items.find((entry) => entry.id === productId)
      if (!item) return

      const safeQuantity = Math.max(1, Math.min(Number(quantity) || 1, Math.max(1, item.onlineStock || 1)))
      item.quantity = safeQuantity
      this.persist()
    },
    increase(productId: number) {
      const item = this.items.find((entry) => entry.id === productId)
      if (!item) return
      this.setQuantity(productId, item.quantity + 1)
    },
    decrease(productId: number) {
      const item = this.items.find((entry) => entry.id === productId)
      if (!item) return
      if (item.quantity <= 1) {
        this.removeItem(productId)
        return
      }
      this.setQuantity(productId, item.quantity - 1)
    },
    removeItem(productId: number) {
      this.items = this.items.filter((item) => item.id !== productId)
      this.persist()
    },
    clear() {
      this.items = []
      this.persist()
    },
    buildOrderPayload() {
      return this.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity
      }))
    }
  }
})
