<template>
  <AdminLayout>
    <div class="page-shell">
      <section class="page-head page-lite">
        <div>
          <h2 class="page-title">订单管理</h2>
          <p class="page-desc">仅查看订单状态与详情，发货流程由库存端处理，评价回复请到“用户评价”页面。</p>
        </div>
        <button class="secondary-btn" :disabled="loading" @click="loadOrders">{{ loading ? '刷新中...' : '刷新' }}</button>
      </section>

      <section class="page-lite filter-card">
        <div class="tab-row">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
            <span class="tab-count">{{ tab.count }}</span>
          </button>
        </div>
        <input v-model.trim="keyword" type="text" placeholder="搜索订单号或用户名" />
      </section>

      <section class="page-lite table-card">
        <p v-if="message" class="message">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>

        <div v-if="loading && list.length === 0" class="empty-state">订单加载中...</div>
        <div v-else-if="filtered.length === 0" class="empty-state">暂无匹配订单</div>

        <div v-else class="table-wrap">
          <table class="order-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>用户</th>
                <th>金额</th>
                <th>订单状态</th>
                <th>物流状态</th>
                <th>下单时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filtered" :key="item.id">
                <td class="mono">{{ item.orderNo }}</td>
                <td>{{ item.buyerUsername || `用户#${item.buyerId}` }}</td>
                <td>¥{{ Number(item.totalAmount).toFixed(2) }}</td>
                <td><span :class="['status-tag', statusClass(item.status)]">{{ statusLabel(item.status) }}</span></td>
                <td><span :class="['status-tag', 'logistics']">{{ shippingLabel(item.shippingStatus) }}</span></td>
                <td>{{ formatDateTime(item.createdAt) }}</td>
                <td>
                  <div class="row-actions">
                    <button class="text-link" @click="viewDetail(item.id)">详情</button>
                    <button class="text-link" @click="goReviews">评价管理</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import { fetchAdminOrders, type AdminOrderListItem } from '../api'
import { formatDateTime } from '../../../utils/format'
import { ORDER_STATUS_MAP, SHIPPING_STATUS_MAP, ORDER_STATUS_CLASS } from '../../../utils/constants'

type TabKey = 'all' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'PENDING'

const router = useRouter()
const loading = ref(false)
const message = ref('')
const error = ref('')
const keyword = ref('')
const activeTab = ref<TabKey>('all')
const list = ref<AdminOrderListItem[]>([])

const tabs = computed(() => {
  const count = (status: string) => list.value.filter((item) => item.status === status).length
  return [
    { key: 'all' as TabKey, label: '全部', count: list.value.length },
    { key: 'PENDING' as TabKey, label: '待支付', count: count('PENDING') },
    { key: 'PAID' as TabKey, label: '待发货', count: count('PAID') },
    { key: 'SHIPPED' as TabKey, label: '运输中', count: count('SHIPPED') },
    { key: 'DELIVERED' as TabKey, label: '已收货', count: count('DELIVERED') }
  ]
})

const filtered = computed(() => {
  let data = list.value
  if (activeTab.value !== 'all') {
    data = data.filter((item) => item.status === activeTab.value)
  }
  const kw = keyword.value.toLowerCase()
  if (!kw) return data
  return data.filter((item) => {
    const user = item.buyerUsername || ''
    return item.orderNo.toLowerCase().includes(kw) || user.toLowerCase().includes(kw)
  })
})

onMounted(loadOrders)

async function loadOrders() {
  loading.value = true
  error.value = ''
  try {
    list.value = await fetchAdminOrders()
  } catch (err: any) {
    error.value = err?.response?.data?.message || '订单加载失败'
  } finally {
    loading.value = false
  }
}

function statusLabel(status: string) {
  return ORDER_STATUS_MAP[status] || status
}

function shippingLabel(status: string | null) {
  return status ? (SHIPPING_STATUS_MAP[status] || status) : '未同步'
}

function statusClass(status: string) {
  return ORDER_STATUS_CLASS[status] || 'default'
}

function viewDetail(id: number) {
  router.push(`/admin/orders/${id}`)
}

function goReviews() {
  router.push('/admin/reviews')
}
</script>

<style scoped>
.page-shell {
  display: grid;
  gap: 14px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.page-title {
  margin: 0;
  color: #16351f;
}

.page-desc {
  margin: 6px 0 0;
  color: #6b7280;
}

.filter-card {
  display: grid;
  gap: 10px;
}

.tab-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  border: 1px solid #e3ece5;
  border-radius: 999px;
  background: #fff;
  color: #374151;
  padding: 6px 12px;
}

.tab-btn.active {
  border-color: #9ad3aa;
  color: #1f7a41;
  background: #edf9ef;
}

.tab-count {
  border-radius: 999px;
  background: #f4f7f4;
  color: #4b5563;
  font-size: 12px;
  padding: 0 6px;
}

.table-card {
  display: grid;
  gap: 10px;
}

.table-wrap {
  overflow-x: auto;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
}

.order-table th,
.order-table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid #edf1ee;
}

.order-table th {
  color: #6b7280;
  font-size: 12px;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.status-tag {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-tag.pending {
  background: #fff7d6;
  color: #9a6a00;
}

.status-tag.paid {
  background: #e7eefc;
  color: #2f5fb8;
}

.status-tag.shipped {
  background: #ede9fe;
  color: #5b21b6;
}

.status-tag.delivered {
  background: #e8f6eb;
  color: #1f7a41;
}

.status-tag.default,
.status-tag.logistics {
  background: #f3f4f6;
  color: #6b7280;
}

.row-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.text-link {
  border: none;
  background: transparent;
  color: #1f7a41;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
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
  color: #6b7280;
  padding: 20px 0;
  text-align: center;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

@media (max-width: 760px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
