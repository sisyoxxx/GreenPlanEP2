<template>
  <section v-if="panel !== 'none'" class="page-lite quick-preview">
    <div class="content-head">
      <div>
        <h1>{{ panelTitle }}</h1>
        <p class="desc">{{ panelDesc }}</p>
      </div>
      <div class="head-actions">
        <button type="button" class="secondary-btn" @click="emit('close')">收起</button>
      </div>
    </div>

    <template v-if="panel === 'orders'">
      <div class="quick-search-row">
        <input v-model.trim="keyword" type="text" placeholder="搜索订单号或商品名" />
        <button type="button" class="secondary-btn" @click="emit('refreshOrders')" :disabled="loading">
          {{ loading ? '加载中...' : '刷新' }}
        </button>
      </div>
      <div v-if="loading && orders.length === 0" class="empty">订单加载中...</div>
      <div v-else-if="error" class="empty">{{ error }}</div>
      <div v-else-if="filteredOrders.length === 0" class="empty">没有匹配订单</div>
      <div v-else class="quick-order-list">
        <article
          v-for="order in filteredOrders"
          :key="order.id"
          class="quick-order-item"
          @click="goOrderDetail(order)"
        >
          <div>
            <strong>{{ order.orderNo }}</strong>
            <p class="sub">{{ formatDateTime(order.createdAt) }}</p>
          </div>
          <span :class="['quick-status', `status-${order.status}`]">{{ statusLabel(order.status) }}</span>
        </article>
      </div>
    </template>

    <template v-else-if="panel === 'records'">
      <div class="quick-plant-list">
        <article v-for="plant in plants" :key="plant.name" class="quick-plant-item">
          <div>
            <strong>{{ plant.icon }} {{ plant.name }}</strong>
            <p class="sub">状态：{{ plant.status }}</p>
          </div>
        </article>
      </div>
    </template>

    <template v-else-if="panel === 'cart'">
      <div v-if="cartItems.length === 0" class="empty">购物车暂无商品</div>
      <div v-else class="quick-cart-list">
        <article v-for="item in cartItems" :key="item.id" class="quick-cart-item">
          <div>
            <strong>{{ item.name }}</strong>
            <p class="sub">x{{ item.quantity }} · 单价 ¥{{ item.price.toFixed(2) }}</p>
          </div>
        </article>
      </div>
    </template>

    <template v-else>
      <div class="quick-fav-summary">
        <div class="stat-tile">
          <span class="stat-label">教程收藏</span>
          <strong class="stat-value">{{ favTutorialCount }}</strong>
        </div>
        <div class="stat-tile">
          <span class="stat-label">帖子收藏</span>
          <strong class="stat-value">{{ favPostCount }}</strong>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { BuyerOrder } from '../../api'

const props = defineProps<{
  panel: string
  orders: BuyerOrder[]
  plants: { name: string; icon: string; status: string }[]
  cartItems: { id: number; name: string; quantity: number; price: number }[]
  favTutorialCount: number
  favPostCount: number
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
  refreshOrders: []
}>()

const router = useRouter()
const keyword = ref('')

const panelTitle = computed(() => {
  if (props.panel === 'orders') return '快捷订单'
  if (props.panel === 'records') return '种植记录预览'
  if (props.panel === 'cart') return '购物车预览'
  if (props.panel === 'favorites') return '收藏预览'
  return ''
})

const panelDesc = computed(() => {
  if (props.panel === 'orders') return '在这里快速搜索订单，点击后再进入订单详情页。'
  if (props.panel === 'records') return '只读展示你当前在种的植物进度。'
  if (props.panel === 'cart') return '显示最近加入购物车的商品摘要。'
  if (props.panel === 'favorites') return '展示教程与帖子收藏数量。'
  return ''
})

const filteredOrders = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return props.orders
  return props.orders.filter((order) =>
    order.orderNo.toLowerCase().includes(k) ||
    order.items.some((item) => item.productName.toLowerCase().includes(k))
  )
})

function goOrderDetail(order: BuyerOrder) {
  router.push(`/orders?focus=${order.id}`)
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: '待支付',
    PAID: '待发货',
    SHIPPED: '运输中',
    DELIVERED: '已签收'
  }
  return map[status] || status
}

function formatDateTime(value: string | null) {
  if (!value) return '时间未记录'
  return value.replace('T', ' ').slice(0, 16)
}
</script>

<style scoped>
.quick-preview {
  display: grid;
  gap: 14px;
  border: 1px solid #dcebdd;
  background: linear-gradient(135deg, #f7fcf8, #ffffff);
}

.content-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.head-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

h1 {
  margin: 0;
}

.desc {
  margin: 6px 0 0;
  color: #6b7280;
  line-height: 1.7;
}

.quick-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.quick-order-list,
.quick-plant-list,
.quick-cart-list {
  display: grid;
  gap: 10px;
}

.quick-order-item,
.quick-plant-item,
.quick-cart-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e5efe7;
  background: #fff;
}

.quick-order-item {
  cursor: pointer;
}

.quick-order-item:hover {
  border-color: rgba(31, 122, 65, 0.28);
  background: #f8fcf8;
}

.quick-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.quick-status.status-PENDING {
  background: #fff5d6;
  color: #946200;
}

.quick-status.status-PAID {
  background: #eef8f0;
  color: #1f7a41;
}

.quick-status.status-SHIPPED {
  background: #e7eefc;
  color: #2f5fb8;
}

.quick-status.status-DELIVERED {
  background: #dff5e4;
  color: #166534;
}

.quick-fav-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stat-tile {
  border-radius: 16px;
  border: 1px solid #e5efe7;
  background: #fbfefb;
  padding: 12px;
  display: grid;
  gap: 6px;
  min-width: 0;
}

.stat-label {
  color: #1f7a41;
  font-weight: 900;
  font-size: 12px;
}

.stat-value {
  color: #16351f;
  font-weight: 900;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  color: #9ca3af;
}

.sub {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}
</style>
