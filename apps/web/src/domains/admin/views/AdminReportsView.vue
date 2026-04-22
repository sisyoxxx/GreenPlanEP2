<template>
  <AdminLayout>
    <h2 class="page-title">销量分析</h2>
    <p class="page-desc">基于当前商品真实销量，展示热销排行与滞销预警。</p>

    <div v-if="error" class="page-lite error-box">{{ error }}</div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon">￥</div>
        <div>
          <div class="stat-value">¥{{ formatMoney(summary.grossSales) }}</div>
          <div class="stat-label">销售总额</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">单</div>
        <div>
          <div class="stat-value">{{ summary.totalOrders }}</div>
          <div class="stat-label">总订单数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">均</div>
        <div>
          <div class="stat-value">¥{{ formatMoney(summary.avgOrder) }}</div>
          <div class="stat-label">客单价</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">类</div>
        <div>
          <div class="stat-value">{{ categoryText(summary.topCategory) }}</div>
          <div class="stat-label">热销品类</div>
        </div>
      </div>
    </div>

    <div class="report-grid">
      <div class="page-lite chart-panel">
        <h3>商品销量 TOP 10</h3>
        <div v-if="loading" class="empty-state">销量数据加载中...</div>
        <div v-else-if="top10.length === 0" class="empty-state">暂无销量数据</div>
        <div v-else class="bar-chart">
          <div class="bar-row" v-for="(item, i) in top10" :key="`${item.productId}-${item.name}`">
            <span class="bar-rank" :class="{ gold: i===0, silver: i===1, bronze: i===2 }">{{ i+1 }}</span>
            <span class="bar-name">{{ item.name }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: (item.sales / topBase * 100) + '%' }"></div>
            </div>
            <span class="bar-value">{{ item.sales }}件</span>
          </div>
        </div>
      </div>

      <div class="page-lite slow-panel">
        <h3>滞销预警（销量 &lt; 5）</h3>
        <div v-if="loading" class="empty-state">加载中...</div>
        <div v-else-if="slowMoving.length === 0" class="empty-state">当前无滞销商品</div>
        <div v-else class="slow-list">
          <div class="slow-item" v-for="item in slowMoving" :key="`${item.productId}-${item.name}`">
            <span class="slow-name">{{ item.name }}</span>
            <span class="slow-sales">{{ item.sales }}件</span>
            <span class="slow-tag">建议促销</span>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import { fetchSalesOverview } from '../api'

type SalesRow = {
  productId: number
  name: string
  category: string
  sales: number
}

type SalesOverview = {
  totalOrders: number
  totalUnits: number
  grossSales: number
  avgOrder: number
  topCategory: string
  top10: SalesRow[]
  slowMoving: SalesRow[]
}

const loading = ref(false)
const error = ref('')
const overview = ref<SalesOverview>({
  totalOrders: 0,
  totalUnits: 0,
  grossSales: 0,
  avgOrder: 0,
  topCategory: 'N/A',
  top10: [],
  slowMoving: []
})

const summary = computed(() => ({
  totalOrders: overview.value.totalOrders ?? 0,
  grossSales: overview.value.grossSales ?? 0,
  avgOrder: overview.value.avgOrder ?? 0,
  topCategory: overview.value.topCategory ?? 'N/A'
}))

const top10 = computed(() => overview.value.top10 ?? [])
const slowMoving = computed(() => overview.value.slowMoving ?? [])
const topBase = computed(() => {
  if (top10.value.length === 0) return 1
  return Math.max(1, top10.value[0].sales ?? 1)
})

const categoryMap: Record<string, string> = {
  VEGETABLE: '蔬菜',
  HERB: '香草',
  FLOWER: '花卉',
  SUCCULENT: '多肉',
  TOOL: '园艺工具',
  FERTILIZER: '肥料',
  N_A: '暂无'
}

function categoryText(code: string) {
  if (!code) return '暂无'
  return categoryMap[code] ?? code
}

function formatMoney(value: number) {
  const n = Number(value)
  if (Number.isNaN(n)) return '0.00'
  return n.toFixed(2)
}

async function loadOverview() {
  loading.value = true
  error.value = ''
  try {
    overview.value = await fetchSalesOverview()
  } catch (e) {
    console.error(e)
    error.value = '销量分析加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

onMounted(loadOverview)
</script>

<style scoped>
.page-title { margin: 0; font-size: 22px; color: #1f2937; }
.page-desc { margin: 4px 0 16px; font-size: 13px; color: #9ca3af; }

.error-box {
  margin-bottom: 14px;
  color: #b91c1c;
  border: 1px solid #fecaca;
  background: #fef2f2;
}

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.stat-card { display: flex; align-items: center; gap: 12px; padding: 16px 18px; background: #fff; border-radius: 12px; border: 1px solid #e6f0e8; }
.stat-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #edf5ef;
  color: #2f5d3f;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-value { font-size: 22px; font-weight: 700; color: #1f2937; }
.stat-label { font-size: 12px; color: #9ca3af; margin-top: 2px; }

.report-grid { display: grid; grid-template-columns: 1.4fr 0.6fr; gap: 14px; }
.chart-panel h3, .slow-panel h3 { margin: 0 0 14px; font-size: 16px; color: #1f2937; }

.bar-chart { display: grid; gap: 10px; }
.bar-row { display: flex; align-items: center; gap: 10px; }

.bar-rank {
  width: 24px; height: 24px; border-radius: 6px;
  background: #f3f4f6; color: #6b7280;
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.bar-rank.gold { background: #fef3c7; color: #92400e; }
.bar-rank.silver { background: #e5e7eb; color: #374151; }
.bar-rank.bronze { background: #fde68a; color: #78350f; }

.bar-name { width: 140px; font-size: 13px; color: #374151; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.bar-track { flex: 1; height: 22px; background: #f3f4f6; border-radius: 6px; overflow: hidden; }
.bar-fill { height: 100%; background: #80ab64; border-radius: 6px; transition: width 0.6s ease; }

.bar-value { width: 50px; text-align: right; font-size: 13px; font-weight: 600; color: #1f2937; flex-shrink: 0; }

.slow-list { display: grid; gap: 8px; }

.slow-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; background: #fefce8; border-radius: 8px; border: 1px solid #fef3c7;
}

.slow-name { flex: 1; font-size: 13px; color: #374151; }
.slow-sales { font-size: 13px; font-weight: 600; color: #92400e; }
.slow-tag { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #fef3c7; color: #92400e; font-weight: 600; }
.empty-state { color: #94a3b8; font-size: 13px; padding: 6px 0; }
</style>
