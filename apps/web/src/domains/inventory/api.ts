import { http } from '../../core/http/client'

export interface InventoryStaffProfile {
  id: number
  username: string
  role: 'BUYER' | 'ADMIN' | 'INVENTORY_MANAGER'
  nickname: string | null
  gender: string | null
  phone: string | null
  avatarDataUrl: string | null
}

export async function fetchInventoryItems() {
  return await http.get('/api/inventory/items') as any[]
}

export async function fetchInventoryWarnings() {
  return await http.get('/api/inventory/warnings') as any[]
}

export async function updateWarningThreshold(productId: number, warningThreshold: number) {
  return http.patch('/api/inventory/warnings', { productId, warningThreshold })
}

export async function inboundStock(payload: { productId: number; quantity: number; note: string }) {
  return http.post('/api/inventory/inbound', payload)
}

export async function fetchInventoryMovements() {
  return await http.get('/api/inventory/movements') as any[]
}

export async function fetchInventoryOrders() {
  return await http.get('/api/inventory/orders') as any[]
}

export async function shipInventoryOrder(orderId: number, payload: { trackingNo?: string }) {
  return http.patch(`/api/inventory/orders/${orderId}/ship`, payload)
}

export async function batchShipInventoryOrders(payload: { orderIds: number[] }) {
  return http.patch('/api/inventory/orders/batch-ship', payload)
}

export async function updateInventoryOrderLogistics(orderId: number, payload: { shippingStatus: string }) {
  return http.patch(`/api/inventory/orders/${orderId}/logistics`, payload)
}

export async function fetchInventoryAnalytics() {
  return await http.get('/api/inventory/analytics') as {
    outboundByProduct: { productId: number; sku?: string; name: string; totalQty: number }[]
    dailyTrend: { date: string; inbound: number; outbound: number }[]
    inboundTotalThisMonth: number
    outboundTotalThisMonth: number
    currentTotalStock: number
  }
}

export async function fetchMyProfile() {
  return await http.get('/api/profile/me') as InventoryStaffProfile
}

export async function updateMyProfile(payload: Partial<Pick<InventoryStaffProfile, 'username' | 'gender' | 'phone' | 'avatarDataUrl'>>) {
  return await http.put('/api/profile/me', payload) as InventoryStaffProfile
}
