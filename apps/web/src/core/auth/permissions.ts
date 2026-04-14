export type Permission =
  | 'BUYER_ONLY'
  | 'ADMIN_ONLY'
  | 'INVENTORY_ONLY'

export function hasPermission(role: string | null, required?: Permission): boolean {
  if (!required) return true
  if (!role) return false
  if (required === 'BUYER_ONLY') return role === 'BUYER'
  if (required === 'ADMIN_ONLY') return role === 'ADMIN'
  if (required === 'INVENTORY_ONLY') return role === 'INVENTORY_MANAGER'
  return false
}
