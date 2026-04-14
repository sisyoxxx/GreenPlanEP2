<template>
  <AppLayout>
    <section class="admin-shell">
      <h1 class="admin-title">库存流水审计</h1>
      <button @click="load">刷新</button>
      <div class="list-stack">
        <div class="info-card" v-for="row in rows" :key="row.id">
          时间 {{ row.createdAt }} | 商品 {{ row.productId }} | 类型 {{ row.type }} | 数量 {{ row.quantity }} | 来源 {{ row.sourceRefType }} {{ row.sourceRefId }}
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import { fetchInventoryMovements } from '../api'

const rows = ref<any[]>([])

async function load() {
  rows.value = await fetchInventoryMovements()
}

onMounted(load)
</script>
