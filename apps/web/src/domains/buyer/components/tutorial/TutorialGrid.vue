<template>
  <div>
    <div v-if="status === 'loading'" class="empty-state page-lite">
      <p class="empty-hint">教程加载中...</p>
    </div>
    <div v-else-if="status === 'error'" class="empty-state page-lite">
      <p class="empty-hint">{{ error }}</p>
    </div>
    <div v-else-if="items.length === 0" class="empty-state page-lite">
      <p class="empty-hint">没有找到相关教程</p>
    </div>
    <div v-else class="tutorial-grid">
      <article class="tutorial-card page-lite" v-for="item in items" :key="item.id" @click="$emit('openDetail', item.id)">
        <div v-if="item.mediaUrl" class="card-media">
          <video v-if="item.mediaType === 'VIDEO'" :src="item.mediaUrl" muted playsinline preload="metadata" />
          <img v-else :src="item.mediaUrl" :alt="item.title" />
        </div>
        <div class="card-body">
          <div class="card-tags">
            <span class="card-chip category-chip">{{ getCategoryLabel(item.categoryCode) }}</span>
            <span v-if="item.mediaUrl && item.tag" class="card-chip">{{ item.tag }}</span>
          </div>
          <div class="card-title-row">
            <h3 class="card-title">{{ item.title }}</h3>
            <button class="fav-btn" :class="{ faved: favoriteIdSet.has(item.id) }" @click.stop="$emit('toggleFavorite', item.id)">
              {{ favoriteIdSet.has(item.id) ? '已收藏' : '收藏' }}
            </button>
          </div>
          <p class="card-desc">{{ item.description }}</p>
          <div class="card-meta">
            <span class="card-difficulty">{{ item.difficulty || '精选' }}</span>
            <span class="card-duration">{{ formatDuration(item.durationMinutes) }}</span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TutorialItem } from '../../api'

defineProps<{
  items: TutorialItem[]
  status: 'idle' | 'loading' | 'ok' | 'error'
  error: string
  favoriteIdSet: Set<number>
}>()

defineEmits<{
  (e: 'openDetail', id: number): void
  (e: 'toggleFavorite', id: number): void
}>()

function formatDuration(durationMinutes: number | null) {
  return durationMinutes ? `${durationMinutes} 分钟` : '图文教程'
}

function getCategoryLabel(code: string | null) {
  const map: Record<string, string> = {
    seed: '播种入门',
    care: '日常养护',
    pest: '病虫防治',
    advanced: '进阶技巧',
    seasonal: '四季指南',
    tool: '工具推荐'
  }
  if (!code) return '全部教程'
  return map[code] || code
}
</script>

<style scoped>
.tutorial-grid {
  column-width: 260px;
  column-gap: 14px;
}

.tutorial-card {
  display: inline-block;
  width: 100%;
  gap: 0;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s;
  margin: 0 0 14px;
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
}

.tutorial-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); }

.card-media {
  position: relative;
  height: 142px;
  overflow: hidden;
}

.card-media img,
.card-media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-body { padding: 0 16px 16px; display: grid; gap: 8px; }
.card-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.card-chip {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #466052;
  background: #edf3ef;
}
.category-chip {
  color: #1f7a41;
  background: #e7f5ec;
}
.card-title { margin: 0; font-size: 16px; color: #1f2937; }

.card-title-row { display: flex; justify-content: space-between; align-items: start; gap: 6px; }

.fav-btn {
  border-radius: 999px;
  border: 1px solid #dbe7dd;
  background: #f8fbf8;
  color: #55735f;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  line-height: 1;
}

.fav-btn.faved {
  border-color: #ffccd5;
  background: #fff2f4;
  color: #d14863;
}

.fav-btn:hover { opacity: 0.9; }
.card-desc { margin: 0; font-size: 13px; color: #6b7280; line-height: 1.6; }

.card-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
}

.card-difficulty {
  padding: 2px 8px;
  border-radius: 999px;
  background: #e6f4ea;
  color: #1f7a41;
  font-weight: 600;
}

.card-duration { color: #9ca3af; line-height: 1.8; }

.empty-state { text-align: center; padding: 40px 16px; }
.empty-hint { color: #9ca3af; margin: 0; }

@media (max-width: 1100px) {
  .tutorial-grid {
    column-width: 240px;
  }
}

@media (max-width: 680px) {
  .tutorial-grid {
    column-count: 1;
    column-width: auto;
  }
}
</style>
