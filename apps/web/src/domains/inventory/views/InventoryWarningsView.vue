<template>
  <InventoryLayout title="库存预警" subtitle="查看预警商品、调整阈值并生成采购计划">
    <template #actions>
      <button class="secondary-btn" @click="reload" :disabled="loading">{{ loading ? '加载中…' : '刷新' }}</button>
      <button v-if="plan.length > 0" class="secondary-btn" @click="exportCsv">导出采购计划</button>
    </template>

    <section class="page-lite">
      <div class="section-head">
        <div>
          <h2 class="section-title">预警列表</h2>
          <p class="section-subtitle">
            仅对“库存 ≤ 预警阈值”的商品生成采购建议。建议采购量 = max(0, 预警阈值 × 3 − 当前库存)
          </p>
        </div>
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
          <div class="right">建议采购量</div>
          <div class="right">操作</div>
        </div>
        <div class="trow" v-for="r in enrichedRows" :key="r.productId">
          <div class="name">
            <div class="title">{{ r.name }}</div>
            <div class="sub">ID：{{ r.productId }} · SKU：{{ r.sku || '-' }}</div>
          </div>
          <div class="right">
            <strong class="stock">{{ r.onlineStock }}</strong>
          </div>
          <div class="right">
            <template v-if="editingId === r.productId">
              <input
                v-model.number="editValues[String(r.productId)].warningThreshold"
                class="tiny"
                type="number"
                min="0"
                @input="onThresholdInput(r)"
              />
            </template>
            <template v-else>{{ r.warningThreshold }}</template>
          </div>
          <div class="right">
            <template v-if="editingId === r.productId">
              <input v-model.number="editValues[String(r.productId)].recommendQty" class="tiny" type="number" min="0" />
            </template>
            <template v-else>
              <span :class="['qty', { zero: r.recommendQty <= 0 }]">{{ r.recommendQty }}</span>
            </template>
          </div>
          <div class="right formcell">
            <template v-if="editingId === r.productId">
              <button class="secondary-btn" @click="saveEdit(r)" :disabled="submittingId === r.productId">
                {{ submittingId === r.productId ? '保存中…' : '保存' }}
              </button>
              <button class="secondary-btn" @click="resetEdit(r)">重置</button>
            </template>
            <template v-else>
              <button class="secondary-btn" @click="startEdit(r)">编辑</button>
            </template>
          </div>
        </div>
      </div>

      <p v-if="message" class="home-message">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </section>
  </InventoryLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import InventoryLayout from '../components/InventoryLayout.vue'
import { fetchInventoryWarnings, updateWarningThreshold } from '../api'

type InventoryRow = {
  productId: number
  sku?: string
  name: string
  onlineStock: number
  warningThreshold: number
}

type PlanRow = InventoryRow & {
  recommendQty: number
}

const loading = ref(false)
const error = ref('')
const message = ref('')
const rows = ref<InventoryRow[]>([])

const editingId = ref<number | null>(null)
const editValues = reactive<Record<string, { warningThreshold: number; recommendQty: number }>>({})
const submittingId = ref<number | null>(null)

const enrichedRows = computed<(InventoryRow & { recommendQty: number })[]>(() => {
  return rows.value.map((r) => {
    const recommendQty = Math.max(0, r.warningThreshold * 3 - r.onlineStock)
    return { ...r, recommendQty }
  })
})

const plan = computed<PlanRow[]>(() => {
  return enrichedRows.value.filter((r) => r.recommendQty > 0)
})

async function reload() {
  loading.value = true
  error.value = ''
  message.value = ''
  editingId.value = null
  try {
    rows.value = (await fetchInventoryWarnings()) || []
  } catch (e: any) {
    error.value = e?.response?.data?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function startEdit(row: InventoryRow & { recommendQty: number }) {
  editingId.value = row.productId
  const pid = String(row.productId)
  const recommendQty = Math.max(0, row.warningThreshold * 3 - row.onlineStock)
  editValues[pid] = {
    warningThreshold: row.warningThreshold,
    recommendQty
  }
}

function onThresholdInput(row: InventoryRow) {
  const pid = String(row.productId)
  const val = Number(editValues[pid]?.warningThreshold) || 0
  editValues[pid].recommendQty = Math.max(0, val * 3 - row.onlineStock)
}

function resetEdit(row: InventoryRow) {
  const pid = String(row.productId)
  const recommendQty = Math.max(0, row.warningThreshold * 3 - row.onlineStock)
  editValues[pid] = {
    warningThreshold: row.warningThreshold,
    recommendQty
  }
}

async function saveEdit(row: InventoryRow) {
  const pid = String(row.productId)
  const val = Number(editValues[pid]?.warningThreshold)
  if (!Number.isFinite(val) || val < 0) {
    error.value = '预警阈值必须为非负数'
    return
  }

  submittingId.value = row.productId
  error.value = ''
  message.value = ''
  try {
    await updateWarningThreshold(row.productId, val)
    message.value = '预警阈值已更新'
    editingId.value = null
    await reload()
  } catch (e: any) {
    error.value = e?.response?.data?.message || '更新失败'
  } finally {
    submittingId.value = null
  }
}

function exportCsv() {
  if (plan.value.length === 0) return
  const header = ['productId', 'sku', 'name', 'onlineStock', 'warningThreshold', 'recommendQty']
  const csvRows = plan.value.map((p) => [
    p.productId,
    p.sku || '',
    p.name,
    p.onlineStock,
    p.warningThreshold,
    p.recommendQty
  ])
  const csv = [header, ...csvRows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `procurement-plan-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
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
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
  padding: 8px 0;
}

.section-title {
  margin: 0;
  font-size: 18px;
  color: #16351f;
}

.section-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
}

.table {
  display: grid;
  gap: 8px;
}

.thead,
.trow {
  display: grid;
  grid-template-columns: 1.3fr 0.4fr 0.45fr 0.55fr 0.85fr;
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

.qty {
  font-weight: 700;
  color: #1f7a41;
}

.qty.zero {
  color: #9ca3af;
  font-weight: 400;
}

.formcell {
  display: inline-flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.tiny {
  width: 72px;
  padding: 8px 10px;
}

.empty {
  color: #6b7280;
  font-size: 13px;
}
</style>
