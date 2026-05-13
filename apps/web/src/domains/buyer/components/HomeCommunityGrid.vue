<template>
  <div v-if="posts.length > 0">
    <div class="section-head">
      <h2>社区精选</h2>
      <button class="secondary-btn" @click="$emit('goCommunity')">进入社区</button>
    </div>

    <div class="home-posts-grid">
      <article
        v-for="post in posts"
        :key="post.id"
        class="home-post-card page-lite"
        @click="$emit('goPostDetail', post.id)"
      >
        <div class="home-post-header">
          <span class="home-post-topic">{{ post.topic }}</span>
          <span class="home-post-time">{{ post.time }}</span>
        </div>
        <h3 class="home-post-title">{{ post.title }}</h3>
        <p class="home-post-excerpt">{{ post.content }}</p>
        <div class="home-post-footer">
          <span class="home-post-author">{{ post.author }}</span>
          <span class="home-post-likes">👍 {{ post.likes }}</span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CommunityPostItem } from '../stores/useBuyerCommunityStore'

defineProps<{
  posts: CommunityPostItem[]
}>()

defineEmits<{
  (e: 'goCommunity'): void
  (e: 'goPostDetail', id: number): void
}>()
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

.home-posts-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.home-post-card {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #e5efe7;
  background: #fcfffc;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.home-post-card:hover {
  border-color: rgba(31, 122, 65, 0.25);
  box-shadow: 0 4px 14px rgba(31, 122, 65, 0.08);
}

.home-post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.home-post-topic {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  font-size: 11px;
  font-weight: 700;
}

.home-post-time {
  font-size: 11px;
  color: #9ca3af;
}

.home-post-title {
  margin: 0;
  font-size: 14px;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-post-excerpt {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.home-post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.home-post-author {
  font-size: 12px;
  color: #4b5563;
  font-weight: 600;
}

.home-post-likes {
  font-size: 12px;
  color: #1f7a41;
  font-weight: 700;
}

@media (max-width: 950px) {
  .home-posts-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
