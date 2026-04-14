import { http } from '../../core/http/client'

export interface Product {
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
}

export async function fetchProducts() {
  const res = await http.get('/api/products') as { data: Product[] }
  return res.data
}

export async function createOrder(items: Array<{ productId: number; quantity: number }>) {
  return http.post('/api/orders', { items })
}

export async function fetchMyOrders() {
  const res = await http.get('/api/orders/me') as { data: any[] }
  return res.data
}
