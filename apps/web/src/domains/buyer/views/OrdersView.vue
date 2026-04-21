<template>
  <AppLayout>
    <div class="orders-shell">
      <aside class="orders-sidebar page-lite">
        <div class="sidebar-head">
          <h2>交易中心</h2>
          <p>订单与评价状态会实时同步，方便你快速处理。</p>
        </div>

        <div class="sidebar-search">
          <input v-model.trim="keyword" type="text" placeholder="搜索订单号或商品名" />
        </div>

        <nav class="sidebar-nav">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['nav-item', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            <span>{{ tab.label }}</span>
            <span v-if="tab.count > 0" class="nav-badge">{{ tab.count }}</span>
          </button>
        </nav>

        <div class="sidebar-summary">
          <div class="summary-card">
            <strong>{{ orders.length }}</strong>
            <span>累计订单</span>
          </div>
          <div class="summary-card">
            <strong>{{ reviews.length }}</strong>
            <span>我的评价</span>
          </div>
        </div>
      </aside>

      <main class="orders-main">
        <section class="page-lite toolbar-card">
          <div>
            <h1>{{ activeTitle }}</h1>
            <p class="muted">{{ activeDescription }}</p>
          </div>
          <div class="toolbar-actions">
            <select v-model="sortBy">
              <option value="newest">最新下单</option>
              <option value="oldest">最早下单</option>
              <option value="amount">金额排序</option>
            </select>
            <button class="secondary-btn" :disabled="loading" @click="loadData">
              {{ loading ? '刷新中...' : '刷新' }}
            </button>
          </div>
        </section>

        <section v-if="activeTab === 'reviews'" class="page-lite reviews-panel">
          <div v-if="loading && reviews.length === 0" class="empty-state">评价加载中...</div>
          <div v-else-if="reviews.length === 0" class="empty-state">你还没有提交过评价。</div>
          <div v-else class="review-list">
            <article v-for="review in reviews" :key="review.id" class="review-card">
              <div class="review-head">
                <div>
                  <strong>{{ review.productName }}</strong>
                  <span class="muted">{{ formatDateTime(review.createdAt) }}</span>
                </div>
                <span class="review-stars">{{ renderStars(review.rating) }}</span>
              </div>
              <p class="review-content">{{ review.content }}</p>
              <button class="text-link" @click="goProduct(review.productId)">查看商品</button>
            </article>
          </div>
        </section>

        <template v-else>
          <section v-if="loading && filteredOrders.length === 0" class="page-lite empty-state">订单加载中...</section>
          <section v-else-if="filteredOrders.length === 0" class="page-lite empty-state">
            {{ keyword ? '没有找到匹配的订单' : '当前没有符合条件的订单' }}
          </section>

          <section v-else class="order-list">
            <article
              v-for="order in sortedOrders"
              :key="order.id"
              :class="['page-lite order-card', { focused: focusOrderId === order.id }]"
            >
              <div class="order-card-head">
                <div>
                  <strong>{{ order.orderNo }}</strong>
                  <p class="muted">{{ formatOrderTime(order) }}</p>
                </div>
                <div class="status-stack">
                  <span :class="['status-badge', `status-${order.status}`]">{{ statusLabel(order.status) }}</span>
                </div>
              </div>

              <div class="item-list">
                <div v-for="item in order.items" :key="`${order.id}-${item.productId}`" class="item-card">
                  <div class="item-info">
                    <button class="item-title" @click="goProduct(item.productId)">{{ item.productName }}</button>
                    <span class="muted">x{{ item.quantity }} · ¥{{ formatPrice(item.lineTotal) }}</span>
                  </div>
                  <button
                    v-if="canReviewItem(order, item.productId)"
                    class="secondary-btn"
                    @click="openReview(order, item.productId, item.productName)"
                  >
                    去评价
                  </button>
                  <span v-else-if="isReviewed(order.id, item.productId)" class="review-done">已评价</span>
                </div>
              </div>

              <div class="order-card-foot">
                <span class="order-total">合计 ¥{{ formatPrice(order.totalAmount) }}</span>
                <div class="card-actions">
                  <button
                    v-if="canConfirmReceive(order)"
                    class="secondary-btn"
                    :disabled="confirmingOrderId === order.id"
                    @click="confirmReceived(order)"
                  >
                    {{ confirmingOrderId === order.id ? '处理中...' : '已收货' }}
                  </button>
                  <button class="secondary-btn" @click="goProduct(order.items[0]?.productId)">再次购买</button>
                </div>
              </div>
            </article>
          </section>
        </template>

        <section v-if="reviewDraft" class="page-lite review-editor">
          <div class="review-editor-head">
            <div>
              <h3>提交评价</h3>
              <p class="muted">{{ reviewDraft.productName }} · 订单 {{ reviewDraft.orderNo }}</p>
            </div>
            <button class="secondary-btn" @click="closeReview">关闭</button>
          </div>

          <label class="field">
            <span>评分</span>
            <select v-model.number="reviewForm.rating">
              <option :value="5">5 星</option>
              <option :value="4">4 星</option>
              <option :value="3">3 星</option>
              <option :value="2">2 星</option>
              <option :value="1">1 星</option>
            </select>
          </label>

          <label class="field">
            <span>评价内容</span>
            <textarea v-model.trim="reviewForm.content" rows="4" placeholder="写下你的真实体验"></textarea>
          </label>

          <div class="card-actions">
            <button :disabled="submittingReview" @click="submitReview">
              {{ submittingReview ? '提交中...' : '提交评价' }}
            </button>
            <button class="secondary-btn" @click="closeReview">取消</button>
          </div>
        </section>

        <p v-if="message" class="message">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import {
  confirmMyOrderReceived,
  createReview,
  fetchMyOrders,
  fetchMyReviews,
  type BuyerOrder,
  type ProductReview
} from '../api'

type OrderTab = 'all' | 'paid' | 'shipped' | 'delivered' | 'toReview' | 'reviews'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submittingReview = ref(false)
const error = ref('')
const message = ref('')
const orders = ref<BuyerOrder[]>([])
const reviews = ref<ProductReview[]>([])
const keyword = ref('')
const sortBy = ref('newest')
const activeTab = ref<OrderTab>('all')
const focusOrderId = ref<number | null>(null)
const confirmingOrderId = ref<number | null>(null)

const reviewDraft = ref<{ orderId: number; orderNo: string; productId: number; productName: string } | null>(null)
const reviewForm = reactive({
  rating: 5,
  content: ''
})

const reviewKeySet = computed(() => {
  return new Set(reviews.value.filter((item) => item.orderId).map((item) => `${item.orderId}-${item.productId}`))
})

const tabs = computed(() => [
  { key: 'all' as OrderTab, label: '全部订单', count: orders.value.length },
  { key: 'paid' as OrderTab, label: '待发货', count: orders.value.filter((item) => item.status === 'PAID').length },
  { key: 'shipped' as OrderTab, label: '运输中', count: orders.value.filter((item) => item.status === 'SHIPPED').length },
  {
    key: 'delivered' as OrderTab,
    label: '已收货',
    count: orders.value.filter((item) => item.status === 'DELIVERED').length
  },
  {
    key: 'toReview' as OrderTab,
    label: '待评价',
    count: orders.value.filter((item) => reviewableItems(item).length > 0).length
  },
  { key: 'reviews' as OrderTab, label: '我的评价', count: reviews.value.length }
])

const activeTitle = computed(() => {
  const map: Record<OrderTab, string> = {
    all: '全部订单',
    paid: '待发货订单',
    shipped: '运输中订单',
    delivered: '已收货订单',
    toReview: '待评价订单',
    reviews: '我的评价'
  }
  return map[activeTab.value]
})

const activeDescription = computed(() => {
  if (activeTab.value === 'reviews') return '你提交过的评价会显示在商品详情页，帮助其他买家决策。'
  return '这里展示你的订单状态，已简化物流信息，支持一键确认收货。'
})

const filteredOrders = computed(() => {
  let list = orders.value
  if (activeTab.value === 'paid') list = list.filter((item) => item.status === 'PAID')
  if (activeTab.value === 'shipped') list = list.filter((item) => item.status === 'SHIPPED')
  if (activeTab.value === 'delivered') list = list.filter((item) => item.status === 'DELIVERED')
  if (activeTab.value === 'toReview') list = list.filter((item) => reviewableItems(item).length > 0)

  const search = keyword.value.toLowerCase()
  if (!search) return list
  return list.filter((order) => {
    const byOrderNo = order.orderNo.toLowerCase().includes(search)
    const byProduct = order.items.some((item) => item.productName.toLowerCase().includes(search))
    return byOrderNo || byProduct
  })
})

const sortedOrders = computed(() => {
  const list = [...filteredOrders.value]
  if (sortBy.value === 'oldest') list.reverse()
  if (sortBy.value === 'amount') list.sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount))
  return list
})

