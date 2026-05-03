<template>
  <AdminLayout>
    <div class="page-shell">
      <section class="page-head page-lite">
        <div>
          <h2 class="page-title">订单详情</h2>
          <p class="page-desc">{{ detail ? detail.orderNo : '正在加载...' }}</p>
        </div>
        <div class="head-actions">
          <button class="secondary-btn" @click="goBack">返回订单列表</button>
          <button @click="goReviews">评价管理</button>
        </div>
      </section>

      <section v-if="loading" class="page-lite empty-state">详情加载中...</section>
      <section v-else-if="error" class="page-lite empty-state error">{{ error }}</section>

      <template v-else-if="detail">
        <section class="page-lite overview-card">
          <div class="overview-grid">
            <div>
              <span class="label">订单状态</span>
              <p><span :class="['status-tag', statusClass(detail.status)]">{{ statusLabel(detail.status) }}</span></p>
            </div>
            <div>
              <span class="label">物流状态</span>
              <p>{{ shippingLabel(detail.shippingStatus) }}</p>
            </div>
            <div>
              <span class="label">订单金额</span>
              <p>¥{{ Number(detail.totalAmount).toFixed(2) }}</p>
            </div>
            <div>
              <span class="label">购买用户</span>
              <p>{{ detail.buyerUsername || `用户#${detail.buyerId}` }}</p>
            </div>
          </div>
        </section>

        <section class="page-lite timeline-card">
          <h3>订单进程时间</h3>
          <ul class="timeline">
            <li>
              <strong>下单时间</strong>
              <span>{{ formatDateTime(detail.createdAt) }}</span>
            </li>
            <li>
              <strong>发货时间</strong>
              <span>{{ detail.shippedAt ? formatDateTime(detail.shippedAt) : '未发货' }}</span>
            </li>
            <li>
              <strong>收货状态</strong>
              <span>{{ detail.status === 'DELIVERED' ? '已收货' : '未收货' }}</span>
            </li>
          </ul>
        </section>

        <section class="page-lite items-card">
          <h3>购买商品</h3>
          <div v-if="detail.items.length === 0" class="empty-state">暂无商品数据</div>
          <table v-else class="item-table">
            <thead>
              <tr>
                <th>商品</th>
                <th>单价</th>
                <th>数量</th>
                <th>小计</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in detail.items" :key="`${detail.id}-${item.productId}`">
                <td>
                  <button class="link-btn" @click="goProducts(item.productName)">{{ item.productName }}</button>
                </td>
                <td>¥{{ Number(item.price).toFixed(2) }}</td>
                <td>{{ item.quantity }}</td>
                <td>¥{{ Number(item.lineTotal).toFixed(2) }}</td>
                <td>
                  <button class="text-link" @click="goProducts(item.productName)">去商品管理</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="page-lite review-card">
          <h3>收货后评价</h3>
          <div v-if="detail.reviews.length === 0" class="empty-state">该订单暂无评价</div>
          <div v-else class="review-list">
            <article v-for="review in detail.reviews" :key="review.id" class="review-item">
              <div class="review-head">
                <strong>{{ review.productName }}</strong>
                <span class="rating">{{ renderStars(review.rating) }}</span>
              </div>
              <p>{{ review.content }}</p>
              <span class="meta">{{ review.buyerUsername }} · {{ formatDateTime(review.createdAt) }}</span>
            </article>
          </div>
        </section>
      </template>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import { fetchAdminOrderDetail, type AdminOrderDetail } from '../api'
import { formatDateTime, renderStars } from '../../../utils/format'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const detail = ref<AdminOrderDetail | null>(null)

onMounted(loadDetail)

async function loadDetail() {
  const id = Number(route.params.id)
  if (!Number.isFinite(id) || id <= 0) {
    error.value = '订单编号无效'
    return
  }

  loading.value = true
  error.value = ''
  try {
    detail.value = await fetchAdminOrderDetail(id)
  } catch (err: any) {
    error.value = err?.response?.data?.message || '订单详情加载失败'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/admin/orders')
}

function goReviews() {
  router.push('/admin/reviews')
}

function goProducts(keyword?: string) {
  const query = keyword ? { keyword } : undefined
  router.push({ path: '/admin/products', query })
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

function shippingLabel(status: string | null) {
  const map: Record<string, string> = {
    PENDING: '待处理',
    IN_TRANSIT: '运输中',
    DELIVERED: '已送达'
  }
  return status ? (map[status] || status) : '未同步'
}

function statusClass(status: string) {
  if (status === 'PENDING') return 'pending'
  if (status === 'PAID') return 'paid'
  if (status === 'SHIPPED') return 'shipped'
  if (status === 'DELIVERED') return 'delivered'
  return 'default'
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

.head-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.label {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

.overview-grid p {
  margin: 6px 0 0;
  color: #1f2937;
  font-weight: 700;
}

.timeline-card,
.items-card,
.review-card {
  display: grid;
  gap: 10px;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.timeline li {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e5efe7;
  background: #fbfefb;
}

.item-table {
  width: 100%;
  border-collapse: collapse;
}

.item-table th,
.item-table td {
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #edf1ee;
}

.item-table th {
  color: #6b7280;
  font-size: 12px;
}

.link-btn,
.text-link {
  border: none;
  background: transparent;
  color: #1f7a41;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-align: left;
}

.review-list {
  display: grid;
  gap: 10px;
}

.review-item {
  border: 1px solid #e5efe7;
  border-radius: 12px;
  background: #fbfefb;
  padding: 12px;
  display: grid;
  gap: 8px;
}

.review-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.rating {
  color: #f59e0b;
}

.review-item p {
  margin: 0;
  color: #4b5563;
  line-height: 1.7;
}

.meta {
  color: #6b7280;
  font-size: 12px;
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

.status-tag.default {
  background: #f3f4f6;
  color: #6b7280;
}

.empty-state {
  color: #6b7280;
}

.empty-state.error {
  color: #dc2626;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

@media (max-width: 980px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
