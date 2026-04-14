<template>
  <AdminLayout>
    <h2 class="page-title">工作台</h2>
    <p class="page-desc">商城经营概览与快捷操作</p>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div><div class="stat-value">{{ overview.totalOrders ?? 0 }}</div><div class="stat-label">总订单</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div><div class="stat-value">¥{{ overview.grossSales ?? 0 }}</div><div class="stat-label">销售总额</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div><div class="stat-value">{{ overview.totalProducts ?? 12 }}</div><div class="stat-label">商品总数</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div><div class="stat-value">{{ overview.pendingReviews ?? 5 }}</div><div class="stat-label">待回复评价</div></div>
      </div>
    </div>

    <div class="dash-grid">
      <div class="dash-panel page-lite">
        <h3>最近订单</h3>
        <div class="recent-list">
          <div class="recent-item" v-for="o in recentOrders" :key="o.id">
            <span class="recent-no">{{ o.orderNo }}</span>
            <span class="recent-amount">¥{{ o.amount }}</span>
            <span :class="['status-tag', `st-${o.status}`]">{{ o.statusText }}</span>
          </div>
        </div>
      </div>
      <div class="dash-panel page-lite">
        <h3>快捷操作</h3>
        <div class="quick-actions">
          <button @click="$router.push('/admin/orders')">查看全部订单</button>
          <button @click="$router.push('/admin/products')">管理商品</button>
          <button @click="$router.push('/admin/reports/sales')">销量分析</button>
          <button @click="$router.push('/admin/reviews')">处理评价</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import { fetchSalesOverview } from '../api'

const overview = ref<Record<string, any>>({})
const recentOrders = [
  { id: 1, orderNo: 'GP2-20260410-0012', amount: 128, status: 'pending', statusText: '待付款' },
  { id: 2, orderNo: 'GP2-20260411-0013', amount: 65.5, status: 'shipped', statusText: '运输中' },
  { id: 3, orderNo: 'GP2-20260411-0014', amount: 210, status: 'delivered', statusText: '待签收' },
  { id: 4, orderNo: 'GP2-20260412-0015', amount: 89, status: 'paid', statusText: '待发货' },
  { id: 5, orderNo: 'GP2-20260412-0016', amount: 156, status: 'completed', statusText: '已完成' }
]

onMounted(async () => {
  try { overview.value = await fetchSalesOverview() } catch { /* use defaults */ }
})
</script>

<style scoped>
.page-title { margin: 0; font-size: 22px; color: #1f2937; }
.page-desc { margin: 4px 0 16px; font-size: 13px; color: #9ca3af; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }

.stat-card {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 18px; background: #fff;
  border-radius: 12px; border: 1px solid #e6f0e8;
}

.stat-icon { font-size: 28px; }
.stat-value { font-size: 22px; font-weight: 700; color: #1f2937; }
.stat-label { font-size: 12px; color: #9ca3af; margin-top: 2px; }

.dash-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 14px; }
.dash-panel h3 { margin: 0 0 12px; font-size: 16px; color: #1f2937; }

.recent-list { display: grid; gap: 8px; }

.recent-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; background: #f8fcf8; border-radius: 8px;
}

.recent-no { flex: 1; font-size: 13px; color: #374151; }
.recent-amount { font-weight: 600; font-size: 14px; }

.status-tag {
  padding: 2px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 600;
}

.st-pending { background: #fef3c7; color: #92400e; }
.st-paid { background: #dbeafe; color: #1e40af; }
.st-shipped { background: #e0e7ff; color: #3730a3; }
.st-delivered { background: #d1fae5; color: #065f46; }
.st-completed { background: #f3f4f6; color: #6b7280; }

.quick-actions { display: grid; gap: 8px; }
.quick-actions button { text-align: left; padding: 10px 14px; border-radius: 8px; }
</style>
