<template>
  <AppLayout>
    <div class="orders-shell">
      <aside class="orders-sidebar page-lite">
        <div class="sidebar-head">
          <h2>交易中心</h2>
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
            <OrderCard
              v-for="order in sortedOrders"
              :key="order.id"
              :order="order"
              :focused="focusOrderId === order.id"
              :confirming="confirmingOrderId === order.id"
              :reviewed-product-ids="reviews.filter((r) => r.orderId === order.id).map((r) => r.productId)"
              @confirm-receive="confirmReceived(order)"
              @go-product="goProduct"
              @open-review="(productId: number, productName: string) => openReview(order, productId, productName)"
            />
          </section>
        </template>

        <OrderReviewEditor
          v-if="reviewDraft"
          :product-name="reviewDraft.productName"
          :order-no="reviewDraft.orderNo"
          v-model:rating="reviewForm.rating"
          v-model:content="reviewForm.content"
          :submitting="submittingReview"
          @submit="submitReview"
          @cancel="closeReview"
        />

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
import OrderCard from '../components/orders/OrderCard.vue'
import OrderReviewEditor from '../components/orders/OrderReviewEditor.vue'
import {
  confirmMyOrderReceived,
  createReview,
  fetchMyOrders,
  fetchMyReviews,
  type BuyerOrder,
  type ProductReview
} from '../api'
import { formatDateTime, renderStars } from '../../../utils/format'

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
.toolbar-card {
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
.toolbar-card h1 {
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
.review-head {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.review-card {
  display: grid;
  gap: 14px;
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
