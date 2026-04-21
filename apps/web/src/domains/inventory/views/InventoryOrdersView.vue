<template>
  <InventoryLayout title="订单管理" subtitle="点击订单展开详情，点击发货直接更新订单状态">
    <template #actions>
      <button class="secondary-btn" @click="reload" :disabled="loading">{{ loading ? '加载中...' : '刷新' }}</button>
      <select v-model="statusFilter" class="tiny">
        <option value="">全部状态</option>
        <option value="PAID">待发货</option>
        <option value="SHIPPED">运输中</option>
        <option value="DELIVERED">已签收</option>
      </select>
    </template>

    <section v-if="selectedShippableOrders.length > 0" class="page-lite batch-panel">
      <div class="section-head">
        <div>
          <h2 class="section-title">批量发货</h2>
          <p class="sub">已选择 {{ selectedShippableOrders.length }} 笔待发货订单，点击按钮后会直接把这些订单更新为已发货状态。</p>
        </div>
        <button class="secondary-btn" @click="clearSelection">清空选择</button>
      </div>

      <div class="row-actions">
        <button @click="batchShip" :disabled="submitting">
          {{ submitting ? '提交中...' : '批量发货' }}
        </button>
      </div>
    </section>

    <section class="page-lite">
      <div class="section-head">
        <h2 class="section-title">订单列表</h2>
        <span class="sub">共 {{ filtered.length }} 单</span>
      </div>

      <div v-if="filtered.length === 0 && !loading" class="empty">暂无订单</div>

      <div v-else class="table">
        <div class="thead">
          <div class="check-col">
            <input
              type="checkbox"
              :checked="allEligibleSelected"
              :disabled="eligibleOrders.length === 0"
              @change="handleToggleSelectAll"
            />
          </div>
          <div>订单名称</div>
          <div>买家</div>
          <div>物流状态</div>
          <div class="right">操作</div>
        </div>

        <article
          v-for="order in filtered"
          :key="order.id"
          :class="['order-entry', { expanded: activeOrderId === order.id }]"
        >
          <div :class="['trow', { 'trow-expanded': activeOrderId === order.id }]" @click="toggle(order.id)">
            <div class="check-col" @click.stop>
              <input
                type="checkbox"
                :checked="selectedIds.has(order.id)"
                :disabled="order.status !== 'PAID'"
                @change="handleToggleSelect(order.id, $event)"
              />
            </div>
            <div class="name">
              <div class="title">{{ orderName(order) }}</div>
              <div class="sub">订单号：{{ order.orderNo }}</div>
            </div>
            <div class="sub">{{ order.buyerUsername || `用户#${order.buyerId || '-'}` }}</div>
            <div>
              <div class="pill">{{ logisticsLabel(order.shippingStatus, order.status) }}</div>
              <div class="sub meta">{{ logisticsMeta(order) }}</div>
            </div>
            <div class="right actions" @click.stop>
              <button
                v-if="order.status === 'PAID'"
                class="secondary-btn"
                @click="shipOrder(order.id)"
                :disabled="submitting"
              >
                {{ submitting && pendingOrderId === order.id ? '发货中...' : '发货' }}
              </button>
              <button v-else class="secondary-btn muted-btn" disabled>
                {{ order.status === 'DELIVERED' ? '已签收' : '已发货' }}
              </button>
            </div>
          </div>

          <div v-if="activeOrderId === order.id" class="detail-wrap">
            <div class="detail-divider"></div>

            <div class="detail-head">
              <div>
                <h3>订单详情：{{ order.orderNo }}</h3>
                <p class="sub">{{ order.buyerUsername || `用户#${order.buyerId || '-'}` }}</p>
              </div>
              <button class="secondary-btn" @click="close">关闭</button>
            </div>

            <div class="detail-panel">
              <div class="detail-banner">
                <span class="detail-badge">当前订单详情</span>
                <span class="detail-note">点击订单展开这里只查看明细，发货按钮会直接修改订单状态。</span>
              </div>

              <div class="grid grid-2 detail-grid">
                <div class="info-card">
                  <h4>物流状态</h4>
                  <p class="sub">{{ logisticsLabel(order.shippingStatus, order.status) }}</p>
                </div>
                <div class="info-card">
                  <h4>发货说明</h4>
                  <p class="sub">{{ shippingNote(order) }}</p>
                </div>
              </div>

              <div class="item-list">
                <div class="item-row" v-for="item in order.items || []" :key="`${order.id}-${item.productId}`">
                  <span>{{ item.productName }}</span>
                  <span>x{{ item.quantity }}</span>
                </div>
              </div>

              <div class="row-actions">
                <button
                  v-if="order.status === 'PAID'"
                  @click="shipOrder(order.id)"
                  :disabled="submitting"
                >
                  {{ submitting && pendingOrderId === order.id ? '发货中...' : '确认发货' }}
                </button>
                <button
                  v-if="order.status === 'SHIPPED'"
                  class="secondary-btn"
                  @click="updateLogistics(order.id, 'DELIVERED')"
                  :disabled="submitting"
                >
                  设为已签收
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="message" class="home-message">{{ message }}</p>
    </section>
  </InventoryLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import InventoryLayout from '../components/InventoryLayout.vue'
