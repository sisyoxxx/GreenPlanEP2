<template>
  <InventoryLayout title="采购计划" subtitle="根据库存预警生成建议">
    <template #actions>
      <button class="secondary-btn" @click="reload" :disabled="loading">{{ loading ? '生成中…' : '重新生成' }}</button>
      <button @click="exportCsv" :disabled="plan.length === 0">导出 CSV</button>
    </template>

    <section class="page-lite">
      <h2 class="section-title">生成规则（简化版）</h2>
      <ul class="rule-list">
        <li>仅对“库存 ≤ 预警阈值”的商品生成采购建议</li>
        <li>建议采购量 = max(0, 预警阈值 × 3 - 当前库存)</li>
      </ul>
    </section>

    <section class="page-lite">
      <div class="section-head">
        <h2 class="section-title">采购建议</h2>
        <span class="sub">共 {{ plan.length }} 项</span>
      </div>

      <div v-if="plan.length === 0 && !loading" class="empty">暂无需要采购的商品</div>

      <div v-else class="table">
        <div class="thead">
          <div>商品</div>
          <div class="right">库存</div>
          <div class="right">阈值</div>
          <div class="right">建议采购量</div>
          <div>备注</div>
        </div>
        <div class="trow" v-for="p in plan" :key="p.productId">
          <div class="name">
            <div class="title">{{ p.name }}</div>
            <div class="sub">ID：{{ p.productId }} · SKU：{{ p.sku || '-' }}</div>
          </div>
          <div class="right"><strong class="stock">{{ p.onlineStock }}</strong></div>
          <div class="right">{{ p.warningThreshold }}</div>
          <div class="right">
            <input v-model.number="p.recommendQty" class="tiny" type="number" min="0" />
          </div>
          <div class="sub">{{ p.note }}</div>
        </div>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="message" class="home-message">{{ message }}</p>
    </section>
  </InventoryLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import InventoryLayout from '../components/InventoryLayout.vue'
import { fetchInventoryWarnings } from '../api'

type PlanRow = {
  productId: number
  sku?: string
  name: string
  onlineStock: number
  warningThreshold: number
  recommendQty: number
  note: string
}

const loading = ref(false)
const error = ref('')
const message = ref('')
const plan = ref<PlanRow[]>([])

async function reload() {
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    const warnings = (await fetchInventoryWarnings()) || []
    plan.value = warnings.map((w: any) => {
      const productId = Number(w.productId)
      const onlineStock = Number(w.onlineStock) || 0
      const warningThreshold = Number(w.warningThreshold) || 0
      const recommendQty = Math.max(0, warningThreshold * 3 - onlineStock)
      return {
        productId,
        sku: w.sku,
        name: w.name || `商品 #${productId}`,
        onlineStock,
        warningThreshold,
        recommendQty,
        note: '根据预警自动生成'
      }
    })
    if (plan.value.length === 0) message.value = '当前无需采购'
  } catch (e: any) {
    error.value = e?.response?.data?.message || '生成失败'
  } finally {
    loading.value = false
  }
}

function exportCsv() {
  if (plan.value.length === 0) return
  const header = ['productId', 'sku', 'name', 'onlineStock', 'warningThreshold', 'recommendQty']
  const rows = plan.value.map((p) => [
    p.productId,
    p.sku || '',
    p.name,
    p.onlineStock,
    p.warningThreshold,
    p.recommendQty
  ])
  const csv = [header, ...rows]
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
.section-title {
  margin: 0;
  font-size: 18px;
  color: #16351f;
}

.rule-list {
  margin: 10px 0 0;
  padding-left: 18px;
  color: #4b5563;
  line-height: 1.9;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.table {
  display: grid;
  gap: 8px;
}

.thead,
.trow {
  display: grid;
  grid-template-columns: 1.4fr 0.5fr 0.5fr 0.6fr 0.8fr;
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

.tiny {
  width: 110px;
  padding: 8px 10px;
}

.empty {
  color: #6b7280;
  font-size: 13px;
}
</style>

