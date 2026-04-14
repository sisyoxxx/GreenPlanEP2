<template>
  <AdminLayout>
    <h2 class="page-title">销量分析</h2>
    <p class="page-desc">辅助分析爆款商品和滞销商品</p>

    <div class="stats-row">
      <div class="stat-card"><div class="stat-icon">💰</div><div><div class="stat-value">¥{{ summary.totalSales }}</div><div class="stat-label">销售总额</div></div></div>
      <div class="stat-card"><div class="stat-icon">📋</div><div><div class="stat-value">{{ summary.totalOrders }}</div><div class="stat-label">总订单数</div></div></div>
      <div class="stat-card"><div class="stat-icon">📊</div><div><div class="stat-value">¥{{ summary.avgOrder }}</div><div class="stat-label">客单价</div></div></div>
      <div class="stat-card"><div class="stat-icon">🏆</div><div><div class="stat-value">{{ summary.topCategory }}</div><div class="stat-label">热销品类</div></div></div>
    </div>

    <div class="report-grid">
      <div class="page-lite chart-panel">
        <h3>绿植销量 TOP 10</h3>
        <div class="bar-chart">
          <div class="bar-row" v-for="(item, i) in top10" :key="item.name">
            <span class="bar-rank" :class="{ gold: i===0, silver: i===1, bronze: i===2 }">{{ i+1 }}</span>
            <span class="bar-name">{{ item.name }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: (item.sales/top10[0].sales*100)+'%' }"></div>
            </div>
            <span class="bar-value">{{ item.sales }}件</span>
          </div>
        </div>
      </div>

      <div class="page-lite slow-panel">
        <h3>滞销预警 (近30天销量 &lt; 5)</h3>
        <div class="slow-list">
          <div class="slow-item" v-for="item in slowMoving" :key="item.name">
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
import AdminLayout from '../../../layouts/AdminLayout.vue'

const summary = { totalSales: '18,620', totalOrders: 156, avgOrder: '119.4', topCategory: '蔬菜种子' }

const top10 = [
  { name: '家庭番茄种植套装', sales: 328 },
  { name: '有机薄荷种子', sales: 276 },
  { name: '阳台草莓种植全套', sales: 245 },
  { name: '迷你园艺工具三件套', sales: 198 },
  { name: '罗勒香草种子礼盒', sales: 167 },
  { name: '有机营养土 5L', sales: 154 },
  { name: '自动浇水器', sales: 132 },
  { name: '向日葵种子', sales: 118 },
  { name: '生菜混合种子包', sales: 95 },
  { name: '多肉植物组合盆', sales: 87 }
]

const slowMoving = [
  { name: '冬季耐寒花卉种子', sales: 2 },
  { name: '大型花盆陶瓷款', sales: 3 },
  { name: '专业嫁接工具套装', sales: 1 },
  { name: '水培营养液浓缩版', sales: 4 },
  { name: '园艺防护手套加厚', sales: 3 }
]
</script>

<style scoped>
.page-title { margin: 0; font-size: 22px; color: #1f2937; }
.page-desc { margin: 4px 0 16px; font-size: 13px; color: #9ca3af; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.stat-card { display: flex; align-items: center; gap: 12px; padding: 16px 18px; background: #fff; border-radius: 12px; border: 1px solid #e6f0e8; }
.stat-icon { font-size: 28px; }
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
</style>
