<template>
  <AppLayout>
    <div class="inventory-shell">
      <aside class="inventory-nav page-lite">
        <div class="nav-title">库存管理</div>
        <p class="nav-sub">库存管理员工作区</p>

        <nav class="nav-list">
          <RouterLink to="/inventory/profile" class="nav-item" active-class="nav-active">个人信息</RouterLink>
          <div class="nav-divider"></div>
          <RouterLink to="/inventory/dashboard" class="nav-item" active-class="nav-active">工作台</RouterLink>
          <RouterLink to="/inventory/orders" class="nav-item" active-class="nav-active">订单管理</RouterLink>
          <RouterLink to="/inventory/items" class="nav-item" active-class="nav-active">商品库存</RouterLink>
          <RouterLink to="/inventory/inbound" class="nav-item" active-class="nav-active">入库</RouterLink>
          <RouterLink to="/inventory/warnings" class="nav-item" active-class="nav-active">库存预警</RouterLink>
          <RouterLink to="/inventory/movements" class="nav-item" active-class="nav-active">库存流水</RouterLink>
          <RouterLink to="/inventory/procurement" class="nav-item" active-class="nav-active">采购计划</RouterLink>
        </nav>
      </aside>

      <main class="inventory-main">
        <header class="page-lite inventory-header">
          <div v-if="title">
            <p class="hero-tag">{{ subtitleText }}</p>
            <h1 class="inventory-title">{{ title }}</h1>
          </div>
          <div class="header-actions">
            <slot name="actions" />
          </div>
        </header>

        <slot />
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'

const props = defineProps<{
  title?: string
  subtitle?: string
}>()

const route = useRoute()
const subtitleText = computed(() => props.subtitle ?? route.path.replace('/inventory/', ''))
</script>

<style scoped>
.inventory-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.inventory-nav {
  display: grid;
  gap: 10px;
}

.nav-title {
  font-size: 18px;
  font-weight: 800;
  color: #16351f;
}

.nav-sub {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.nav-list {
  display: grid;
  gap: 8px;
}

.nav-item {
  display: block;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fcf8;
  border: 1px solid #e4efe6;
  color: #1f2937;
  text-decoration: none;
  font-weight: 600;
}

.nav-item:hover {
  border-color: #cfead6;
  color: #1f7a41;
}

.nav-active {
  background: #edf9ef;
  border-color: #cfead6;
  color: #1f7a41;
}

.nav-divider {
  height: 1px;
  background: #eef3ef;
  margin: 4px 0;
}

.inventory-main {
  display: grid;
  gap: 12px;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.inventory-title {
  margin: 0;
  font-size: 24px;
  color: #16351f;
}

.hero-tag {
  margin: 0 0 6px;
  font-size: 12px;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .inventory-shell {
    grid-template-columns: 1fr;
  }
}
</style>
