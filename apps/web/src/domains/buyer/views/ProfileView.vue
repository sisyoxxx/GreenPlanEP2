<template>
  <AppLayout>
    <div class="profile-shell">
      <section class="profile-overview page-lite">
        <div class="profile-welcome">
          <p class="profile-tag">买家中心</p>
          <h1>{{ auth.user?.username || '用户' }}，欢迎回来</h1>
          <p class="profile-subtitle">这里集中展示你的账户信息、常用入口和个人种植日记。</p>
        </div>
        <div class="profile-meta-grid">
          <div class="meta-card">
            <span class="meta-label">用户名</span>
            <strong>{{ auth.user?.username || '--' }}</strong>
          </div>
          <div class="meta-card">
            <span class="meta-label">角色</span>
            <strong>{{ auth.user?.role || '--' }}</strong>
          </div>
          <div class="meta-card">
            <span class="meta-label">常用状态</span>
            <strong>已登录</strong>
          </div>
        </div>
      </section>

      <section class="profile-actions page-lite">
        <div class="section-head">
          <h2>快捷入口</h2>
        </div>
        <div class="quick-grid">
          <button v-for="item in quickActions" :key="item.title" class="quick-card" @click="router.push(item.to)">
            <span class="quick-icon">{{ item.icon }}</span>
            <strong>{{ item.title }}</strong>
            <span>{{ item.desc }}</span>
          </button>
        </div>
      </section>

      <section class="profile-journal page-lite">
        <div class="section-head">
          <h2>个人种植日记</h2>
          <button class="secondary-btn" @click="router.push('/planting-records')">查看全部</button>
        </div>
        <div class="journal-grid">
          <article class="journal-card" v-for="item in diaryEntries" :key="item.id">
            <div class="journal-tag">{{ item.plantName }}</div>
            <h3>{{ item.title }}</h3>
            <p class="journal-date">{{ item.date }}</p>
            <p class="journal-note">{{ item.note }}</p>
          </article>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import { useAuthStore } from '../../../core/auth/useAuthStore'

const router = useRouter()
const auth = useAuthStore()

const quickActions = [
  { icon: '🛍️', title: '逛商品', desc: '继续挑选适合你的种植商品', to: '/products' },
  { icon: '📦', title: '我的订单', desc: '查看已下单商品与订单状态', to: '/orders' },
  { icon: '🪴', title: '种植记录', desc: '查看和整理你的种植日记', to: '/planting-records' },
  { icon: '💬', title: '社区交流', desc: '浏览大家的种植经验分享', to: '/community' }
]

const diaryEntries = [
  { id: 1, title: '番茄育苗第7天', plantName: '番茄', date: '2026-04-10', note: '已出芽，保持通风和散射光。' },
  { id: 2, title: '月季播种第3天', plantName: '月季', date: '2026-04-11', note: '土壤湿润度正常，等待发芽。' },
  { id: 3, title: '罗勒修剪记录', plantName: '罗勒', date: '2026-04-12', note: '顶部摘心后侧芽开始生长，适合继续控水。' }
]
</script>

<style scoped>
.profile-shell {
  display: grid;
  gap: 18px;
}

.profile-overview,
.profile-actions,
.profile-journal {
  display: grid;
  gap: 16px;
}

.profile-overview {
  background: linear-gradient(135deg, #edf9ef, #f7fbf7);
}

.profile-tag {
  margin: 0;
  color: #1f7a41;
  font-weight: 700;
}

.profile-overview h1,
.section-head h2,
.journal-card h3 {
  margin: 0;
}

.profile-subtitle,
.journal-date,
.journal-note,
.quick-card span {
  color: #6b7280;
}

.profile-meta-grid,
.quick-grid,
.journal-grid {
  display: grid;
  gap: 14px;
}

.profile-meta-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.meta-card,
.quick-card,
.journal-card {
  border-radius: 14px;
  border: 1px solid #e0ece3;
  background: #f8fcf8;
}

.meta-card {
  padding: 14px;
  display: grid;
  gap: 6px;
}

.meta-label,
.journal-tag {
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
}

.quick-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.quick-card {
  padding: 16px;
  display: grid;
  gap: 8px;
  text-align: left;
}

.quick-icon {
  font-size: 22px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.journal-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.journal-card {
  padding: 16px;
  display: grid;
  gap: 8px;
}

@media (max-width: 1100px) {
  .profile-meta-grid,
  .quick-grid,
  .journal-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .profile-meta-grid,
  .quick-grid,
  .journal-grid {
    grid-template-columns: 1fr;
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