onMounted(() => {
  const focus = Number(route.query.focus)
  focusOrderId.value = Number.isFinite(focus) ? focus : null
  loadData()
})

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [orderList, reviewList] = await Promise.all([fetchMyOrders(), fetchMyReviews()])
    orders.value = orderList || []
    reviews.value = reviewList || []
  } catch (err: any) {
    error.value = err?.response?.data?.message || '订单数据加载失败'
  } finally {
    loading.value = false
  }
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: '待支付',
    PAID: '待发货',
    SHIPPED: '运输中',
    DELIVERED: '已收货'
  }
  return map[status] || status
}

function canConfirmReceive(order: BuyerOrder) {
  return ['PAID', 'SHIPPED'].includes(order.status)
}

async function confirmReceived(order: BuyerOrder) {
  if (confirmingOrderId.value) return

  confirmingOrderId.value = order.id
  message.value = ''
  error.value = ''
  try {
    const updated = await confirmMyOrderReceived(order.id)
    const target = orders.value.find((item) => item.id === order.id)
    if (target) Object.assign(target, updated)
    message.value = `订单 ${order.orderNo} 已确认收货`
  } catch (err: any) {
    error.value = err?.response?.data?.message || '确认收货失败'
  } finally {
    confirmingOrderId.value = null
  }
}

