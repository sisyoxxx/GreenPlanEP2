<template>
  <AppLayout>
    <div class="orders-shell">
      <!-- 左侧栏 -->
      <aside class="orders-sidebar page-lite">
        <div class="sidebar-search">
          <input v-model="searchKeyword" type="text" placeholder="搜索订单号 / 商品名" class="search-input" @input="filterOrders" />
        </div>

        <nav class="sidebar-nav">
          <div class="nav-group">
            <h3 class="nav-group-title">我的订单</h3>
            <button :class="['nav-item', { active: activeTab === 'all' }]" @click="switchTab('all')">
              <span class="nav-icon">📋</span>全部订单
              <span v-if="orderCounts.all" class="nav-badge">{{ orderCounts.all }}</span>
            </button>
            <button :class="['nav-item', { active: activeTab === 'pending' }]" @click="switchTab('pending')">
              <span class="nav-icon">💰</span>待付款
              <span v-if="orderCounts.pending" class="nav-badge">{{ orderCounts.pending }}</span>
            </button>
            <button :class="['nav-item', { active: activeTab === 'paid' }]" @click="switchTab('paid')">
              <span class="nav-icon">📦</span>待发货
              <span v-if="orderCounts.paid" class="nav-badge">{{ orderCounts.paid }}</span>
            </button>
            <button :class="['nav-item', { active: activeTab === 'shipped' }]" @click="switchTab('shipped')">
              <span class="nav-icon">🚚</span>运输中
              <span v-if="orderCounts.shipped" class="nav-badge">{{ orderCounts.shipped }}</span>
            </button>
            <button :class="['nav-item', { active: activeTab === 'delivered' }]" @click="switchTab('delivered')">
              <span class="nav-icon">✅</span>待签收
              <span v-if="orderCounts.delivered" class="nav-badge">{{ orderCounts.delivered }}</span>
            </button>
            <button :class="['nav-item', { active: activeTab === 'toReview' }]" @click="switchTab('toReview')">
              <span class="nav-icon">📝</span>待评价
              <span v-if="orderCounts.toReview" class="nav-badge">{{ orderCounts.toReview }}</span>
            </button>
          </div>

          <div class="nav-group">
            <h3 class="nav-group-title">更多服务</h3>
            <button :class="['nav-item', { active: activeTab === 'logistics' }]" @click="switchTab('logistics')">
              <span class="nav-icon">🗺️</span>物流助手
            </button>
            <button :class="['nav-item', { active: activeTab === 'reviews' }]" @click="switchTab('reviews')">
              <span class="nav-icon">⭐</span>我的评价
            </button>
          </div>
        </nav>
      </aside>

      <!-- 右侧内容区 -->
      <main class="orders-main">
        <!-- 顶部标签栏 -->
        <div class="orders-header page-lite">
          <h2 class="orders-title">{{ tabLabel }}</h2>
          <div class="orders-toolbar">
            <select v-model="sortBy" class="sort-select">
              <option value="newest">最新下单</option>
              <option value="oldest">最早下单</option>
              <option value="amount">金额排序</option>
            </select>
            <button class="secondary-btn" @click="load">刷新</button>
          </div>
        </div>

        <!-- 订单列表 -->
        <div v-if="activeTab === 'logistics'" class="logistics-panel page-lite">
          <h3>物流助手</h3>
          <p class="empty-hint">输入订单号或快递单号，快速查询物流状态。</p>
          <div class="logistics-search">
            <input type="text" placeholder="请输入订单号或快递单号" v-model="logisticsQuery" />
            <button @click="queryLogistics">查询</button>
          </div>
          <div v-if="logisticsResult" class="logistics-result">
            <p>{{ logisticsResult }}</p>
          </div>
        </div>

        <div v-else-if="activeTab === 'reviews'" class="reviews-panel page-lite">
          <h3>我的评价</h3>
          <div v-if="reviews.length === 0" class="empty-state">
            <p class="empty-hint">暂无评价记录</p>
          </div>
          <div v-else class="review-list">
            <div class="review-card card" v-for="review in reviews" :key="review.id">
              <div class="review-header">
                <strong>{{ review.productName }}</strong>
                <span class="review-stars">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span>
              </div>
              <p class="review-content">{{ review.content }}</p>
              <span class="review-date">{{ review.date }}</span>
            </div>
          </div>
        </div>

        <template v-else>
          <div v-if="filteredOrders.length === 0" class="empty-state page-lite">
            <p class="empty-hint">{{ searchKeyword ? '未找到匹配的订单' : '暂无订单' }}</p>
          </div>
          <div v-else class="order-list">
            <div class="order-card page-lite" v-for="order in sortedOrders" :key="order.id">
              <div class="order-card-header">
                <div class="order-info">
                  <span class="order-no">{{ order.orderNo }}</span>
                  <span class="order-date">{{ order.createTime || '' }}</span>
                </div>
                <span :class="['order-status', `status-${order.status}`]">{{ statusMap[order.status] || order.status }}</span>
              </div>
              <div class="order-items">
                <div class="order-item" v-for="item in order.items" :key="item.productId">
                  <div class="item-thumb">{{ item.productName?.charAt(0) || '商' }}</div>
                  <div class="item-info">
                    <span class="item-name">{{ item.productName }}</span>
                    <span class="item-qty">x{{ item.quantity }}</span>
                  </div>
                  <span class="item-price">¥{{ item.lineTotal }}</span>
                </div>
              </div>
              <div class="order-card-footer">
                <span class="order-total">合计：<strong>¥{{ order.totalAmount }}</strong></span>
                <div class="order-actions">
                  <button v-if="order.status === 'PENDING'" class="secondary-btn" @click="payOrder(order)">去付款</button>
                  <button v-if="order.status === 'DELIVERED'" class="secondary-btn" @click="confirmReceive(order)">确认签收</button>
                  <button class="text-link" @click="viewDetail(order)">查看详情</button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import { fetchMyOrders } from '../api'

