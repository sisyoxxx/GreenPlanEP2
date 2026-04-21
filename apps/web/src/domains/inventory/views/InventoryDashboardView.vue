<template>
  <InventoryLayout title="工作台" subtitle="库存分析与管理概览">
    <template #actions>
      <button class="secondary-btn" @click="reload" :disabled="loading">{{ loading ? '加载中…' : '刷新' }}</button>
    </template>

    <section class="stats-grid">
      <div class="info-card">
        <h3>SKU 数</h3>
        <p class="kpi">{{ items.length }}</p>
      </div>
      <div class="info-card">
        <h3>总库存</h3>
        <p class="kpi">{{ totalStock }}</p>
      </div>
      <div class="info-card">
        <h3>预警商品</h3>
        <p class="kpi warn">{{ warnings.length }}</p>
      </div>
      <div class="info-card">
        <h3>最近 20 条流水</h3>
        <p class="kpi">{{ movements.length }}</p>
      </div>
    </section>

    <section class="page-lite">
      <h2 class="section-title">库存概览</h2>
      <p class="admin-subtitle">按库存量简单分桶，帮助快速判断补货压力。</p>
      <div class="bucket-grid">
        <div class="bucket" v-for="b in buckets" :key="b.label">
          <div class="bucket-top">
            <span class="bucket-label">{{ b.label }}</span>
            <span class="bucket-count">{{ b.count }}</span>
          </div>
          <div class="bucket-bar">
            <div class="bucket-fill" :style="{ width: `${b.percent}%` }"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="page-lite">
      <div class="section-head">
        <h2 class="section-title">预警清单</h2>
        <div class="section-actions">
          <RouterLink class="text-link" to="/inventory/warnings">去预警设置 →</RouterLink>
          <RouterLink class="text-link" to="/inventory/procurement">生成采购计划 →</RouterLink>
        </div>
      </div>

      <div v-if="warnings.length === 0" class="empty">暂无预警商品</div>
      <div v-else class="table">
        <div class="thead">
          <div>商品</div>
          <div class="right">库存</div>
          <div class="right">预警阈值</div>
        </div>
        <div class="trow" v-for="row in warnings.slice(0, 8)" :key="row.productId">
          <div class="name">
            <div class="title">{{ row.name }}</div>
            <div class="sub">ID：{{ row.productId }} · SKU：{{ row.sku || '-' }}</div>
          </div>
          <div class="right"><strong>{{ row.onlineStock }}</strong></div>
          <div class="right">{{ row.warningThreshold }}</div>
        </div>
      </div>
    </section>

    <section class="page-lite">
      <div class="section-head">
        <h2 class="section-title">最近流水</h2>
        <RouterLink class="text-link" to="/inventory/movements">查看全部 →</RouterLink>
      </div>
      <div v-if="movements.length === 0" class="empty">暂无流水</div>
      <div v-else class="table movements">
        <div class="thead">
          <div>时间</div>
          <div>商品ID</div>
          <div>类型</div>
          <div class="right">数量</div>
          <div>来源</div>
        </div>
        <div class="trow" v-for="m in movements" :key="m.id">
          <div class="sub">{{ formatTime(m.createdAt) }}</div>
          <div>#{{ m.productId }}</div>
          <div class="pill">{{ m.type }}</div>
          <div class="right"><strong>{{ m.quantity }}</strong></div>
          <div class="sub">{{ m.sourceRefType }} {{ m.sourceRefId }}</div>
        </div>
      </div>
    </section>

    <p v-if="error" class="error page-lite">{{ error }}</p>
  </InventoryLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import InventoryLayout from '../components/InventoryLayout.vue'
import { fetchInventoryItems, fetchInventoryMovements, fetchInventoryWarnings } from '../api'

type InventoryItem = {
  productId: number
  sku?: string
  name: string
  onlineStock: number
  warningThreshold: number
}

type InventoryMovement = any

const loading = ref(false)
const error = ref('')
const items = ref<InventoryItem[]>([])
const warnings = ref<InventoryItem[]>([])
const movements = ref<InventoryMovement[]>([])

const totalStock = computed(() => items.value.reduce((sum, it) => sum + (Number(it.onlineStock) || 0), 0))

const buckets = computed(() => {
  const total = items.value.length || 1
  const counts: Record<string, number> = {
    '≤ 5': 0,
    '6–20': 0,
    '21–50': 0,
    '51+': 0
  }

  for (const it of items.value) {
    const stock = Number(it.onlineStock) || 0
    if (stock <= 5) counts['≤ 5'] += 1
    else if (stock <= 20) counts['6–20'] += 1
    else if (stock <= 50) counts['21–50'] += 1
    else counts['51+'] += 1
  }

  return Object.entries(counts).map(([label, count]) => ({
    label,
    count,
    percent: Math.round((count / total) * 100)
  }))
})

function formatTime(value: any) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 19)
}

async function reload() {
  loading.value = true
  error.value = ''
  try {
    const [itemsRes, warningsRes, movementsRes] = await Promise.all([
      fetchInventoryItems(),
      fetchInventoryWarnings(),
      fetchInventoryMovements()
    ])
    items.value = itemsRes || []
    warnings.value = warningsRes || []
    movements.value = (movementsRes || []).slice(0, 20)
  } catch (e: any) {
    error.value = e?.response?.data?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(reload)
</script>

<style scoped>
.kpi {
  font-size: 28px;
  font-weight: 900;
  color: #16351f;
}

.warn {
  color: #dc2626;
}

.section-title {
  margin: 0;
  font-size: 18px;
  color: #16351f;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.section-actions {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.bucket-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.bucket {
  border: 1px solid #e4efe6;
  background: #f8fcf8;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 8px;
}

.bucket-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.bucket-label {
  font-weight: 800;
  color: #1f7a41;
}

.bucket-count {
  font-weight: 900;
  color: #1f2937;
}

.bucket-bar {
  height: 10px;
  border-radius: 999px;
  background: #e7f3ea;
  overflow: hidden;
}

.bucket-fill {
  height: 100%;
  background: linear-gradient(90deg, #2f855a, #80ab64);
}

.table {
  display: grid;
  gap: 8px;
}

.thead,
.trow {
  display: grid;
  grid-template-columns: 1.4fr 0.6fr 0.8fr;
  gap: 10px;
  align-items: center;
}

.movements .thead,
.movements .trow {
  grid-template-columns: 1fr 0.6fr 0.8fr 0.6fr 1.2fr;
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

.pill {
  display: inline-flex;
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid #d8f0de;
  background: #edf9ef;
  color: #1f7a41;
  font-weight: 800;
  font-size: 12px;
}

.empty {
  color: #6b7280;
  font-size: 13px;
}

@media (max-width: 720px) {
  .bucket-grid {
    grid-template-columns: 1fr;
  }
}
</style>