function reviewableItems(order: BuyerOrder) {
  if (!['SHIPPED', 'DELIVERED'].includes(order.status)) return []
  return order.items.filter((item) => !isReviewed(order.id, item.productId))
}

function isReviewed(orderId: number, productId: number) {
  return reviewKeySet.value.has(`${orderId}-${productId}`)
}

function canReviewItem(order: BuyerOrder, productId: number) {
  return ['SHIPPED', 'DELIVERED'].includes(order.status) && !isReviewed(order.id, productId)
}

function openReview(order: BuyerOrder, productId: number, productName: string) {
  reviewDraft.value = {
    orderId: order.id,
    orderNo: order.orderNo,
    productId,
    productName
  }
  reviewForm.rating = 5
  reviewForm.content = ''
  message.value = ''
  error.value = ''
}

function closeReview() {
  reviewDraft.value = null
  reviewForm.rating = 5
  reviewForm.content = ''
}

async function submitReview() {
  if (!reviewDraft.value) return
  if (!reviewForm.content) {
    error.value = '请填写评价内容'
    return
  }

  submittingReview.value = true
  error.value = ''
  message.value = ''

  try {
    await createReview(reviewDraft.value.orderId, {
      productId: reviewDraft.value.productId,
      rating: reviewForm.rating,
      content: reviewForm.content
    })
    message.value = '评价已提交'
    closeReview()
    await loadData()
  } catch (err: any) {
    error.value = err?.response?.data?.message || '评价提交失败'
  } finally {
    submittingReview.value = false
  }
}

function goProduct(productId?: number) {
  if (!productId) return
  router.push(`/products/${productId}`)
}

function renderStars(rating: number) {
  const safe = Math.max(0, Math.min(5, rating))
  return `${'★'.repeat(safe)}${'☆'.repeat(5 - safe)}`
}

function formatDateTime(value: string | null) {
  if (!value) return ''
  return value.replace('T', ' ').slice(0, 16)
}

function formatOrderTime(order: BuyerOrder) {
  const text = formatDateTime(order.createdAt)
  if (text) return text

  const match = order.orderNo?.match(/^GP(\d{13})/)
  if (match) {
    const ts = Number(match[1])
    if (Number.isFinite(ts) && ts > 0) {
      const date = new Date(ts)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const hh = String(date.getHours()).padStart(2, '0')
      const mm = String(date.getMinutes()).padStart(2, '0')
      return `${y}-${m}-${d} ${hh}:${mm}`
    }
  }

  return '下单时间待同步'
}

