<template>
  <div v-if="tutorials.length > 0">
    <div class="section-head">
      <h2>热门教程</h2>
      <button class="secondary-btn" @click="$emit('goTutorials')">查看全部教程</button>
    </div>

    <div class="home-tutorials-grid">
      <article
        v-for="item in tutorials"
        :key="item.id"
        class="home-tutorial-card page-lite"
        @click="$emit('goTutorialDetail', item.id)"
      >
        <div v-if="item.mediaUrl" class="home-tutorial-media">
          <img v-if="item.mediaType !== 'VIDEO'" :src="item.mediaUrl" :alt="item.title" loading="lazy" />
        </div>
        <div v-else class="home-tutorial-thumb" :style="{ background: item.backgroundStyle }">{{ item.tag }}</div>
        <h3 class="home-tutorial-title">{{ item.title }}</h3>
        <p class="home-tutorial-desc">{{ item.description }}</p>
        <div class="home-tutorial-meta">
          <span>{{ item.difficulty || '精选' }}</span>
          <span>{{ formatDuration(item.durationMinutes) }}</span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TutorialItem } from '../api'

defineProps<{
  tutorials: TutorialItem[]
}>()

defineEmits<{
  (e: 'goTutorials'): void
  (e: 'goTutorialDetail', id: number): void
}>()

function formatDuration(durationMinutes: number | null) {
  return durationMinutes ? `${durationMinutes} 分钟` : '图文教程'
}
</script>

<style scoped>
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-head h2 {
  margin: 0;
  font-size: 20px;
  color: #16351f;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.home-tutorials-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.home-tutorial-card {
  display: grid;
  gap: 8px;
  cursor: pointer;
}

.home-tutorial-media {
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 0;
  border-radius: 12px;
  overflow: hidden;
}

.home-tutorial-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.home-tutorial-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 0;
  border-radius: 12px;
  color: #1f7a41;
  font-weight: 700;
  font-size: 14px;
}

.home-tutorial-title {
  margin: 0;
  font-size: 14px;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-tutorial-desc {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.home-tutorial-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
}

@media (max-width: 950px) {
  .home-tutorials-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
