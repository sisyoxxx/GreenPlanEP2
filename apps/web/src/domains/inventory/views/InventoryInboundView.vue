<template>
  <InventoryLayout title="入库" subtitle="采购入库与补货">
    <template #actions>
      <RouterLink class="text-link" to="/inventory/items">回到商品库存 →</RouterLink>
    </template>

    <section class="page-lite">
      <h2 class="section-title">手动入库</h2>
      <p class="admin-subtitle">选择商品并填写入库数量，系统会生成入库记录与库存流水。</p>

      <form class="form-shell" @submit.prevent="submit">
        <div class="grid grid-2">
          <label class="field">
            <span class="field-label">商品</span>
            <select v-model.number="form.productId" required>
              <option v-for="p in products" :key="p.productId" :value="p.productId">
                #{{ p.productId }} {{ p.name }}（库存：{{ p.onlineStock }}）
              </option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">入库数量</span>
            <input v-model.number="form.quantity" type="number" min="1" required />
          </label>
        </div>
        <label class="field">
          <span class="field-label">备注（可选）</span>
          <input v-model="form.note" placeholder="例如：采购入库 / 仓库盘点" />
        </label>
        <div class="row-actions">
          <button class="secondary-btn" type="button" @click="reset">重置</button>
          <button type="submit" :disabled="submitting">{{ submitting ? '提交中…' : '确认入库' }}</button>
        </div>
      </form>

      <p v-if="message" class="home-message">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </section>

    <section class="page-lite">
      <div class="section-head">
        <h2 class="section-title">低库存提示</h2>
        <RouterLink class="text-link" to="/inventory/warnings">查看全部预警 →</RouterLink>
      </div>
      <div v-if="warnings.length === 0" class="empty">暂无预警商品</div>
      <ul v-else class="hint-list">
        <li v-for="w in warnings.slice(0, 6)" :key="w.productId">
          {{ w.name }}：库存 {{ w.onlineStock }}（阈值 {{ w.warningThreshold }}）
        </li>
      </ul>
    </section>
  </InventoryLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import InventoryLayout from '../components/InventoryLayout.vue'
import { fetchInventoryItems, fetchInventoryWarnings, inboundStock } from '../api'

type InventoryRow = {
  productId: number
  sku?: string
  name: string
  onlineStock: number
  warningThreshold: number
}

const products = ref<InventoryRow[]>([])
const warnings = ref<InventoryRow[]>([])

const submitting = ref(false)
const message = ref('')
const error = ref('')

const form = reactive({ productId: 1, quantity: 10, note: '' })

async function loadOptions() {
  products.value = (await fetchInventoryItems()) || []
  if (products.value.length > 0) form.productId = products.value[0].productId
  warnings.value = (await fetchInventoryWarnings()) || []
}

function reset() {
  form.quantity = 10
  form.note = ''
  message.value = ''
  error.value = ''
}

async function submit() {
  submitting.value = true
  message.value = ''
  error.value = ''
  try {
    await inboundStock({ productId: form.productId, quantity: form.quantity, note: form.note })
    message.value = '入库成功'
    reset()
    await loadOptions()
  } catch (e: any) {
    error.value = e?.response?.data?.message || '入库失败'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    await loadOptions()
  } catch (e: any) {
    error.value = e?.response?.data?.message || '加载失败'
  }
})
</script>

<style scoped>
.section-title {
  margin: 0;
  font-size: 18px;
  color: #16351f;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.field {
  display: grid;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  color: #4b5563;
}

.row-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hint-list {
  margin: 0;
  padding-left: 18px;
  color: #4b5563;
  line-height: 1.8;
}

.empty {
  color: #6b7280;
  font-size: 13px;
}
</style>

