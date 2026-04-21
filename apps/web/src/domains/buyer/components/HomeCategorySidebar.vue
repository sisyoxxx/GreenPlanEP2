<template>
  <aside class="home-sidebar left-sidebar page-lite">
    <section class="sidebar-section">
      <h3 class="sidebar-title">商品分类</h3>

      <div class="sidebar-list sidebar-grid-list">
        <button
          v-for="item in BUYER_CATEGORY_DEFINITIONS"
          :key="item.label"
          type="button"
          class="sidebar-list-item sidebar-grid-item sidebar-grid-button"
          @click="goCategory(item.label)"
        >
          <span class="sidebar-icon" aria-hidden="true">{{ item.icon }}</span>
          <div class="sidebar-grid-text">
            <div class="sidebar-item-title">{{ item.label }}</div>
            <div class="sidebar-item-desc">{{ item.desc }}</div>
          </div>
        </button>
      </div>
    </section>

    <section class="sidebar-section">
      <h3 class="sidebar-title">贴心服务</h3>
      <div v-for="service in services" :key="service.title" class="mini-service-card">
        <div class="sidebar-item-title">{{ service.title }}</div>
        <div class="sidebar-item-desc">{{ service.desc }}</div>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BUYER_CATEGORY_DEFINITIONS } from '../categoryConfig'

const router = useRouter()

const services = [
  { title: '新手指引', desc: '从播种、浇水到养护节奏，帮你快速上手。' },
  { title: '时令推荐', desc: '根据当前适播季节挑选更适合的商品。' }
]

function goCategory(category: string) {
  router.push({
    path: '/products',
    query: { category }
  })
}
</script>

<style scoped>
.home-sidebar {
  display: grid;
  gap: 12px;
}

.sidebar-section {
  display: grid;
  gap: 8px;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  color: #1f7a41;
}

.sidebar-list {
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.sidebar-grid-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sidebar-list-item,
.mini-service-card {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px;
  border-radius: 12px;
  background: #f8fcf8;
  border: 1px solid #e4efe6;
}

.sidebar-grid-button {
  width: 100%;
  cursor: pointer;
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.sidebar-grid-button:hover {
  transform: translateY(-1px);
  border-color: #bfdcc7;
  box-shadow: 0 8px 18px rgba(31, 122, 65, 0.08);
}

.sidebar-grid-item {
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 96px;
}

.sidebar-grid-text {
  display: grid;
  gap: 2px;
}

.sidebar-icon {
  font-size: 20px;
}

.sidebar-item-title {
  font-weight: 600;
  color: #1f2937;
}

.sidebar-item-desc {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.55;
}

@media (max-width: 1280px) {
  .left-sidebar .sidebar-item-desc {
    display: none;
  }
}

@media (max-width: 950px) {
  .left-sidebar {
    gap: 10px;
  }

  .left-sidebar .sidebar-section {
    gap: 6px;
  }

  .left-sidebar .sidebar-title {
    font-size: 16px;
  }

  .left-sidebar .sidebar-grid-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .left-sidebar .sidebar-grid-item {
    min-height: 78px;
    padding: 8px 6px;
  }

  .left-sidebar .sidebar-item-title {
    font-size: 13px;
  }

  .left-sidebar .mini-service-card {
    padding: 8px 10px;
  }
}

@media (max-width: 485px) {
  .left-sidebar {
    display: none;
  }
}
</style>
