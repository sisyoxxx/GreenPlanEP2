<template>
  <AdminLayout>
    <h2 class="page-title">订单管理</h2>
    <div class="order-toolbar">
      <div class="tab-bar">
        <button v-for="t in tabs" :key="t.key" :class="['tab-btn', { active: activeTab === t.key }]" @click="activeTab = t.key">
          {{ t.label }}
          <span v-if="t.count" class="tab-count">{{ t.count }}</span>
        </button>
      </div>
      <input v-model="search" type="text" placeholder="搜索订单号..." class="search-input" />
    </div>

    <div class="order-table-wrap page-lite">
      <table class="order-table">
        <thead>
          <tr>
            <th>订单号</th><th>客户</th><th>金额</th><th>状态</th><th>下单时间</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in filteredOrders" :key="o.id">
            <td class="cell-no">{{ o.orderNo }}</td>
            <td>{{ o.customer }}</td>
            <td class="cell-amount">¥{{ o.amount }}</td>
            <td><span :class="['status-tag', `st-${o.status}`]">{{ o.statusText }}</span></td>
            <td class="cell-date">{{ o.date }}</td>
            <td>
              <button class="text-link" @click="viewOrder(o)">详情</button>
              <button v-if="o.status==='paid'" class="text-link" @click="shipOrder(o)">发货</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredOrders.length === 0" class="empty-hint">暂无匹配订单</div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'

const activeTab = ref('all')
const search = ref('')

const orders = ref([
  { id: 1, orderNo: 'GP2-20260401-0001', customer: '张三', amount: 128, status: 'pending', statusText: '待付款', date: '2026-04-01' },
  { id: 2, orderNo: 'GP2-20260403-0002', customer: '李四', amount: 65.5, status: 'paid', statusText: '待发货', date: '2026-04-03' },
  { id: 3, orderNo: 'GP2-20260405-0003', customer: '王五', amount: 210, status: 'shipped', statusText: '运输中', date: '2026-04-05' },
  { id: 4, orderNo: 'GP2-20260406-0004', customer: '赵六', amount: 89, status: 'delivered', statusText: '待签收', date: '2026-04-06' },
  { id: 5, orderNo: 'GP2-20260407-0005', customer: '孙七', amount: 156, status: 'completed', statusText: '已完成', date: '2026-04-07' },
  { id: 6, orderNo: 'GP2-20260408-0006', customer: '周八', amount: 320, status: 'pending', statusText: '待付款', date: '2026-04-08' },
  { id: 7, orderNo: 'GP2-20260410-0007', customer: '吴九', amount: 45, status: 'paid', statusText: '待发货', date: '2026-04-10' },
  { id: 8, orderNo: 'GP2-20260411-0008', customer: '郑十', amount: 198, status: 'shipped', statusText: '运输中', date: '2026-04-11' },
  { id: 9, orderNo: 'GP2-20260412-0009', customer: '陈一', amount: 76, status: 'completed', statusText: '已完成', date: '2026-04-12' },
  { id: 10, orderNo: 'GP2-20260412-0010', customer: '刘二', amount: 430, status: 'delivered', statusText: '待签收', date: '2026-04-12' }
])

const tabs = computed(() => [
  { key: 'all', label: '全部', count: orders.value.length },
  { key: 'pending', label: '待付款', count: orders.value.filter(o => o.status === 'pending').length },
  { key: 'paid', label: '待发货', count: orders.value.filter(o => o.status === 'paid').length },
  { key: 'shipped', label: '运输中', count: orders.value.filter(o => o.status === 'shipped').length },
  { key: 'delivered', label: '待签收', count: orders.value.filter(o => o.status === 'delivered').length },
  { key: 'completed', label: '已完成', count: orders.value.filter(o => o.status === 'completed').length }
])

const filteredOrders = computed(() => {
  let list = orders.value
  if (activeTab.value !== 'all') list = list.filter(o => o.status === activeTab.value)
  if (search.value) list = list.filter(o => o.orderNo.toLowerCase().includes(search.value.toLowerCase()))
  return list
})

function viewOrder(o: any) { alert(`查看订单详情：${o.orderNo}`) }
function shipOrder(o: any) { o.status = 'shipped'; o.statusText = '运输中' }
</script>

<style scoped>
.page-title { margin: 0 0 14px; font-size: 22px; color: #1f2937; }

.order-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; }

.tab-bar { display: flex; gap: 6px; flex-wrap: wrap; }

.tab-btn {
  padding: 6px 14px; border-radius: 8px; border: 1px solid #e6ece7;
  background: #fff; color: #374151; font-size: 13px; cursor: pointer;
  display: flex; align-items: center; gap: 6px;
}

.tab-btn.active { background: #e6f4ea; color: #1f7a41; font-weight: 600; border-color: #80ab64; }
.tab-count { background: #80ab64; color: #fff; font-size: 11px; padding: 0 6px; border-radius: 50%; min-width: 18px; text-align: center; }

.search-input { padding: 8px 14px; border-radius: 8px; border: 1px solid #d3d7de; font-size: 13px; width: 200px; }

.order-table-wrap { overflow-x: auto; }

.order-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.order-table th { text-align: left; padding: 10px 12px; color: #9ca3af; font-size: 12px; font-weight: 600; border-bottom: 1px solid #f0f0f0; }
.order-table td { padding: 10px 12px; border-bottom: 1px solid #f8f8f8; }
.order-table tr:hover td { background: #fafdfb; }

.cell-no { font-weight: 600; color: #1f2937; }
.cell-amount { font-weight: 600; }
.cell-date { color: #9ca3af; font-size: 13px; }

.status-tag { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.st-pending { background: #fef3c7; color: #92400e; }
.st-paid { background: #dbeafe; color: #1e40af; }
.st-shipped { background: #e0e7ff; color: #3730a3; }
.st-delivered { background: #d1fae5; color: #065f46; }
.st-completed { background: #f3f4f6; color: #6b7280; }

.text-link { background: transparent; color: #1f7a41; border: none; padding: 2px 6px; font-size: 13px; cursor: pointer; }
.text-link:hover { text-decoration: underline; }

.empty-hint { text-align: center; padding: 30px; color: #9ca3af; }
</style>