import {
  batchShipInventoryOrders,
  fetchInventoryOrders,
  shipInventoryOrder,
  updateInventoryOrderLogistics
} from '../api'

type InventoryOrderItem = {
  productId: number
  productName: string
  quantity: number
}

type InventoryOrder = {
  id: number
  orderNo: string
  status: string
  buyerId?: number
  buyerUsername?: string
  shippingCarrier?: string | null
  trackingNo?: string | null
  shippingStatus?: string | null
  items?: InventoryOrderItem[]
}

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const message = ref('')
const pendingOrderId = ref<number | null>(null)

const statusFilter = ref('')
const rows = ref<InventoryOrder[]>([])
const activeOrderId = ref<number | null>(null)
const selectedIds = ref<Set<number>>(new Set())

const filtered = computed(() => {
  if (!statusFilter.value) return rows.value
  return rows.value.filter((item) => item.status === statusFilter.value)
})

const eligibleOrders = computed(() => filtered.value.filter((item) => item.status === 'PAID'))
const selectedShippableOrders = computed(() => eligibleOrders.value.filter((item) => selectedIds.value.has(item.id)))
const allEligibleSelected = computed(() =>
  eligibleOrders.value.length > 0 && eligibleOrders.value.every((item) => selectedIds.value.has(item.id))
)

function orderName(order: InventoryOrder) {
  const items = Array.isArray(order.items) ? order.items : []
  if (items.length === 0) return order.orderNo || '订单'
  const first = items[0]?.productName || '商品'
  return items.length > 1 ? `${first} 等 ${items.length} 件` : first
}

function logisticsLabel(shippingStatus?: string | null, orderStatus?: string) {
  if (shippingStatus === 'DELIVERED' || orderStatus === 'DELIVERED') return '已签收'
  if (shippingStatus === 'IN_TRANSIT' || orderStatus === 'SHIPPED') return '已发货'
  return '待发货'
}

function logisticsMeta(order: InventoryOrder) {
  if (order.status === 'DELIVERED') return '订单已签收'
  if (order.status === 'SHIPPED') return '库存管理员已手动发货'
  return '点击发货后更新状态'
}

function shippingNote(order: InventoryOrder) {
  if (order.status === 'DELIVERED') return '该订单已经完成签收。'
  if (order.status === 'SHIPPED') return '该订单已由库存管理员手动发货。'
  return '当前项目不填写承运商，点击发货后会直接更新订单状态。'
}

async function reload() {
  loading.value = true
  error.value = ''
  message.value = ''

  try {
    rows.value = (await fetchInventoryOrders()) || []
    selectedIds.value = new Set(
      [...selectedIds.value].filter((id) => rows.value.some((row) => row.id === id && row.status === 'PAID'))
    )

    if (activeOrderId.value && !rows.value.some((row) => row.id === activeOrderId.value)) {
      activeOrderId.value = null
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || '订单数据加载失败'
  } finally {
    loading.value = false
  }
}

function toggle(orderId: number) {
  activeOrderId.value = activeOrderId.value === orderId ? null : orderId
  message.value = ''
  error.value = ''
}

function close() {
  activeOrderId.value = null
}

function toggleSelect(orderId: number, checked: boolean) {
  const next = new Set(selectedIds.value)
  if (checked) next.add(orderId)
  else next.delete(orderId)
  selectedIds.value = next
}

function toggleSelectAll(checked: boolean) {
  if (checked) {
    selectedIds.value = new Set(eligibleOrders.value.map((item) => item.id))
  } else {
    selectedIds.value = new Set()
  }
}

function handleToggleSelect(orderId: number, event: Event) {
  const checked = (event.target as HTMLInputElement | null)?.checked ?? false
  toggleSelect(orderId, checked)
}

function handleToggleSelectAll(event: Event) {
  const checked = (event.target as HTMLInputElement | null)?.checked ?? false
  toggleSelectAll(checked)
}

function clearSelection() {
  selectedIds.value = new Set()
}

async function shipOrder(orderId: number) {
  submitting.value = true
  pendingOrderId.value = orderId
  error.value = ''
  message.value = ''

  try {
    await shipInventoryOrder(orderId, {})
    message.value = '订单状态已更新为已发货'
    await reload()
  } catch (err: any) {
    error.value = err?.response?.data?.message || '发货失败'
  } finally {
    submitting.value = false
    pendingOrderId.value = null
  }
}

async function batchShip() {
  if (selectedShippableOrders.value.length === 0) {
    error.value = '请先选择待发货订单'
    return
  }

  submitting.value = true
  error.value = ''
  message.value = ''

  try {
    const shippedCount = selectedShippableOrders.value.length
    await batchShipInventoryOrders({
      orderIds: selectedShippableOrders.value.map((item) => item.id)
    })
    message.value = `已批量发货 ${shippedCount} 单`
    clearSelection()
    await reload()
  } catch (err: any) {
    error.value = err?.response?.data?.message || '批量发货失败'
  } finally {
    submitting.value = false
  }
}

async function updateLogistics(orderId: number, shippingStatus: string) {
  submitting.value = true
  pendingOrderId.value = orderId
  error.value = ''
  message.value = ''

  try {
    await updateInventoryOrderLogistics(orderId, { shippingStatus })
    message.value = '订单状态已更新'
    await reload()
  } catch (err: any) {
    error.value = err?.response?.data?.message || '状态更新失败'
  } finally {
    submitting.value = false
    pendingOrderId.value = null
  }
}

onMounted(reload)
</script>

<style scoped>
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  color: #16351f;
}

