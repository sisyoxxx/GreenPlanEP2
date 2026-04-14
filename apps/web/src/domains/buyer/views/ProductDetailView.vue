<template>
  <AppLayout>
    <div v-if="product" class="product-detail-shell page-lite">
      <div class="detail-cover">
        <div class="product-thumb detail-thumb">{{ product.imageUrl || (categoryLabelMap[product.category] ?? product.category) }}</div>
      </div>
      <div class="detail-content">
        <p class="hero-tag">{{ product.plantingMonth || '未设置月份' }} · {{ product.suitableRegion || '未设置地区' }}</p>
        <h1>{{ product.name }}</h1>
        <p class="detail-price">¥{{ product.price }}</p>
        <p class="hero-subtitle">{{ product.description }}</p>
        <div class="product-extra-meta">
          <span>分类：{{ categoryLabelMap[product.category] ?? product.category }}</span>
          <span>库存：{{ product.onlineStock }}</span>
        </div>
        <div class="product-actions">
          <button @click="goProducts">返回商品页</button>
        </div>
      </div>
    </div>
    <div v-else class="page-lite no-products">
      <h3>商品不存在</h3>
      <p class="product-desc">请返回商品页重新选择商品。</p>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import { fetchProducts, type Product } from '../api'

const route = useRoute()
const router = useRouter()
const product = ref<Product | null>(null)

const categoryLabelMap: Record<string, string> = {
  VEGETABLE: '蔬菜种子',
  FLOWER: '花卉种子',
  HERB: '香草种子',
  FRUIT: '营养肥料',
  TOOL: '园艺工具'
}

onMounted(async () => {
  const id = Number(route.params.id)
  const products = await fetchProducts()
  product.value = products.find((item) => item.id === id) ?? null
})

function goProducts() {
  router.push('/products')
}
</script>

<style scoped>
.product-detail-shell {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.detail-cover {
  width: 100%;
}

.detail-thumb {
  min-height: 280px;
  font-size: 22px;
}

.detail-content {
  display: grid;
  gap: 14px;
}

.detail-content h1,
.detail-price {
  margin: 0;
}

.detail-price {
  font-size: 28px;
  color: #1f7a41;
  font-weight: 700;
}

.product-extra-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #5f6d66;
}

@media (max-width: 1100px) {
  .product-detail-shell {
    grid-template-columns: 1fr;
  }
}
</style>
