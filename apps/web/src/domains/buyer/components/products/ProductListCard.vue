<template>
  <article
    class="product-list-card page-lite"
    @click="emit('goDetail', product.id)"
  >
    <div class="product-cover">
      <img
        v-if="hasDisplayImage(product.imageUrl)"
        class="product-image"
        :src="product.imageUrl"
        :alt="product.name"
        loading="lazy"
      />
      <div v-else class="product-thumb">{{ productThumbText(product) }}</div>
    </div>
    <div class="product-list-content">
      <div class="product-list-top">
        <div>
          <span class="product-category-tag">{{ normalizeBuyerCategory(product.category) }}</span>
          <h3 class="product-title-link">{{ product.name }}</h3>
        </div>
        <span class="product-list-price">¥{{ formatPrice(product.price) }}</span>
      </div>
      <p class="product-desc">{{ product.description }}</p>
      <div class="product-extra-meta">
        <span>播种：{{ product.plantingMonth || '未设置' }}</span>
        <span>地区：{{ normalizeRegion(product.suitableRegion) }}</span>
        <span>销量：{{ product.sales ?? 0 }}</span>
      </div>
      <div class="product-actions">
        <button type="button" @click.stop="emit('buy', product)">立即购买</button>
        <button type="button" class="secondary-btn" @click.stop="emit('addToCart', product)">加入购物车</button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { formatPrice, hasDisplayImage } from '../../../../utils/format'
import { normalizeBuyerCategory } from '../../categoryConfig'
import type { Product } from '../../api'

defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  (e: 'buy', product: Product): void
  (e: 'addToCart', product: Product): void
  (e: 'goDetail', id: number): void
}>()

function normalizeRegion(region: string | null | undefined) {
  return region || '未设置'
}

function productThumbText(item: Product) {
  if (hasDisplayImage(item.imageUrl)) return item.name
  return normalizeBuyerCategory(item.category)
}
</script>

<style scoped>
.product-list-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.product-list-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(31, 122, 65, 0.08);
}

.product-cover {
  width: 100%;
}

.product-thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  color: #1f7a41;
  font-weight: 700;
  padding: 12px;
  text-align: center;
  font-size: 14px;
}

.product-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  object-fit: cover;
  display: block;
}

.product-list-content {
  display: grid;
  gap: 6px;
  width: 100%;
}

.product-list-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.product-category-tag {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}

.product-title-link {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
}

.product-list-price {
  margin: 0;
  color: #1f7a41;
  font-weight: 700;
  white-space: nowrap;
  font-size: 16px;
}

.product-desc {
  margin: 0;
  color: #6b7280;
  line-height: 1.65;
}

.product-extra-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #5f6d66;
}

.product-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