.batch-panel,
.table,
.item-list {
  display: grid;
  gap: 10px;
}

.detail-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.table {
  gap: 10px;
}

.thead,
.trow {
  display: grid;
  grid-template-columns: 44px 1.2fr 0.7fr 1.1fr 0.4fr;
  gap: 10px;
  align-items: center;
}

.thead {
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
  padding: 0 10px;
}

.order-entry {
  border: 1px solid #e4efe6;
  background: #f8fcf8;
  border-radius: 16px;
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.order-entry.expanded {
  border-color: #bdd7c5;
  box-shadow: 0 12px 30px rgba(31, 122, 65, 0.1);
}

.trow {
  padding: 12px 10px;
  cursor: pointer;
  transition: background-color 0.18s ease;
}

.trow:hover {
  background: rgba(237, 249, 239, 0.86);
}

.trow-expanded {
  background: linear-gradient(180deg, #f2faf4 0%, #edf8f0 100%);
}

.detail-wrap {
  display: grid;
  gap: 12px;
  padding: 0 12px 14px;
  background: linear-gradient(180deg, #f4fbf6 0%, #ffffff 100%);
}

.detail-divider {
  height: 1px;
  margin: 0 -12px;
  background: linear-gradient(90deg, transparent 0%, #bfdcc7 12%, #bfdcc7 88%, transparent 100%);
}

.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
}

.detail-head h3,
.info-card h4 {
  margin: 0;
  color: #16351f;
}

.detail-panel {
  display: grid;
  gap: 14px;
  padding: 14px;
  border: 1px solid #cfe3d5;
  border-left: 4px solid #2f8f4e;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fcf8 100%);
  box-shadow:
    0 10px 26px rgba(22, 53, 31, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.detail-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #eef8f0;
  border: 1px solid #d7ebdc;
}

.detail-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 5px 10px;
  border-radius: 999px;
  background: #1f7a41;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.detail-note {
  color: #587061;
  font-size: 12px;
  line-height: 1.5;
}

.check-col {
  display: flex;
  justify-content: center;
}

.right {
  text-align: right;
}

.actions {
  display: inline-flex;
  justify-content: flex-end;
}

.name .title {
  font-weight: 800;
  color: #1f2937;
}

.sub {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
}

.meta {
  margin-top: 6px;
}

.pill {
  display: inline-flex;
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid #d8f0de;
  background: #edf9ef;
  color: #1f7a41;
  font-weight: 800;
  font-size: 12px;
}

.empty {
  color: #6b7280;
  font-size: 13px;
}

.row-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tiny {
  padding: 8px 10px;
}

.info-card {
  display: grid;
  gap: 6px;
  padding: 12px;
  border-radius: 12px;
  background: #fbfefb;
  border: 1px solid #dcebe0;
}

.item-list {
  margin: 2px 0;
}

.item-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fbfefb;
  border: 1px solid #dcebe0;
}

.muted-btn {
  opacity: 0.7;
}

.error {
  margin: 10px 0 0;
  color: #d12f2f;
  font-weight: 700;
}

@media (max-width: 780px) {
  .detail-grid,
  .thead,
  .trow {
    grid-template-columns: 1fr;
  }

  .right {
    text-align: left;
  }

  .actions {
    justify-content: flex-start;
  }

  .check-col {
    justify-content: flex-start;
  }

  .detail-head,
  .section-head,
  .detail-banner {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
