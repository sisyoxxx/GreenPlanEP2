import { http } from '../../core/http/client'

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
