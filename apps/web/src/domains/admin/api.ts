import { http } from '../../core/http/client'

export interface AdminAnnouncement {
  id: number
  title: string
  content: string
  status: string
  publishedAt: string | null
  createdAt: string | null
}

export interface AdminPromotion {
  id: number
  title: string
  strategyType: string
  description: string
  imageUrl: string | null
  status: string
  createdAt: string | null
}

export interface AdminPromotionPost {
  id: number
  promotionId: number
  channel: string
  content: string
  imageUrl: string | null
  postStatus: string
  publishedAt: string | null
  createdAt: string | null
}

export interface AdminTutorial {
  id: number
  displayArea: string
  displayOrder: number
  tag: string
  categoryCode: string | null
  title: string
  description: string
  difficulty: string | null
  durationMinutes: number | null
  backgroundStyle: string | null
  mediaUrl: string | null
  mediaType: 'IMAGE' | 'VIDEO' | null
  detailVideoUrl: string | null
  favoriteDefault: boolean
  published: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface AdminProduct {
  id: number
  sku: string
  name: string
  description: string
  price: number
  status: string
  category: string
  variety: string
  plantingMonth: string
  suitableRegion: string
  origin: string
  germinationRate: number
  imageUrl: string
  onlineStock: number
}

export interface AdminOrderListItem {
  id: number
  orderNo: string
  status: string
  totalAmount: number
  buyerId: number
  buyerUsername: string | null
  shippingStatus: string | null
  createdAt: string | null
  shippedAt: string | null
}

export interface AdminOrderDetailItem {
  productId: number
  productName: string
  price: number
  quantity: number
  lineTotal: number
}

export interface AdminOrderReviewItem {
  id: number
  productId: number
  productName: string
  orderId: number | null
  buyerId: number
  buyerUsername: string
  rating: number
  content: string
  createdAt: string | null
}

export interface AdminOrderDetail {
  id: number
  orderNo: string
  status: string
  totalAmount: number
  buyerId: number
  buyerUsername: string | null
  shippingStatus: string | null
  createdAt: string | null
  shippedAt: string | null
  items: AdminOrderDetailItem[]
  reviews: AdminOrderReviewItem[]
}

export interface StaffProfile {
  id: number
  username: string
  role: 'BUYER' | 'ADMIN' | 'INVENTORY_MANAGER'
  nickname: string | null
  gender: string | null
  phone: string | null
  avatarDataUrl: string | null
}

export interface SalesOverviewRow {
  productId: number
  name: string
  category: string
  sales: number
}

export interface SalesOverview {
  totalOrders: number
  totalUnits: number
  grossSales: number
  avgOrder: number
  topCategory: string
  totalProducts: number
  top10: SalesOverviewRow[]
  slowMoving: SalesOverviewRow[]
}

export async function fetchSalesOverview() {
  const res = await http.get('/api/admin/reports/sales/overview') as { data: SalesOverview }
  return res.data
}

export async function fetchAnnouncements() {
  const res = await http.get('/api/announcements') as { data: AdminAnnouncement[] }
  return res.data
}

export async function createAnnouncement(payload: { title: string; content: string }) {
  return http.post('/api/admin/announcements', payload)
}

export async function updateAnnouncement(id: number, payload: { title: string; content: string }) {
  return http.put(`/api/admin/announcements/${id}`, payload)
}

export async function deleteAnnouncement(id: number) {
  return http.delete(`/api/admin/announcements/${id}`)
}

export async function createProduct(payload: {
  sku: string
  name: string
  description: string
  price: number
  category: string
  variety: string
  plantingMonth: string
  suitableRegion: string
  origin: string
  germinationRate: number
  imageUrl: string
  initialStock: number
}) {
  return http.post('/api/admin/products', payload)
}

export async function fetchAdminProducts() {
  const res = await http.get('/api/admin/products') as { data: AdminProduct[] }
  return res.data
}

export async function updateProduct(
  id: number,
  payload: {
    sku: string
    name: string
    description: string
    price: number
    category: string
    variety: string
    plantingMonth: string
    suitableRegion: string
    origin: string
    germinationRate: number
    imageUrl: string
    initialStock: number
  }
) {
  return http.put(`/api/admin/products/${id}`, payload)
}

export async function updateProductStatus(id: number, status: string) {
  return http.patch(`/api/admin/products/${id}/status`, { status })
}

export async function fetchPromotions() {
  const res = await http.get('/api/promotions') as { data: AdminPromotion[] }
  return res.data
}

export async function createPromotion(payload: {
  title: string
  strategyType: string
  description: string
  imageUrl: string
}) {
  return http.post('/api/admin/promotions', payload)
}

export async function updatePromotion(
  id: number,
  payload: {
    title: string
    strategyType: string
    description: string
    imageUrl: string
  }
) {
  return http.put(`/api/admin/promotions/${id}`, payload)
}

export async function deletePromotion(id: number) {
  return http.delete(`/api/admin/promotions/${id}`)
}

export async function fetchPromotionPosts() {
  const res = await http.get('/api/promotion-posts') as { data: AdminPromotionPost[] }
  return res.data
}

export async function createPromotionPost(payload: { promotionId: number; channel: string; content: string; imageUrl?: string | null }) {
  return http.post('/api/admin/promotion-posts', payload)
}

export async function updatePromotionPost(id: number, payload: { promotionId: number; channel: string; content: string; imageUrl?: string | null }) {
  return http.put(`/api/admin/promotion-posts/${id}`, payload)
}

export async function deletePromotionPost(id: number) {
  return http.delete(`/api/admin/promotion-posts/${id}`)
}

export async function fetchAdminTutorials() {
  const res = await http.get('/api/admin/tutorials') as { data: AdminTutorial[] }
  return res.data
}

export async function createTutorial(payload: {
  displayArea: string
  displayOrder: number
  tag: string
  categoryCode: string
  title: string
  description: string
  difficulty: string
  durationMinutes: number | null
  backgroundStyle: string
  mediaUrl: string | null
  mediaType: 'IMAGE' | 'VIDEO' | null
  detailVideoUrl: string | null
  favoriteDefault: boolean
  published: boolean
}) {
  return http.post('/api/admin/tutorials', payload)
}

export async function updateTutorial(
  id: number,
  payload: {
    displayArea: string
    displayOrder: number
    tag: string
    categoryCode: string
    title: string
    description: string
    difficulty: string
    durationMinutes: number | null
    backgroundStyle: string
    mediaUrl: string | null
    mediaType: 'IMAGE' | 'VIDEO' | null
    detailVideoUrl: string | null
    favoriteDefault: boolean
    published: boolean
  }
) {
  return http.put(`/api/admin/tutorials/${id}`, payload)
}

export async function deleteTutorial(id: number) {
  return http.delete(`/api/admin/tutorials/${id}`)
}

export async function fetchAdminOrders() {
  const res = await http.get('/api/admin/orders') as { data: AdminOrderListItem[] }
  return res.data
}

export async function fetchAdminOrderDetail(orderId: number) {
  const res = await http.get(`/api/admin/orders/${orderId}`) as { data: AdminOrderDetail }
  return res.data
}

export async function fetchMyProfile() {
  const res = await http.get('/api/profile/me') as { data: StaffProfile }
  return res.data
}

export async function updateMyProfile(payload: Partial<Pick<StaffProfile, 'username' | 'gender' | 'phone' | 'avatarDataUrl'>>) {
  const res = await http.put('/api/profile/me', payload) as { data: StaffProfile }
  return res.data
}
