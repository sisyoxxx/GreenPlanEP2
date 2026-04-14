<template>
  <AppLayout>
    <section class="admin-shell">
      <h1 class="admin-title">库存管理员看板</h1>
      <p class="admin-subtitle">低库存商品数量：{{ warnings.length }}</p>
      <div class="list-stack">
        <div class="info-card" v-for="item in warnings" :key="item.id">
          商品ID {{ item.product.id }} 当前库存 {{ item.onlineStock }} / 预警阈值 {{ item.warningThreshold }}
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import { fetchInventoryWarnings } from '../api'

const warnings = ref<any[]>([])

onMounted(async () => {
  warnings.value = await fetchInventoryWarnings()
})
</script>
