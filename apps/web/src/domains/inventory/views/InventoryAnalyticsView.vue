<template>
  <InventoryLayout title="库存分析" subtitle="热销商品与出入库趋势统计">
    <template #actions>
      <button class="secondary-btn" @click="reload" :disabled="loading">{{ loading ? '加载中…' : '刷新' }}</button>
    </template>

    <section class="stats-grid">
      <div class="info-card">
        <h3>当月入库总量</h3>
        <p class="kpi">{{ data?.inboundTotalThisMonth ?? 0 }}</p>
      </div>
      <div class="info-card">
        <h3>当月出库总量</h3>
        <p class="kpi warn">{{ data?.outboundTotalThisMonth ?? 0 }}</p>
      </div>
      <div class="info-card">
        <h3>当前总库存</h3>
        <p class="kpi">{{ data?.currentTotalStock ?? 0 }}</p>
      </div>
    </section>

    <section class="page-lite chart-panel">
      <div class="section-head">
        <div>
          <h2 class="section-title">商品出库量 TOP 10</h2>
          <p class="section-subtitle">当月出库量越高说明商品越热销，可作为补货参考</p>
        </div>
      </div>
      <div v-if="loading" class="empty">出库数据加载中…</div>
      <div v-else-if="top10.length === 0" class="empty">暂无本月出库数据</div>
      <div v-else class="bar-chart">
        <div class="bar-row" v-for="(item, i) in top10" :key="`${item.productId}-${item.name}`">
          <span class="bar-rank" :class="{ gold: i === 0, silver: i === 1, bronze: i === 2 }">{{ i + 1 }}</span>
          <span class="bar-name" :title="item.name">{{ item.name }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: (item.totalQty / topBase * 100) + '%' }"></div>
          </div>
          <span class="bar-value">{{ item.totalQty }}件</span>
        </div>
      </div>
    </section>

    <section class="page-lite chart-panel">
      <div class="section-head">
        <div>
          <h2 class="section-title">低出库预警（出库量 ≤ 2）</h2>
          <p class="section-subtitle">出库量极低的商品，建议检查是否滞销或推广不足</p>
        </div>
      </div>
      <div v-if="loading" class="empty">出库数据加载中…</div>
      <div v-else-if="lowOutbound.length === 0" class="empty">当前无低出库商品</div>
      <div v-else class="slow-list">
        <div class="slow-item" v-for="item in lowOutbound" :key="`${item.productId}-${item.name}`">
          <span class="slow-name">{{ item.name }}</span>
          <span class="slow-sales">{{ item.totalQty }}件</span>
          <span class="slow-tag">建议检查</span>
        </div>
      </div>
    </section>

    <section class="page-lite">
      <div class="section-head">
        <div>
          <h2 class="section-title">近 30 天出入库趋势</h2>
          <p class="section-subtitle">每日入库与出库数量变化</p>
        </div>
      </div>
      <div ref="trendChartRef" class="chart-container"></div>
      <div v-if="!data?.dailyTrend?.length && !loading" class="empty">暂无趋势数据</div>
    </section>

    <p v-if="error" class="error page-lite">{{ error }}</p>
  </InventoryLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import InventoryLayout from '../components/InventoryLayout.vue'
import { fetchInventoryAnalytics } from '../api'

type AnalyticsData = Awaited<ReturnType<typeof fetchInventoryAnalytics>>
type OutboundItem = AnalyticsData['outboundByProduct'][number]

const loading = ref(false)
const error = ref('')
const data = ref<AnalyticsData | null>(null)

const trendChartRef = ref<HTMLDivElement | null>(null)
let trendChart: echarts.ECharts | null = null

const top10 = computed<OutboundItem[]>(() => (data.value?.outboundByProduct ?? []).slice(0, 10))
const topBase = computed(() => {
  if (top10.value.length === 0) return 1
  return Math.max(1, top10.value[0].totalQty ?? 1)
})

const lowOutbound = computed<OutboundItem[]>(() => {
  const list = data.value?.outboundByProduct ?? []
  return list.filter((item) => item.totalQty <= 2)
})

function initTrendChart() {
  if (!trendChartRef.value || !data.value?.dailyTrend?.length) return
  if (trendChart) trendChart.dispose()

  trendChart = echarts.init(trendChartRef.value)
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['入库', '出库'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.value.dailyTrend.map((d) => d.date),
      axisLabel: { fontSize: 11 }
    },
    yAxis: { type: 'value', name: '数量' },
    series: [
      {
        name: '入库',
        type: 'line',
        smooth: true,
        data: data.value.dailyTrend.map((d) => d.inbound),
        itemStyle: { color: '#2f855a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(47,133,90,0.3)' },
            { offset: 1, color: 'rgba(47,133,90,0.05)' }
          ])
        }
      },
      {
        name: '出库',
        type: 'line',
        smooth: true,
        data: data.value.dailyTrend.map((d) => d.outbound),
        itemStyle: { color: '#dc2626' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(220,38,38,0.3)' },
            { offset: 1, color: 'rgba(220,38,38,0.05)' }
          ])
        }
      }
    ]
  }
  trendChart.setOption(option)
}

async function reload() {
  loading.value = true
  error.value = ''
  try {
    data.value = await fetchInventoryAnalytics()
    await nextTick()
    initTrendChart()
  } catch (e: any) {
    error.value = e?.response?.data?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function onResize() {
  trendChart?.resize()
}

watch(
  () => data.value?.dailyTrend,
  async () => {
    await nextTick()
    initTrendChart()
  }
)

onMounted(() => {
  reload()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  trendChart?.dispose()
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.info-card {
  border: 1px solid #e4efe6;
  background: #f8fcf8;
  border-radius: 12px;
  padding: 14px;
}

.info-card h3 {
  margin: 0 0 6px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.kpi {
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  color: #16351f;
}

.warn {
  color: #dc2626;
}

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

.section-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.chart-container {
  width: 100%;
  height: 360px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e4efe6;
}

.empty {
  color: #6b7280;
  font-size: 13px;
  margin-top: 10px;
}

/* Bar chart (top 10 outbound) */
.bar-chart {
  display: grid;
  gap: 10px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-rank {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bar-rank.gold {
  background: #fef3c7;
  color: #92400e;
}

.bar-rank.silver {
  background: #e5e7eb;
  color: #374151;
}

.bar-rank.bronze {
  background: #fde68a;
  color: #78350f;
}

.bar-name {
  width: 140px;
  font-size: 13px;
  color: #374151;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-track {
  flex: 1;
  height: 22px;
  background: #f3f4f6;
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #80ab64;
  border-radius: 6px;
  transition: width 0.6s ease;
}

.bar-value {
  width: 50px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  flex-shrink: 0;
}

/* Low outbound list */
.slow-list {
  display: grid;
  gap: 8px;
}

.slow-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fefce8;
  border-radius: 8px;
  border: 1px solid #fef3c7;
}

.slow-name {
  flex: 1;
  font-size: 13px;
  color: #374151;
}

.slow-sales {
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
}

.slow-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  font-weight: 600;
}

@media (max-width: 720px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .chart-container {
    height: 280px;
  }
  .bar-name {
    width: 100px;
  }
}
</style>
