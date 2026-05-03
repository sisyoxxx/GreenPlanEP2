<template>
  <div v-if="isMultiMode" class="multi-bar">
    <div class="multi-bar-left">
      <strong>已选 {{ selectedKindCount }} 种 · {{ selectedCount }} 件</strong>
      <span>合计：￥{{ formatPrice(selectedTotal) }}</span>
    </div>
    <div class="multi-bar-actions">
      <button class="danger-btn" @click="$emit('removeSelected')" :disabled="!hasSelection">删除</button>
      <button @click="$emit('checkout')" :disabled="submitting || !hasSelection">
        {{ submitting ? '下单中...' : '购买' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '../../../../utils/format'

defineProps<{
  selectedCount: number
  selectedTotal: number
  isMultiMode: boolean
  selectedKindCount: number
  submitting: boolean
  hasSelection: boolean
}>()

defineEmits<{
  (e: 'toggleMode'): void
  (e: 'checkout'): void
  (e: 'removeSelected'): void
}>()
</script>

<style scoped>
.multi-bar {
  position: fixed;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  width: min(980px, calc(100% - 24px));
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(31, 122, 65, 0.22);
  box-shadow: 0 18px 40px rgba(31, 122, 65, 0.14);
  backdrop-filter: blur(10px);
  z-index: 30;
}

.multi-bar-left {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.multi-bar-left strong {
  color: #16351f;
}

.multi-bar-left span {
  color: #1f7a41;
  font-weight: 800;
}

.multi-bar-actions {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.danger-btn {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #be123c;
}
</style>
