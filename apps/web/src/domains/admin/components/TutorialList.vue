<template>
  <section class="page-lite list-card">
    <div class="toolbar">
      <input v-model="keyword" type="text" placeholder="搜索标题、标签、分类或简介" />
      <button class="secondary-btn" @click="emit('refresh')" :disabled="loading">{{ loading ? '加载中...' : '刷新' }}</button>
    </div>

    <p v-if="message" class="message">{{ message }}</p>

    <div v-if="loading" class="empty-state">教程加载中...</div>
    <div v-else-if="filteredItems.length === 0" class="empty-state">没有找到符合条件的教程。</div>

    <div v-else class="tutorial-list">
      <article v-for="(item, index) in filteredItems" :key="item.id" class="tutorial-item">
        <div class="tutorial-top">
          <div>
            <div class="tutorial-tags">
              <span class="badge">{{ item.displayArea }}</span>
              <span class="badge subtle">{{ item.tag }}</span>
              <span class="badge subtle">{{ item.difficulty || '未设置难度' }}</span>
              <span v-if="item.mediaUrl" class="badge subtle">含封面</span>
              <span v-if="item.detailVideoUrl || item.mediaType === 'VIDEO'" class="badge subtle">含视频</span>
            </div>
            <h3>{{ item.title }}</h3>
          </div>
          <span :class="['status-badge', item.published ? 'online' : 'draft']">
            {{ item.published ? '已发布' : '草稿' }}
          </span>
        </div>

        <p class="tutorial-desc">{{ item.description }}</p>

        <div class="tutorial-meta">
          <span>分类：{{ categoryLabel(item.categoryCode) }}</span>
          <span>时长：{{ item.durationMinutes ? `${item.durationMinutes} 分钟` : '未设置' }}</span>
          <span>创建时间：{{ formatDate(item.createdAt) }}</span>
          <span>更新时间：{{ formatDate(item.updatedAt) }}</span>
        </div>

        <div class="item-actions">
          <div class="reorder-btns">
            <button
              class="reorder-btn"
              :disabled="isFirstInArea(item)"
              title="上移"
              @click="emit('reorder', item, 'UP')"
            >
              ↑ 上移
            </button>
            <button
              class="reorder-btn"
              :disabled="isLastInArea(item)"
              title="下移"
              @click="emit('reorder', item, 'DOWN')"
            >
              ↓ 下移
            </button>
          </div>
          <div class="action-divider" />
          <button class="text-btn" @click="emit('preview', item)">预览</button>
          <button class="text-btn" @click="emit('edit', item)">编辑</button>
          <button class="text-btn danger" @click="emit('delete', item)">删除</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AdminTutorial } from '../api'

export type TutorialItem = AdminTutorial

export interface CategoryOption {
  value: string
  label: string
}

const props = defineProps<{
  items: TutorialItem[]
  loading: boolean
  categoryOptions: CategoryOption[]
  message?: string
}>()

const emit = defineEmits<{
  edit: [item: TutorialItem]
  delete: [item: TutorialItem]
  preview: [item: TutorialItem]
  refresh: []
  reorder: [item: TutorialItem, direction: 'UP' | 'DOWN']
}>()

const keyword = ref('')

const filteredItems = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  if (!value) return props.items
  return props.items.filter((item) =>
    [item.title, item.tag, item.description, item.categoryCode || '', item.difficulty || '']
      .some((text) => text.toLowerCase().includes(value))
  )
})

function isFirstInArea(item: TutorialItem) {
  const sameArea = props.items.filter((i) => i.displayArea === item.displayArea)
  return sameArea.length === 0 || sameArea[0].id === item.id
}

function isLastInArea(item: TutorialItem) {
  const sameArea = props.items.filter((i) => i.displayArea === item.displayArea)
  return sameArea.length === 0 || sameArea[sameArea.length - 1].id === item.id
}

function categoryLabel(code: string | null) {
  if (!code) return '未设置'
  return props.categoryOptions.find((item) => item.value === code)?.label || code
}

function formatDate(value: string | null) {
  if (!value) return '未记录'
  return value.replace('T', ' ').slice(0, 16)
}
</script>

<style scoped>
.list-card {
  display: grid;
  gap: 14px;
}

.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.toolbar input {
  flex: 1;
  min-width: 260px;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.message {
  margin: 0;
  color: #1f7a41;
  font-weight: 600;
}

.empty-state {
  color: #6b7280;
  padding: 20px 0 10px;
}

.tutorial-list {
  display: grid;
  gap: 12px;
}

.tutorial-item {
  display: grid;
  gap: 12px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #e5efe7;
  background: #fbfefb;
}

.tutorial-top {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: start;
}

.tutorial-top h3 {
  margin: 8px 0 0;
  color: #1f2937;
}

.tutorial-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.badge {
  background: #edf9ef;
  color: #1f7a41;
}

.badge.subtle {
  background: #f4f7f4;
  color: #4b5563;
}

.status-badge.online {
  background: #dff4e4;
  color: #1f7a41;
}

.status-badge.draft {
  background: #f3f4f6;
  color: #6b7280;
}

.tutorial-desc {
  margin: 0;
  color: #6b7280;
  line-height: 1.7;
}

.tutorial-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  color: #5f6d66;
  font-size: 12px;
}

.item-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.reorder-btns {
  display: inline-flex;
  gap: 6px;
}

.reorder-btn {
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid #e3ece5;
  background: #f8fcf8;
  color: #335a43;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.reorder-btn:hover:not(:disabled) {
  background: #edf9ef;
  border-color: #80ab64;
  color: #1f7a41;
}

.reorder-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-divider {
  width: 1px;
  height: 18px;
  background: #e3ece5;
  margin: 0 4px;
}

.text-btn {
  border: none;
  background: transparent;
  color: #1f7a41;
  padding: 0;
  cursor: pointer;
  font-weight: 600;
}

.text-btn.danger {
  color: #dc2626;
}

@media (max-width: 760px) {
  .toolbar,
  .tutorial-top {
    flex-direction: column;
  }

  .item-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-divider {
    display: none;
  }
}
</style>
