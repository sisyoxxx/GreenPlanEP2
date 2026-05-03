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

        <InventoryOrderCard
          v-for="order in filtered"
          :key="order.id"
          :order="order"
          :expanded="activeOrderId === order.id"
          :selected="selectedIds.has(order.id)"
          :submitting="submitting"
          :pending="pendingOrderId === order.id"
          @toggle="toggle(order.id)"
          @select="(checked: boolean) => toggleSelect(order.id, checked)"
          @ship="shipOrder(order.id)"
          @updateLogistics="(status: string) => updateLogistics(order.id, status)"
        />
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="message" class="home-message">{{ message }}</p>
    </section>
  </InventoryLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import InventoryLayout from '../components/InventoryLayout.vue'
import InventoryOrderCard from '../components/InventoryOrderCard.vue'
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
.table {
  display: grid;
  gap: 10px;
}

.thead {
  display: grid;
  grid-template-columns: 44px 1.2fr 0.7fr 1.1fr 0.4fr;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
  padding: 0 10px;
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

.sub {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
}

.check-col {
  display: flex;
  justify-content: center;
}

.right {
  text-align: right;
}

.error {
  margin: 10px 0 0;
  color: #d12f2f;
  font-weight: 700;
}

@media (max-width: 780px) {
  .thead {
    grid-template-columns: 1fr;
  }

  .right {
    text-align: left;
  }

  .check-col {
    justify-content: flex-start;
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