function formatPrice(value: number) {
  return Number(value).toFixed(2)
}
</script>
<style scoped>
.orders-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
  height: calc(100vh - 108px);
  overflow: hidden;
}

.orders-sidebar,
.toolbar-card,
.review-editor {
  display: grid;
  gap: 14px;
}

.orders-sidebar {
  align-content: start;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.sidebar-head h2,
.toolbar-card h1,
.review-editor h3 {
  margin: 0;
  color: #16351f;
}

.sidebar-head p {
  margin: 6px 0 0;
  color: #6b7280;
  line-height: 1.6;
  font-size: 13px;
}

.sidebar-nav,
.sidebar-summary,
.order-list,
.review-list {
  display: grid;
  gap: 10px;
}

.nav-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fcf8;
  border: 1px solid #e2ece3;
  color: #1f2937;
  font-weight: 600;
  text-align: left;
}

.nav-item.active {
  background: #edf9ef;
  border-color: #9ad3aa;
  color: #1d5b36;
}

.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: #1f7a41;
  color: #fff;
  font-size: 12px;
}

.sidebar-summary {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-card {
  display: grid;
  gap: 4px;
  padding: 12px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f8fcf8, #ffffff);
  border: 1px solid #e3eee4;
}

.summary-card strong {
  font-size: 22px;
  color: #1f7a41;
}

.summary-card span,
.muted {
  color: #6b7280;
  font-size: 13px;
}

.orders-main {
  display: grid;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.toolbar-card {
  grid-template-columns: 1fr auto;
  align-items: start;
}

.toolbar-actions,
.order-card-head,
.status-stack,
.order-card-foot,
.card-actions,
.review-head,
.review-editor-head {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.order-card,
.review-card {
  display: grid;
  gap: 14px;
}

.order-card.focused {
  border: 1px solid #9ad3aa;
  box-shadow: 0 0 0 1px rgba(31, 122, 65, 0.16);
}

.status-badge,
.review-done {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-PAID {
  background: #fff5d6;
  color: #946200;
}

.status-SHIPPED {
  background: #e7eefc;
  color: #2f5fb8;
}

.status-DELIVERED {
  background: #dff5e4;
  color: #166534;
}

.review-done {
  background: #edf9ef;
  color: #1f7a41;
}

.item-list {
  display: grid;
  gap: 10px;
}

.item-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  background: #f8fcf8;
  border: 1px solid #e3eee4;
}

.item-info {
  display: grid;
  gap: 4px;
}

.item-title {
  padding: 0;
  border: none;
  background: transparent;
  color: #16351f;
  font-weight: 700;
  text-align: left;
}

.order-total {
  font-size: 15px;
  font-weight: 700;
  color: #16351f;
}

.review-stars {
  color: #f59e0b;
  letter-spacing: 0.08em;
}

.review-content {
  margin: 0;
  color: #4b5563;
  line-height: 1.75;
}

.field {
  display: grid;
  gap: 6px;
}

.field span {
  color: #4b5563;
  font-size: 13px;
  font-weight: 600;
}

.message {
  margin: 0;
  color: #1f7a41;
  font-weight: 700;
}

.error {
  margin: 0;
  color: #dc2626;
  font-weight: 700;
}

.empty-state {
  padding: 28px 16px;
  text-align: center;
  color: #6b7280;
}

.text-link {
  padding: 0;
  border: none;
  background: transparent;
  color: #1f7a41;
  font-weight: 700;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.orders-sidebar::-webkit-scrollbar,
.orders-main::-webkit-scrollbar {
  width: 8px;
}

.orders-sidebar::-webkit-scrollbar-thumb,
.orders-main::-webkit-scrollbar-thumb {
  background: #d2e3d6;
  border-radius: 999px;
}

@media (max-width: 920px) {
  .orders-shell,
  .toolbar-card {
    grid-template-columns: 1fr;
  }

  .orders-shell {
    height: auto;
    overflow: visible;
  }

  .orders-sidebar,
  .orders-main {
    overflow: visible;
    padding-right: 0;
  }
}
</style>