type TabKey = 'all' | 'pending' | 'paid' | 'shipped' | 'delivered' | 'toReview' | 'logistics' | 'reviews'

const statusMap: Record<string, string> = {
  PENDING: '待付款',
  PAID: '待发货',
  SHIPPED: '运输中',
  DELIVERED: '待签收',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
}

const tabLabelMap: Record<TabKey, string> = {
  all: '全部订单',
  pending: '待付款',
  paid: '待发货',
  shipped: '运输中',
  delivered: '待签收',
  toReview: '待评价',
  logistics: '物流助手',
  reviews: '我的评价'
}

const orders = ref<any[]>([])
const activeTab = ref<TabKey>('all')
const searchKeyword = ref('')
const sortBy = ref('newest')
const logisticsQuery = ref('')
const logisticsResult = ref('')

const reviews = ref<Array<{ id: number; productName: string; rating: number; content: string; date: string }>>([
  { id: 1, productName: '家庭番茄种植套装', rating: 5, content: '发芽率很高，包装也很好，推荐！', date: '2026-03-20' },
  { id: 2, productName: '有机薄荷种子', rating: 4, content: '长势不错，就是发货稍慢。', date: '2026-03-15' }
])

const tabLabel = computed(() => tabLabelMap[activeTab.value])

const statusFilterMap: Record<string, string> = {
  pending: 'PENDING',
  paid: 'PAID',
  shipped: 'SHIPPED',
  delivered: 'DELIVERED',
  toReview: 'COMPLETED'
}

const filteredOrders = computed(() => {
  let list = orders.value
  const filterStatus = statusFilterMap[activeTab.value]
  if (filterStatus) list = list.filter((o: any) => o.status === filterStatus)
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter((o: any) =>
      o.orderNo?.toLowerCase().includes(kw) ||
      o.items?.some((i: any) => i.productName?.toLowerCase().includes(kw))
    )
  }
  return list
})

const sortedOrders = computed(() => {
  const list = [...filteredOrders.value]
  if (sortBy.value === 'oldest') list.reverse()
  if (sortBy.value === 'amount') list.sort((a: any, b: any) => b.totalAmount - a.totalAmount)
  return list
})

const orderCounts = computed(() => ({
  all: orders.value.length,
  pending: orders.value.filter((o: any) => o.status === 'PENDING').length,
  paid: orders.value.filter((o: any) => o.status === 'PAID').length,
  shipped: orders.value.filter((o: any) => o.status === 'SHIPPED').length,
  delivered: orders.value.filter((o: any) => o.status === 'DELIVERED').length,
  toReview: orders.value.filter((o: any) => o.status === 'COMPLETED').length
}))

function switchTab(tab: TabKey) { activeTab.value = tab }
function filterOrders() { /* reactive via searchKeyword */ }
function queryLogistics() {
  logisticsResult.value = logisticsQuery.value
    ? `订单 ${logisticsQuery.value} 的物流信息查询中...`
    : ''
}
function payOrder(order: any) { alert(`跳转付款：${order.orderNo}`) }
function confirmReceive(order: any) { alert(`确认签收：${order.orderNo}`) }
function viewDetail(order: any) { alert(`查看详情：${order.orderNo}`) }

