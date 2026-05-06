<template>
  <aside class="diary-sidebar page-lite">
    <h3 class="sidebar-title">日记分类</h3>
    <button
      v-for="cat in categories"
      :key="cat.key"
      :class="['cat-btn', { active: activeCategory === cat.key }]"
      @click="$emit('update:activeCategory', cat.key)"
    >
      <span class="cat-icon">{{ cat.icon }}</span>
      {{ cat.label }}
    </button>

    <div class="plant-section">
      <button class="cat-btn" :class="{ active: showPlantList }" @click="$emit('togglePlantList')">
        <span class="cat-icon">🌻</span>我的植物
        <span class="plant-arrow" :class="{ open: showPlantList }">▾</span>
      </button>
      <Transition name="slide">
        <div v-if="showPlantList" class="plant-dropdown">
          <button
            v-for="p in myPlants"
            :key="p.name"
            :class="['plant-item', { active: selectedPlant === p.name }]"
            @click="$emit('togglePlant', p.name)"
          >
            <span>{{ p.icon }}</span> {{ p.name }}
            <span class="plant-status">{{ p.status }}</span>
          </button>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
interface PlantItem {
  name: string
  icon: string
  status: string
}

defineProps<{
  activeCategory: string
  showPlantList: boolean
  selectedPlant: string
  myPlants: PlantItem[]
}>()

defineEmits<{
  (e: 'update:activeCategory', key: string): void
  (e: 'togglePlantList'): void
  (e: 'togglePlant', name: string): void
}>()

const categories = [
  { key: 'all', icon: '📒', label: '全部日记' },
  { key: 'seedling', icon: '🌱', label: '育苗期' },
  { key: 'growing', icon: '🌿', label: '生长期' },
  { key: 'harvest', icon: '🍅', label: '收获期' },
  { key: 'note', icon: '📝', label: '随记' }
]

// myPlants now comes from parent as a prop
</script>

<style scoped>
.diary-sidebar {
  display: grid;
  gap: 4px;
  align-content: start;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.sidebar-title {
  margin: 0 0 8px;
  font-size: 13px;
  color: #9ca3af;
  letter-spacing: 0.5px;
  padding: 0 10px;
}

.cat-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.cat-btn:hover { background: #f0f7f1; }
.cat-btn.active { background: #e6f4ea; color: #1f7a41; font-weight: 600; }
.cat-icon { font-size: 16px; width: 22px; text-align: center; }

.plant-section { margin-top: 10px; display: grid; gap: 0; }

.plant-arrow {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.2s;
}

.plant-arrow.open { transform: rotate(180deg); }

.plant-dropdown {
  padding: 4px 0 4px 30px;
  display: grid;
  gap: 2px;
}

.slide-enter-active { transition: all 0.25s ease; }
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; overflow: hidden; }
.slide-enter-to, .slide-leave-from { opacity: 1; max-height: 300px; }

.plant-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.plant-item:hover { background: #f0f7f1; color: #374151; }
.plant-item.active { color: #1f7a41; font-weight: 600; }

.plant-status {
  margin-left: auto;
  font-size: 11px;
  color: #9ca3af;
}
</style>
