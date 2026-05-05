export const ORDER_STATUS_MAP: Record<string, string> = {
  PENDING: '待支付',
  PAID: '待发货',
  SHIPPED: '运输中',
  DELIVERED: '已收货',
}

export const SHIPPING_STATUS_MAP: Record<string, string> = {
  PENDING: '待发货',
  SHIPPED: '已发货',
  IN_TRANSIT: '运输中',
  DELIVERED: '已送达',
}

export const ORDER_STATUS_CLASS: Record<string, string> = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
}

export const CATEGORY_MAP: Record<string, string> = {
  seed: '种子种苗',
  fertilizer: '肥料营养',
  tool: '园艺工具',
  pest: '病虫防治',
  pot: '花盆基质',
  smart: '智能设备',
}

export const DEFAULT_WARNING_THRESHOLD = 5
export const GEO_TIMEOUT_MS = 8000
export const GEO_MAX_AGE_MS = 600000
