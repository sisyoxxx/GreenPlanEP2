<template>
  <AppLayout>
    <section class="admin-shell">
      <h1 class="admin-title">手动入库处理</h1>
      <form class="form-shell" @submit.prevent="submit">
        <input v-model.number="form.productId" type="number" min="1" placeholder="商品ID" required />
        <input v-model.number="form.quantity" type="number" min="1" placeholder="入库数量" required />
        <input v-model="form.note" placeholder="备注" />
        <button type="submit">确认入库</button>
      </form>
      <p class="home-message">{{ message }}</p>
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import { inboundStock } from '../api'

const form = reactive({ productId: 1, quantity: 10, note: '' })
const message = ref('')

async function submit() {
  await inboundStock(form)
  message.value = '入库处理成功'
}
</script>
