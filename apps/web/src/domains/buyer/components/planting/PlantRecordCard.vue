<template>
  <article class="diary-card page-lite">
    <div class="diary-card-content">
      <div class="diary-card-header">
        <div
          class="diary-card-tag"
          :style="{ background: tagColorMap[record.category] }"
        >
          {{ tagLabelMap[record.category] }}
        </div>
        <span class="diary-card-date">{{ record.date }}</span>
      </div>
      <h3 class="diary-card-title">{{ record.title }}</h3>
      <div class="diary-card-plant">
        <span class="plant-icon">🌱</span> {{ record.plantName }}
      </div>
      <p class="diary-card-note">{{ record.note }}</p>
      <div class="card-actions">
        <button class="action-btn add-diary" @click="emit('addDiary', record.id)">
          + 日记
        </button>
        <button class="action-btn edit" @click="emit('edit', record)">
          编辑
        </button>
        <button class="action-btn delete" @click="handleDelete">
          删除
        </button>
      </div>
    </div>
    <div v-if="record.imageName" class="diary-card-image">
      <img v-if="record.imageName.startsWith('http') || record.imageName.startsWith('/api/')" :src="record.imageName" :alt="record.title" />
      <span v-else>🖼️ {{ record.imageName }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PlantRecord } from './types'

defineProps<{
  record: PlantRecord
}>()

const emit = defineEmits<{
  edit: [record: PlantRecord]
  delete: [id: number]
  addDiary: [id: number]
}>()

function handleDelete() {
  if (confirm('确定要删除这条日记吗？此操作不可恢复。')) {
    emit('delete', props.record.id)
  }
}

const tagLabelMap: Record<string, string> = {
  seedling: '育苗期',
  growing: '生长期',
  harvest: '收获期',
  note: '随记'
}

const tagColorMap: Record<string, string> = {
  seedling: '#dff4e4',
  growing: '#dbeafe',
  harvest: '#fef3c7',
  note: '#f3f4f6'
}
</script>

<style scoped>
.diary-card {
  display: flex;
  gap: 14px;
  align-items: stretch;
  padding: 18px 24px;
}

.diary-card-content {
  flex: 1;
  display: grid;
  gap: 8px;
  align-content: start;
}

.diary-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diary-card-tag {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #1f7a41;
}

.diary-card-date {
  font-size: 12px;
  color: #9ca3af;
}

.diary-card-title {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}

.diary-card-plant {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.plant-icon {
  font-size: 14px;
}

.diary-card-note {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.7;
}

.diary-card-image {
  width: 160px;
  height: 120px;
  background: linear-gradient(135deg, #e6f4ea, #f0f7f1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #80ab64;
  font-size: 13px;
  border-radius: 10px;
  flex-shrink: 0;
  overflow: hidden;
}

.diary-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
  align-self: stretch;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.action-btn {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #d3d7de;
  background: #fff;
  color: #4b5563;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  background: #f0f7f1;
  border-color: #80ab64;
  color: #1f7a41;
}

.action-btn.add-diary {
  background: #e6f4ea;
  border-color: #e6f4ea;
  color: #1f7a41;
}

.action-btn.add-diary:hover {
  background: #1f7a41;
  color: #fff;
}

.action-btn.edit:hover {
  background: #dbeafe;
  border-color: #dbeafe;
  color: #1e40af;
}

.action-btn.delete:hover {
  background: #fee2e2;
  border-color: #fee2e2;
  color: #b91c1c;
}

@media (max-width: 760px) {
  .diary-card {
    flex-direction: column;
  }
  .diary-card-image {
    width: 100%;
    min-height: 80px;
  }
}
</style>
