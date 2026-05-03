<template>
  <div v-if="loading" class="page-lite no-products">
    <h3>商品加载中...</h3>
  </div>
  <div v-else-if="error" class="page-lite no-products">
    <h3>商品加载失败</h3>
    <p class="product-desc">{{ error }}</p>
  </div>
  <div v-else-if="isEmpty" class="page-lite no-products">
    <h3>暂无匹配商品</h3>
    <p class="product-desc">{{ emptyStateText }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean
  error: string
  isEmpty: boolean
  emptyStateText: string
}>()
</script>

<style scoped>
.no-products {
  display: grid;
  gap: 8px;
}

.no-products h3 {
  margin: 0;
}

.product-desc {
  margin: 0;
  color: #6b7280;
  line-height: 1.7;
}
</style>
