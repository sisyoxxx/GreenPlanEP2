import { http } from '../../core/http/client'

export async function fetchSalesOverview() {
  const res = await http.get('/api/admin/reports/sales/overview') as { data: any }
  return res.data
}

export async function fetchAnnouncements() {
  const res = await http.get('/api/announcements') as { data: any[] }
  return res.data
}

export async function createAnnouncement(payload: { title: string; content: string }) {
  return http.post('/api/admin/announcements', payload)
}

export async function createProduct(payload: {
  sku: string
  name: string
  description: string
  price: number
  category: string
  plantingMonth: string
  suitableRegion: string
  imageUrl: string
  initialStock: number
}) {
  return http.post('/api/admin/products', payload)
}

export async function createPromotion(payload: { title: string; strategyType: string; description: string }) {
  return http.post('/api/admin/promotions', payload)
}

export async function createPromotionPost(payload: { promotionId: number; channel: string; content: string }) {
  return http.post('/api/admin/promotion-posts', payload)
}

export async function fetchPromotions() {
  const res = await http.get('/api/promotions') as { data: any[] }
  return res.data
}
