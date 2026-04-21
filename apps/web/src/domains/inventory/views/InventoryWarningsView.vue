<template>
  <InventoryLayout title="库存预警" subtitle="查看预警商品并调整阈值">
    <template #actions>
      <button class="secondary-btn" @click="reload" :disabled="loading">{{ loading ? '加载中…' : '刷新' }}</button>
      <RouterLink class="text-link" to="/inventory/procurement">生成采购计划 →</RouterLink>
    </template>

    <section class="page-lite">
      <div class="section-head">
        <h2 class="section-title">预警列表</h2>
        <span class="sub">预警商品：{{ rows.length }} 个</span>
      </div>

      <div v-if="rows.length === 0 && !loading" class="empty">
        暂无预警商品（库存高于阈值时不会出现在这里）。
      </div>

      <div v-else class="table">
        <div class="thead">
          <div>商品</div>
          <div class="right">库存</div>
          <div class="right">阈值</div>
          <div class="right">调整阈值</div>
        </div>
        <div class="trow" v-for="r in rows" :key="r.productId">
          <div class="name">
            <div class="title">{{ r.name }}</div>
            <div class="sub">ID：{{ r.productId }} · SKU：{{ r.sku || '-' }}</div>
          </div>
          <div class="right">
            <strong class="stock">{{ r.onlineStock }}</strong>
          </div>
          <div class="right">{{ r.warningThreshold }}</div>
          <div class="right formcell">
            <input v-model.number="thresholdEdits[String(r.productId)]" class="tiny" type="number" min="0" />
            <button class="secondary-btn" @click="saveThreshold(r)" :disabled="submittingId === r.productId">
              {{ submittingId === r.productId ? '保存中…' : '保存' }}
            </button>
          </div>
        </div>
      </div>

      <p v-if="message" class="home-message">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </section>
  </InventoryLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import InventoryLayout from '../components/InventoryLayout.vue'
import { fetchInventoryWarnings, updateWarningThreshold } from '../api'

type InventoryRow = {
  productId: number
  sku?: string
  name: string
  onlineStock: number
  warningThreshold: number
}

const loading = ref(false)
const error = ref('')
const message = ref('')
const rows = ref<InventoryRow[]>([])

const thresholdEdits = reactive<Record<string, number>>({})
const submittingId = ref<number | null>(null)

async function reload() {
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    rows.value = (await fetchInventoryWarnings()) || []
    for (const r of rows.value) {
      const pid = String(r.productId)
      if (thresholdEdits[pid] == null) thresholdEdits[pid] = Number(r.warningThreshold ?? 5)
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

async function saveThreshold(row: InventoryRow) {
  const productId = Number(row.productId)
  if (!Number.isFinite(productId)) return
  const val = Number(thresholdEdits[String(productId)])
  if (!Number.isFinite(val) || val < 0) {
    error.value = '预警阈值必须为非负数'
    return
  }

  submittingId.value = productId
  error.value = ''
  message.value = ''
  try {
    await updateWarningThreshold(productId, val)
    message.value = '预警阈值已更新'
    await reload()
  } catch (e: any) {
    error.value = e?.response?.data?.message || '更新失败'
  } finally {
    submittingId.value = null
  }
}

onMounted(reload)
</script>

<style scoped>
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  color: #16351f;
}

.table {
  display: grid;
  gap: 8px;
}

.thead,
.trow {
  display: grid;
  grid-template-columns: 1.5fr 0.5fr 0.6fr 1fr;
  gap: 10px;
  align-items: center;
}

.thead {
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
  padding: 0 10px;
}

.trow {
  border: 1px solid #e4efe6;
  background: #f8fcf8;
  border-radius: 12px;
  padding: 10px;
}

.right {
  text-align: right;
}

.name .title {
  font-weight: 800;
  color: #1f2937;
}

.sub {
  font-size: 12px;
  color: #6b7280;
}

.stock {
  color: #dc2626;
}

.formcell {
  display: inline-flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.tiny {
  width: 90px;
  padding: 8px 10px;
}

.empty {
  color: #6b7280;
  font-size: 13px;
}
</style>

