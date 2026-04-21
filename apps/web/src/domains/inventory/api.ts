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
  const res = await http.get('/api/inventory/items') as { data: any[] }
  return res.data
}

export async function fetchInventoryWarnings() {
  const res = await http.get('/api/inventory/warnings') as { data: any[] }
  return res.data
}

export async function updateWarningThreshold(productId: number, warningThreshold: number) {
  return http.patch('/api/inventory/warnings', { productId, warningThreshold })
}

export async function inboundStock(payload: { productId: number; quantity: number; note: string }) {
  return http.post('/api/inventory/inbound', payload)
}

export async function fetchInventoryMovements() {
  const res = await http.get('/api/inventory/movements') as { data: any[] }
  return res.data
}

export async function fetchInventoryOrders() {
  const res = await http.get('/api/inventory/orders') as { data: any[] }
  return res.data
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

export async function fetchMyProfile() {
  const res = await http.get('/api/profile/me') as { data: InventoryStaffProfile }
  return res.data
}

export async function updateMyProfile(payload: Partial<Pick<InventoryStaffProfile, 'username' | 'gender' | 'phone' | 'avatarDataUrl'>>) {
  const res = await http.put('/api/profile/me', payload) as { data: InventoryStaffProfile }
  return res.data
}
