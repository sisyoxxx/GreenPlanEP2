<template>
  <section class="page-lite stats-card">
    <div class="stats-head">
      <div>
        <h1 class="stats-title">我的概览</h1>
        <p class="desc">轻量统计，用来展示你的全流程进度。</p>
      </div>
      <div class="head-actions">
        <button type="button" class="secondary-btn" @click="router.push('/products')">去选购</button>
        <button type="button" class="secondary-btn" @click="router.push('/community')">去社区</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-tile">
        <span class="stat-label">购物车</span>
        <strong class="stat-value">{{ cartUniqueCount }} 种 · {{ cartItemCount }} 件</strong>
      </div>
      <div class="stat-tile">
        <span class="stat-label">收藏</span>
        <strong class="stat-value">教程 {{ favoriteTutorialCount }} · 帖子 {{ favoritePostCount }}</strong>
      </div>
      <div class="stat-tile">
        <span class="stat-label">收货地址</span>
        <strong class="stat-value">{{ addressCount }} 个</strong>
      </div>
      <div class="stat-tile">
        <span class="stat-label">账号</span>
        <strong class="stat-value">@{{ username || '-' }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps<{
  cartUniqueCount: number
  cartItemCount: number
  favoriteTutorialCount: number
  favoritePostCount: number
  addressCount: number
  username: string
}>()
</script>

<style scoped>
.stats-card {
  display: grid;
  gap: 14px;
  border: 1px solid #dcebdd;
  background: linear-gradient(135deg, #f7fcf8, #ffffff);
}

.stats-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.stats-title {
  margin: 0;
  font-size: 18px;
  color: #16351f;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
