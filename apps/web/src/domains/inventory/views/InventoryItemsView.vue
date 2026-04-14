<template>
  <AppLayout>
    <section class="admin-shell">
      <h1 class="admin-title">在线库存列表</h1>
      <button @click="load">刷新</button>
      <div class="list-stack">
        <div class="info-card" v-for="item in items" :key="item.id">
          商品ID {{ item.product.id }}，库存 {{ item.onlineStock }}，预警阈值 {{ item.warningThreshold }}
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import { fetchInventoryItems } from '../api'

const items = ref<any[]>([])

async function load() {
  items.value = await fetchInventoryItems()
}

onMounted(load)
</script>
