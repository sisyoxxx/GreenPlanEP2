<template>
  <aside class="orders-sidebar page-lite">
    <div class="sidebar-head">
      <h2>交易中心</h2>
    </div>

    <div class="sidebar-search">
      <input
        :value="keyword"
        type="text"
        placeholder="搜索订单号或商品名"
        @input="$emit('update:keyword', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <nav class="sidebar-nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['nav-item', { active: activeTab === tab.key }]"
        @click="$emit('update:activeTab', tab.key)"
      >
        <span>{{ tab.label }}</span>
        <span v-if="tab.count > 0" class="nav-badge">{{ tab.count }}</span>
      </button>
    </nav>

    <div class="sidebar-summary">
      <div class="summary-card">
        <strong>{{ ordersCount }}</strong>
        <span>累计订单</span>
      </div>
      <div class="summary-card">
        <strong>{{ reviewsCount }}</strong>
        <span>我的评价</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { OrderTab } from '../../composables/useOrderCenter'

defineProps<{
  keyword: string
  activeTab: OrderTab
  tabs: { key: OrderTab; label: string; count: number }[]
  ordersCount: number
  reviewsCount: number
}>()

defineEmits<{
  (e: 'update:keyword', value: string): void
  (e: 'update:activeTab', value: OrderTab): void
}>()
</script>

<style scoped>
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

.sidebar-head h2 {
  margin: 0;
  color: #16351f;
}

.sidebar-search input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #d3d7de;
  background: #f8fcf8;
  font-size: 14px;
}

.sidebar-nav {
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
  cursor: pointer;
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
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
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

.summary-card span {
  color: #6b7280;
  font-size: 13px;
}

.orders-sidebar::-webkit-scrollbar {
  width: 8px;
}

.orders-sidebar::-webkit-scrollbar-thumb {
  background: #d2e3d6;
  border-radius: 999px;
}
</style>
