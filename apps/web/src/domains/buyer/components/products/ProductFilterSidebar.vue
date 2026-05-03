<template>
  <aside class="products-sidebar page-lite">
    <section class="sidebar-section category-section">
      <div class="sidebar-title-row">
        <h2 class="sidebar-title">商品分类</h2>
        <span class="sidebar-tip">再次点击已选按钮可恢复全部</span>
      </div>
      <div class="filter-chip-group category-chip-group">
        <button
          v-for="item in BUYER_CATEGORY_DEFINITIONS"
          :key="item.label"
          type="button"
          class="filter-chip category-chip"
          :class="{ active: selectedCategory === item.label }"
          @click="$emit('toggleCategory', item.label)"
        >
          <span class="category-chip-icon">{{ item.icon }}</span>
          <span class="category-chip-label">{{ item.label }}</span>
        </button>
      </div>
    </section>

    <section class="sidebar-section">
      <h2 class="sidebar-title">播种时段</h2>
      <div class="filter-chip-group month-chip-group">
        <button
          v-for="item in monthFilters"
          :key="item"
          type="button"
          class="filter-chip month-chip"
          :class="{ active: selectedMonth === item }"
          @click="$emit('update:selectedMonth', item)"
        >
          {{ item }}
        </button>
      </div>
    </section>

    <section class="sidebar-section">
      <h2 class="sidebar-title">适合地区</h2>
      <div class="filter-chip-group">
        <button
          v-for="item in regionFilters"
          :key="item"
          type="button"
          class="filter-chip"
          :class="{ active: selectedRegion === item }"
          @click="$emit('update:selectedRegion', item)"
        >
          {{ item }}
        </button>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { BUYER_CATEGORY_DEFINITIONS } from '../../categoryConfig'

defineProps<{
  selectedCategory: string | null
  selectedMonth: string
  selectedRegion: string
  monthFilters: string[]
  regionFilters: string[]
}>()

defineEmits<{
  (e: 'toggleCategory', label: string): void
  (e: 'update:selectedMonth', value: string): void
  (e: 'update:selectedRegion', value: string): void
}>()
</script>

<style scoped>
.products-sidebar {
  display: grid;
  gap: 18px;
  align-content: start;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.sidebar-section {
  display: grid;
  gap: 12px;
}

.sidebar-title-row {
  display: grid;
  gap: 4px;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  color: #1f7a41;
}

.sidebar-tip {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}

.filter-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-chip-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.month-chip-group {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.filter-chip {
  background: #f1f7f1;
  color: #386048;
  border: 1px solid #d7e8d9;
}

.month-chip {
  width: 100%;
  min-width: 0;
  justify-content: center;
}

.category-chip {
  min-height: 88px;
  border-radius: 12px;
  background: #f8fcf8;
  border: 1px solid #e4efe6;
  color: #1f2937;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
}

.category-chip-icon {
  font-size: 20px;
  line-height: 1;
}

.category-chip-label {
  font-size: 13px;
}

.filter-chip.active {
  background: #80ab64;
  color: #fff;
  border-color: #80ab64;
}

.products-sidebar::-webkit-scrollbar {
  width: 8px;
}

.products-sidebar::-webkit-scrollbar-thumb {
  background: #d2e3d6;
  border-radius: 999px;
}

@media (max-width: 980px) {
  .products-sidebar {
    overflow: visible;
    padding-right: 0;
  }
}

@media (max-width: 760px) {
  .category-chip-group {
    grid-template-columns: 1fr;
  }
}
</style>
