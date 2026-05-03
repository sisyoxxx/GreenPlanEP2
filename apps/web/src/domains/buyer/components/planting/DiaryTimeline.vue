<template>
  <div v-if="diaries.length === 0" class="empty-state page-lite">
    <p class="empty-hint">{{ emptyText }}</p>
  </div>
  <div v-else class="diary-list">
    <PlantRecordCard
      v-for="item in diaries"
      :key="item.id"
      :record="item"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
      @addDiary="$emit('addDiary', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import PlantRecordCard from './PlantRecordCard.vue'
import type { DiaryEntry } from './types'

defineProps<{
  diaries: DiaryEntry[]
  emptyText?: string
}>()

defineEmits<{
  edit: [record: DiaryEntry]
  delete: [id: number]
  addDiary: [id: number]
}>()
</script>

<style scoped>
.diary-list {
  display: grid;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 16px;
}

.empty-hint {
  color: #9ca3af;
  margin: 0;
}
</style>
