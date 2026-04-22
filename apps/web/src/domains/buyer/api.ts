import { http } from '../../core/http/client'

export interface Product {
  id: number
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
  onlineStock: number
  sales: number
}

export interface TutorialItem {
  id: number
  displayArea: 'HOT' | 'LIST'
  displayOrder: number
  tag: string
  categoryCode: string | null
  title: string
  description: string
  difficulty: string | null
  durationMinutes: number | null
  backgroundStyle: string
  mediaUrl: string | null
  mediaType: 'IMAGE' | 'VIDEO' | null
  favoriteDefault: boolean
}

export interface TutorialList {
  hotTutorials: TutorialItem[]
  tutorials: TutorialItem[]
}

export interface AnnouncementItem {
  id: number
  title: string
  content: string
  status: string
  publishedAt: string | null
  createdAt: string | null
}

export interface PromotionItem {
  id: number
  title: string
  strategyType: string
  description: string
  imageUrl: string | null
  status: string
  createdAt: string | null
}

export interface OrderItem {
  productId: number
  productName: string
  price: number
  quantity: number
  lineTotal: number
}

export interface BuyerOrder {
  id: number
  orderNo: string
  status: string
  totalAmount: number
  shippingCarrier: string | null
  trackingNo: string | null
  shippingStatus: string | null
  shippedAt: string | null
  createdAt: string | null
  items: OrderItem[]
}

export interface ProductReview {
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

export interface MyProfile {
  id: number
  username: string
  role: 'BUYER' | 'ADMIN' | 'INVENTORY_MANAGER'
  nickname: string | null
  gender: string | null
  phone: string | null
  avatarDataUrl: string | null
}

export interface MyAddress {
  id: number
  userId: number
  addressText: string
  isDefault: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AiChatResponse {
  content: string
}

export async function fetchProducts() {
  const res = await http.get('/api/products') as { data: Product[] }
  return res.data
}

export async function fetchTutorials() {
  const res = await http.get('/api/tutorials') as { data: TutorialList }
  return res.data
}

export async function fetchTutorialDetail(id: number) {
  const res = await http.get(`/api/tutorials/${id}`) as { data: TutorialItem }
  return res.data
}

export async function fetchAnnouncements() {
  const res = await http.get('/api/announcements') as { data: AnnouncementItem[] }
  return res.data
}

export async function fetchPromotions() {
  const res = await http.get('/api/promotions') as { data: PromotionItem[] }
  return res.data
}

export async function fetchProduct(id: number) {
  const res = await http.get(`/api/products/${id}`) as { data: Product }
  return res.data
}

export async function fetchProductReviews(productId: number) {
  const res = await http.get(`/api/products/${productId}/reviews`) as { data: ProductReview[] }
  return res.data
}

export async function createOrder(items: Array<{ productId: number; quantity: number }>) {
  return http.post('/api/orders', { items })
}

export async function fetchMyOrders() {
  const res = await http.get('/api/orders/me') as { data: BuyerOrder[] }
  return res.data
}

export async function confirmMyOrderReceived(orderId: number) {
  const res = await http.patch(`/api/orders/${orderId}/received`) as { data: BuyerOrder }
  return res.data
}

export async function fetchMyReviews() {
  const res = await http.get('/api/reviews/me') as { data: ProductReview[] }
  return res.data
}

export async function createReview(orderId: number, payload: { productId: number; rating: number; content: string }) {
  return http.post(`/api/orders/${orderId}/reviews`, payload)
}

export async function fetchMyProfile() {
  const res = await http.get('/api/profile/me') as { data: MyProfile }
  return res.data
}

export async function updateMyProfile(payload: Partial<Pick<MyProfile, 'username' | 'nickname' | 'gender' | 'phone' | 'avatarDataUrl'>>) {
  const res = await http.put('/api/profile/me', payload) as { data: MyProfile }
  return res.data
}

export async function fetchMyAddresses() {
  const res = await http.get('/api/profile/me/addresses') as { data: MyAddress[] }
  return res.data
}

export async function createMyAddress(payload: { addressText: string; isDefault: boolean }) {
  const res = await http.post('/api/profile/me/addresses', payload) as { data: MyAddress }
  return res.data
}

export async function updateMyAddress(id: number, payload: { addressText: string; isDefault: boolean }) {
  const res = await http.put(`/api/profile/me/addresses/${id}`, payload) as { data: MyAddress }
  return res.data
}

export async function deleteMyAddress(id: number) {
  return http.delete(`/api/profile/me/addresses/${id}`)
}

export async function aiChat(messages: AiChatMessage[]) {
  const res = await http.post('/api/ai/chat', { messages }) as { data: AiChatResponse }
  return res.data
}
