<template>
  <div>
    <div class="section-head">
      <h2>{{ products.length > 0 ? '精选商品' : '教程卡片' }}</h2>
      <button class="secondary-btn" @click="products.length > 0 ? $emit('goTutorials') : $emit('goTutorials')">
        {{ products.length > 0 ? '查看全部商品' : '查看全部教程' }}
      </button>
    </div>

    <div v-if="products.length > 0" class="featured-grid">
      <article
        v-for="item in products"
        :key="item.id"
        class="featured-product page-lite"
        @click="$emit('goProductDetail', item.id)"
      >
        <img v-if="hasDisplayImage(item.imageUrl)" class="product-image product-cover-media" :src="item.imageUrl" :alt="item.name" loading="lazy" />
        <div v-else class="product-thumb product-cover-media">{{ normalizeBuyerCategory(item.category) }}</div>
        <h3 class="product-title">{{ item.name }}</h3>
        <p class="product-desc">{{ item.description }}</p>
        <div class="product-meta">
          <span>￥{{ formatPrice(item.price) }}</span>
          <span>销量 {{ item.sales ?? 0 }}</span>
        </div>
        <div class="product-actions">
          <button @click.stop="$emit('addToCart', item)">加入购物车</button>
          <button class="secondary-btn" @click.stop="$emit('goProductDetail', item.id)">查看详情</button>
        </div>
      </article>
    </div>

    <div v-else class="featured-grid">
      <article v-for="item in tutorials" :key="item.id" class="featured-product page-lite tutorial-card">
        <div class="product-thumb" :style="{ background: item.backgroundStyle }">{{ item.tag }}</div>
        <h3 class="product-title">{{ item.title }}</h3>
        <p class="product-desc">{{ item.description }}</p>
        <div class="product-meta">
          <span>{{ item.difficulty || '精选' }}</span>
          <span>{{ formatDuration(item.durationMinutes) }}</span>
        </div>
        <div class="product-actions">
          <button @click="$emit('goTutorials')">进入教程页</button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice, hasDisplayImage } from '../../../utils/format'
import { normalizeBuyerCategory } from '../categoryConfig'
import type { Product, TutorialItem } from '../api'

defineProps<{
  products: Product[]
  tutorials: TutorialItem[]
}>()

defineEmits<{
  (e: 'addToCart', item: Product): void
  (e: 'goProductDetail', id: number): void
  (e: 'goTutorials'): void
}>()

function formatDuration(durationMinutes: number | null) {
  return durationMinutes ? `${durationMinutes} 分钟` : '图文教程'
}
</script>

<style scoped>
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-head h2 {
  margin: 0;
  font-size: 20px;
  color: #16351f;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.featured-product {
  display: grid;
  gap: 10px;
  cursor: pointer;
}

.tutorial-card {
  background: #fcfffc;
}

.product-cover-media {
  width: 100%;
  aspect-ratio: 4 / 3;
  min-height: 0;
  border-radius: 12px;
}

.product-thumb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  border-radius: 12px;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  color: #1f7a41;
  font-weight: 700;
}

.product-thumb.product-cover-media {
  min-height: 0;
  padding: 12px;
  text-align: center;
}

.product-image {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  display: block;
}

.product-title {
  margin: 0;
}

.product-desc {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: #1f2937;
}

.product-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 950px) {
  .featured-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
