export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '-'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '-'
  const yyyy = d.getFullYear()
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`
}

export function formatPrice(value: number | string | null | undefined): string {
  if (value == null) return '0.00'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) return '0.00'
  return num.toFixed(2)
}

export function renderStars(rating: number | null | undefined): string {
  const r = Math.max(0, Math.min(5, Math.round(rating || 0)))
  return '★'.repeat(r) + '☆'.repeat(5 - r)
}

export function hasDisplayImage(product: { imageUrl?: string | null } | string | null | undefined): boolean {
  const url = typeof product === 'string' ? product : product?.imageUrl
  return Boolean(url && /^https?:\/\//i.test(url))
}
