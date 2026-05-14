<template>
  <InventoryLayout title="库存流水" subtitle="出入库与扣减记录">
    <template #actions>
      <input
        v-model.trim="keyword"
        class="search-input"
        type="search"
        placeholder="搜索商品名称 / 来源 / 备注"
      />
      <button class="secondary-btn" @click="reload" :disabled="loading">{{ loading ? '加载中…' : '刷新' }}</button>
    </template>

    <section class="page-lite">
      <div class="section-head">
        <h2 class="section-title">流水列表</h2>
        <span class="sub">共 {{ filteredRows.length }} 条</span>
      </div>

      <div v-if="filteredRows.length === 0 && !loading" class="empty">暂无流水记录</div>

      <div v-else class="table">
        <div class="thead">
          <div>时间</div>
          <div>商品名称</div>
          <div>类型</div>
          <div class="right">数量</div>
          <div>来源</div>
          <div>备注</div>
        </div>
        <div class="trow" v-for="m in filteredRows" :key="m.id">
          <div class="sub">{{ formatTime(m.createdAt) }}</div>
          <div class="name" :title="productName(m)">{{ productName(m) }}</div>
          <div class="pill">{{ m.type }}</div>
          <div class="right"><strong>{{ m.quantity }}</strong></div>
          <div class="sub">{{ m.sourceRefType }} {{ m.sourceRefId }}</div>
          <div class="sub">{{ m.remark || '-' }}</div>
        </div>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </section>
  </InventoryLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import InventoryLayout from '../components/InventoryLayout.vue'
import { fetchInventoryItems, fetchInventoryMovements } from '../api'

type Movement = any
type InventoryItem = { productId: number; name: string }

const loading = ref(false)
const error = ref('')
const keyword = ref('')
const rows = ref<Movement[]>([])
const items = ref<InventoryItem[]>([])

const filteredRows = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return rows.value
  return rows.value.filter((m) => {
    const texts = [
      productName(m),
      m.sourceRefType || '',
      m.sourceRefId || '',
      m.remark || '',
      m.type || ''
    ].join(' ').toLowerCase()
    return texts.includes(kw)
  })
})

const productNameMap = computed(() => {
  const map = new Map<number, string>()
  for (const it of items.value) {
    map.set(it.productId, it.name)
  }
  return map
})

function productName(movement: Movement): string {
  return productNameMap.value.get(Number(movement.productId)) || `商品#${movement.productId}`
}

function formatTime(value: any) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 19)
}

async function reload() {
  loading.value = true
  error.value = ''
  try {
    const [movementsRes, itemsRes] = await Promise.all([
      fetchInventoryMovements(),
      fetchInventoryItems()
    ])
    rows.value = movementsRes || []
    items.value = (itemsRes || []).map((it: any) => ({ productId: it.productId, name: it.name }))
  } catch (e: any) {
    error.value = e?.response?.data?.message || '加载失败'
  } finally {
    loading.value = false
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

.table {
  display: grid;
  gap: 8px;
}

.thead,
.trow {
  display: grid;
  grid-template-columns: 0.9fr 1.2fr 0.6fr 0.5fr 0.9fr 0.9fr;
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

.sub {
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name {
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  .thead,
  .trow {
    grid-template-columns: 1fr 0.6fr 0.8fr 0.6fr 1fr;
  }

  .thead > :last-child,
  .trow > :last-child {
    display: none;
  }
}
</style>

