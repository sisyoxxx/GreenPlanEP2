<template>
  <section v-if="posts.length > 0" class="post-list">
    <article
      v-for="post in posts"
      :key="post.id"
      class="post-card page-lite"
      role="button"
      tabindex="0"
      @click="$emit('openPostDetail', post.id)"
      @keydown.enter.prevent="$emit('openPostDetail', post.id)"
    >
      <img v-if="post.imageUrl" class="post-image" :src="post.imageUrl" :alt="post.imageAlt || post.title" />
      <div class="post-head">
        <span class="tag">{{ post.topic }}</span>
        <span class="muted">{{ post.time }}</span>
      </div>
      <h3>{{ post.title }}</h3>
      <p>{{ post.content }}</p>
      <div class="row">
        <button class="action-btn" :class="{ active: post.liked }" @click.stop="$emit('like', post.id)">
          <span>{{ post.liked ? '♥' : '♡' }}</span> {{ post.likes }}
        </button>
        <button
          class="action-btn"
          :class="{ active: favoritePostIdSet.has(post.id) }"
          @click.stop="$emit('toggleFavorite', post)"
        >
          <span>{{ favoritePostIdSet.has(post.id) ? '★' : '☆' }}</span>
        </button>
        <button class="action-btn" @click.stop="$emit('prefillReply', post)">
          <span>💬</span> {{ (commentCounts?.[post.id]) ?? 0 }}
        </button>
        <button class="action-btn" @click.stop="$emit('prefillMessage', post)">
          <span>✉️</span>
        </button>
      </div>
    </article>
  </section>
  <div v-else-if="showEmpty" class="page-lite muted">{{ emptyText }}</div>
</template>

<script setup lang="ts">
import type { CommunityPostItem } from '../../stores/useBuyerCommunityStore'

defineProps<{
  posts: CommunityPostItem[]
  favoritePostIdSet: Set<number>
  commentCounts?: Record<number, number>
  showEmpty?: boolean
  emptyText?: string
}>()

defineEmits<{
  (e: 'like', postId: number): void
  (e: 'toggleFavorite', post: CommunityPostItem): void
  (e: 'prefillReply', post: CommunityPostItem): void
  (e: 'prefillMessage', post: CommunityPostItem): void
  (e: 'openPostDetail', postId: number): void
}>()
</script>

<style scoped>
.post-list {
  column-width: 248px;
  column-gap: 12px;
}

.post-card {
  break-inside: avoid;
  margin-bottom: 12px;
  display: grid;
  gap: 8px;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(21, 56, 35, 0.09);
}

.post-image {
  width: 100%;
  height: 152px;
  object-fit: cover;
  border-radius: 0;
}

.post-head,
.post-card h3,
.post-card p,
.post-card .row {
  padding-left: 12px;
  padding-right: 12px;
}

.post-head {
  padding-top: 10px;
}

.post-card h3 {
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
}

.post-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #4b5563;
}

.post-card .row {
  padding-bottom: 10px;
  gap: 6px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #e3e8e3;
  background: #f2f6f2;
  color: #1f2937;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1.2;
}

.action-btn:hover {
  background: #e8f0e8;
}

.action-btn.active {
  border-color: #9ad3aa;
  background: #edf9ef;
  color: #1f7a41;
}

.post-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag {
  font-size: 12px;
  font-weight: 700;
  color: #1f7a41;
}

.muted {
  color: #6b7280;
}

.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 1280px) {
  .post-list {
    column-width: 220px;
    column-gap: 10px;
  }
}

@media (max-width: 760px) {
  .post-list {
    column-count: 1;
    column-width: auto;
  }
}
</style>
