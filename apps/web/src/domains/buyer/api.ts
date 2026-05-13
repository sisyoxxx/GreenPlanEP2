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
  status: string
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
  detailVideoUrl: string | null
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
  productStatus?: string
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
  return (await http.get('/api/products')) as Product[]
}

export async function fetchTutorials() {
  return (await http.get('/api/tutorials')) as TutorialList
}

export async function fetchTutorialDetail(id: number) {
  return (await http.get(`/api/tutorials/${id}`)) as TutorialItem
}

export async function fetchAnnouncements() {
  return (await http.get('/api/announcements')) as AnnouncementItem[]
}

export async function fetchPromotions() {
  return (await http.get('/api/promotions')) as PromotionItem[]
}

export async function fetchProduct(id: number) {
  return (await http.get(`/api/products/${id}`)) as Product
}

export async function fetchProductReviews(productId: number) {
  return (await http.get(`/api/products/${productId}/reviews`)) as ProductReview[]
}

export async function createOrder(items: Array<{ productId: number; quantity: number }>): Promise<BuyerOrder> {
  return http.post('/api/orders', { items }) as Promise<BuyerOrder>
}

export async function fetchMyOrders() {
  return (await http.get('/api/orders/me')) as BuyerOrder[]
}

export async function confirmMyOrderReceived(orderId: number) {
  return (await http.patch(`/api/orders/${orderId}/received`)) as BuyerOrder
}

export async function fetchMyReviews() {
  return (await http.get('/api/reviews/me')) as ProductReview[]
}

export async function createReview(orderId: number, payload: { productId: number; rating: number; content: string }): Promise<ProductReview> {
  return http.post(`/api/orders/${orderId}/reviews`, payload) as Promise<ProductReview>
}

export async function fetchMyProfile() {
  return (await http.get('/api/profile/me')) as MyProfile
}

export async function updateMyProfile(payload: Partial<Pick<MyProfile, 'username' | 'nickname' | 'gender' | 'phone' | 'avatarDataUrl'>>) {
  return (await http.put('/api/profile/me', payload)) as MyProfile
}

export async function fetchMyAddresses() {
  return (await http.get('/api/profile/me/addresses')) as MyAddress[]
}

export async function createMyAddress(payload: { addressText: string; isDefault: boolean }) {
  return (await http.post('/api/profile/me/addresses', payload)) as MyAddress
}

export async function updateMyAddress(id: number, payload: { addressText: string; isDefault: boolean }) {
  return (await http.put(`/api/profile/me/addresses/${id}`, payload)) as MyAddress
}

export async function deleteMyAddress(id: number): Promise<void> {
  return http.delete(`/api/profile/me/addresses/${id}`) as Promise<void>
}

export interface CommunityPost {
  id: number
  topic: string
  title: string
  content: string
  imageUrl: string | null
  likes: number
  commentCount: number
  author: string
  authorId: number
  mine: boolean
  liked: boolean
  favorited: boolean
  time: string
}

export interface CommunityComment {
  id: number
  postId: number
  parentId: number | null
  author: string
  authorId: number
  content: string
  mine: boolean
  time: string
}

export interface CommunityPostDetail {
  id: number
  topic: string
  title: string
  content: string
  imageUrl: string | null
  likes: number
  author: string
  authorId: number
  mine: boolean
  liked: boolean
  favorited: boolean
  time: string
  comments: CommunityComment[]
}

export async function fetchCommunityPosts() {
  return (await http.get('/api/community/posts')) as CommunityPost[]
}

export async function fetchCommunityPostDetail(id: number) {
  return (await http.get(`/api/community/posts/${id}`)) as CommunityPostDetail
}

export async function createCommunityPost(payload: { topic: string; title: string; content: string; imageUrl?: string | null }): Promise<CommunityPost> {
  return http.post('/api/community/posts', payload) as Promise<CommunityPost>
}

export async function updateCommunityPost(id: number, payload: { topic: string; title: string; content: string; imageUrl?: string | null }): Promise<CommunityPost> {
  return http.put(`/api/community/posts/${id}`, payload) as Promise<CommunityPost>
}

export async function deleteCommunityPost(id: number): Promise<void> {
  return http.delete(`/api/community/posts/${id}`) as Promise<void>
}

export async function toggleLikePost(id: number) {
  return (await http.post(`/api/community/posts/${id}/like`)) as { liked: boolean; likeCount: number }
}

export async function toggleFavoritePost(id: number) {
  return (await http.post(`/api/community/posts/${id}/favorite`)) as { favorited: boolean }
}

export async function fetchFavoritePostIds() {
  return (await http.get('/api/community/posts/favorites')) as number[]
}

export async function createCommunityComment(postId: number, payload: { content: string; parentCommentId?: number | null }): Promise<CommunityComment> {
  return http.post(`/api/community/posts/${postId}/comments`, payload) as Promise<CommunityComment>
}

export async function aiChat(messages: AiChatMessage[]) {
  return (await http.post('/api/ai/chat', { messages })) as AiChatResponse
}

export interface CartItemDto {
  productId: number
  sku: string
  name: string
  description: string
  price: number
  category: string
  plantingMonth: string
  suitableRegion: string
  imageUrl: string
  onlineStock: number
  quantity: number
}

export interface PlantingDiaryItem {
  id: number
  userId: number
  title: string
  plantName: string
  category: string
  diaryDate: string
  note: string
  imageName: string
}

export async function fetchPlantingDiaries() {
  const items = (await http.get('/api/planting-diaries')) as PlantingDiaryItem[]
  return items.map(d => ({
    id: d.id,
    title: d.title,
    plantName: d.plantName,
    category: d.category,
    date: d.diaryDate,
    note: d.note,
    imageName: d.imageName
  }))
}

export async function createPlantingDiary(payload: { title: string; plantName: string; category: string; diaryDate: string; note: string; imageName: string | null }) {
  return (await http.post('/api/planting-diaries', payload)) as PlantingDiaryItem
}

export async function updatePlantingDiary(id: number, payload: { title: string; plantName: string; category: string; diaryDate: string; note: string; imageName: string | null }) {
  return (await http.put(`/api/planting-diaries/${id}`, payload)) as PlantingDiaryItem
}

export async function deletePlantingDiary(id: number): Promise<void> {
  return http.delete(`/api/planting-diaries/${id}`) as Promise<void>
}

export async function uploadPlantingDiaryImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return (await http.post('/api/planting-diaries/upload', formData)) as string
}

export async function fetchCart() {
  return (await http.get('/api/cart')) as CartItemDto[]
}

export async function addCartItem(productId: number, quantity: number): Promise<void> {
  return http.post('/api/cart/items', { productId, quantity }) as Promise<void>
}

export async function updateCartItem(productId: number, quantity: number): Promise<void> {
  return http.put(`/api/cart/items/${productId}`, { quantity }) as Promise<void>
}

export async function removeCartItem(productId: number): Promise<void> {
  return http.delete(`/api/cart/items/${productId}`) as Promise<void>
}

export async function clearCart(): Promise<void> {
  return http.delete('/api/cart') as Promise<void>
}
