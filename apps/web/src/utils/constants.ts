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
  VEGETABLE: '蔬菜种子',
  FLOWER: '花卉种子',
  HERB: '草本植物',
  SUCCULENT: '多肉植物',
  TOOL: '种植工具',
  FERTILIZER: '营养肥料',
}

export const DEFAULT_WARNING_THRESHOLD = 5
export const GEO_TIMEOUT_MS = 8000
export const GEO_MAX_AGE_MS = 600000
