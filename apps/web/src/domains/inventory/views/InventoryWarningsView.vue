<template>
  <AppLayout>
    <section class="admin-shell">
      <h1 class="admin-title">库存预警设置</h1>
      <form class="form-shell" @submit.prevent="submit">
        <input v-model.number="form.productId" type="number" min="1" placeholder="商品ID" required />
        <input v-model.number="form.warningThreshold" type="number" min="0" placeholder="预警阈值" required />
        <button type="submit">保存</button>
      </form>
      <p class="home-message">{{ message }}</p>
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import { updateWarningThreshold } from '../api'

const form = reactive({ productId: 1, warningThreshold: 10 })
const message = ref('')

async function submit() {
  await updateWarningThreshold(form.productId, form.warningThreshold)
  message.value = '库存预警阈值已更新'
}
</script>