const mockOrders = [
  {
    id: 1001,
    orderNo: 'GP2-20260401-0001',
    status: 'PENDING',
    totalAmount: 128.00,
    createTime: '2026-04-01 14:23',
    items: [
      { productId: 1, productName: '家庭番茄种植套装', quantity: 2, lineTotal: 78.00 },
      { productId: 2, productName: '有机营养土 5L', quantity: 1, lineTotal: 50.00 }
    ]
  },
  {
    id: 1002,
    orderNo: 'GP2-20260405-0002',
    status: 'SHIPPED',
    totalAmount: 65.50,
    createTime: '2026-04-05 09:15',
    items: [
      { productId: 3, productName: '薄荷种子礼盒', quantity: 1, lineTotal: 35.50 },
      { productId: 4, productName: '迷你园艺工具三件套', quantity: 1, lineTotal: 30.00 }
    ]
  },
  {
    id: 1003,
    orderNo: 'GP2-20260410-0003',
    status: 'DELIVERED',
    totalAmount: 210.00,
    createTime: '2026-04-10 17:42',
    items: [
      { productId: 5, productName: '阳台草莓种植全套', quantity: 1, lineTotal: 139.00 },
      { productId: 6, productName: '自动浇水器', quantity: 1, lineTotal: 71.00 }
    ]
  }
]

async function load() {
  try {
    const data = await fetchMyOrders()
    orders.value = data && data.length > 0 ? data : mockOrders
  } catch {
    orders.value = mockOrders
  }
}
onMounted(load)
</script>

<style scoped>
.orders-shell {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  max-width: 100%;
  width: calc(100vw - 24px);
  margin-left: calc((100% - (100vw - 24px)) / 2);
  padding: 0 12px;
}

.orders-sidebar {
  position: sticky;
  top: 16px;
  display: grid;
  gap: 16px;
}

.sidebar-search .search-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d3d7de;
  background: #f8fcf8;
  font-size: 13px;
}

.sidebar-nav {
  display: grid;
  gap: 18px;
}

.nav-group {
  display: grid;
  gap: 4px;
}

.nav-group-title {
  margin: 0 0 6px;
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.nav-item:hover { background: #f0f7f1; }
.nav-item.active { background: #e6f4ea; color: #1f7a41; font-weight: 600; }

.nav-icon { font-size: 16px; width: 22px; text-align: center; }

.nav-badge {
  margin-left: auto;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 50%;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.orders-main { display: grid; gap: 12px; }

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.orders-title { margin: 0; font-size: 20px; color: #1f2937; }

.orders-toolbar { display: flex; gap: 8px; align-items: center; }

.sort-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d3d7de;
  font-size: 13px;
  background: #fff;
}

.order-list { display: grid; gap: 12px; }

.order-card { display: grid; gap: 12px; }

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info { display: flex; gap: 12px; align-items: center; }
.order-no { font-weight: 600; color: #1f2937; }
.order-date { font-size: 13px; color: #9ca3af; }

.order-status {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-PENDING { background: #fef3c7; color: #92400e; }
.status-PAID { background: #dbeafe; color: #1e40af; }
.status-SHIPPED { background: #e0e7ff; color: #3730a3; }
.status-DELIVERED { background: #d1fae5; color: #065f46; }
.status-COMPLETED { background: #f3f4f6; color: #6b7280; }
.status-CANCELLED { background: #fee2e2; color: #991b1b; }

.order-items { display: grid; gap: 8px; }

.order-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  background: #f8fcf8;
}

.item-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  color: #1f7a41;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-info { flex: 1; display: flex; justify-content: space-between; }
.item-name { font-size: 14px; color: #1f2937; }
.item-qty { font-size: 13px; color: #9ca3af; }
.item-price { font-weight: 600; color: #1f2937; white-space: nowrap; }

.order-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.order-total { font-size: 14px; color: #6b7280; }
.order-total strong { color: #1f2937; font-size: 16px; }
.order-actions { display: flex; gap: 8px; align-items: center; }

.empty-state { text-align: center; padding: 40px 16px; }
.empty-hint { color: #9ca3af; margin: 0; }

.logistics-panel, .reviews-panel { display: grid; gap: 12px; }
.logistics-panel h3, .reviews-panel h3 { margin: 0; font-size: 18px; }

.logistics-search { display: flex; gap: 8px; }
.logistics-search input { flex: 1; }
.logistics-result { padding: 12px; background: #f8fcf8; border-radius: 8px; }
.logistics-result p { margin: 0; color: #374151; }

.review-list { display: grid; gap: 10px; }
.review-header { display: flex; justify-content: space-between; align-items: center; }
.review-stars { color: #f59e0b; }
.review-content { margin: 6px 0 0; color: #4b5563; line-height: 1.6; }
.review-date { font-size: 12px; color: #9ca3af; }

@media (max-width: 760px) {
  .orders-shell { grid-template-columns: 1fr; }
  .orders-sidebar { position: static; }
}
</style>