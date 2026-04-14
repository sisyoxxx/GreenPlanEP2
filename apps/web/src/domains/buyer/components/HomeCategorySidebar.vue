<template>
  <aside class="home-sidebar left-sidebar page-lite">
    <section class="sidebar-section">
      <h3 class="sidebar-title">商品分类</h3>
      <ul class="sidebar-list sidebar-grid-list">
        <li v-for="item in categories" :key="item.name" class="sidebar-list-item sidebar-grid-item">
          <span class="sidebar-icon">{{ item.icon }}</span>
          <div class="sidebar-grid-text">
            <div class="sidebar-item-title">{{ item.name }}</div>
            <div class="sidebar-item-desc">{{ item.desc }}</div>
          </div>
        </li>
      </ul>
    </section>

    <section class="sidebar-section">
      <h3 class="sidebar-title">贴心服务</h3>
      <div class="mini-service-card" v-for="service in services" :key="service.title">
        <div class="sidebar-item-title">{{ service.title }}</div>
        <div class="sidebar-item-desc">{{ service.desc }}</div>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
const categories = [
  { icon: '🌱', name: '蔬菜种子', desc: '阳台与庭院种植' },
  { icon: '🌸', name: '花卉种子', desc: '观赏与四季花园' },
  { icon: '🪴', name: '盆栽绿植', desc: '室内净化与观叶' },
  { icon: '🧰', name: '种植工具', desc: '育苗、浇灌、修剪' },
  { icon: '🍀', name: '营养肥料', desc: '土壤、肥料与营养液' }
]

const services = [
  { title: '种植新手指引', desc: '从播种到养护的完整说明' },
  { title: '季节推荐', desc: '根据时令推荐适宜种植的品类' }
]
</script>

<style scoped>
.home-sidebar {
  display: grid;
  gap: 12px;
}

.sidebar-section {
  display: grid;
  gap: 8px;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  color: #1f7a41;
}

.sidebar-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.sidebar-grid-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sidebar-list-item,
.mini-service-card {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px;
  border-radius: 12px;
  background: #f8fcf8;
  border: 1px solid #e4efe6;
}

.sidebar-grid-item {
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 92px;
}

.sidebar-grid-text {
  display: grid;
  gap: 2px;
}

.sidebar-icon {
  font-size: 18px;
}

.sidebar-item-title {
  font-weight: 600;
  color: #1f2937;
}

.sidebar-item-desc {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

@media (max-width: 1280px) {
  .left-sidebar .sidebar-item-desc {
    display: none;
  }
}

@media (max-width: 950px) {
  .left-sidebar {
    gap: 10px;
  }

  .left-sidebar .sidebar-section {
    gap: 6px;
  }

  .left-sidebar .sidebar-title {
    font-size: 16px;
  }

  .left-sidebar .sidebar-grid-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .left-sidebar .sidebar-grid-item {
    min-height: 78px;
    padding: 8px 6px;
  }

  .left-sidebar .sidebar-item-title {
    font-size: 13px;
  }

  .left-sidebar .mini-service-card {
    padding: 8px 10px;
  }
}

@media (max-width: 485px) {
  .left-sidebar {
    display: none;
  }
}
</style>
