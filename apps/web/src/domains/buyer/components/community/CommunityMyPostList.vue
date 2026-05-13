<template>
  <section class="my-post-list">
    <article v-for="post in posts" :key="post.id" class="my-post-item page-lite">
      <div class="my-post-main" @click="$emit('openPostDetail', post.id)">
        <div class="my-post-head">
          <span class="tag">{{ post.topic }}</span>
          <span class="muted">{{ post.time }}</span>
        </div>
        <h4>{{ post.title }}</h4>
        <p class="my-post-excerpt">{{ post.content.slice(0, 120) }}{{ post.content.length > 120 ? '...' : '' }}</p>
      </div>
      <div class="my-post-actions">
        <button class="secondary-btn" @click.stop="$emit('edit', post)">编辑</button>
        <button class="danger-btn" @click.stop="$emit('delete', post)">删除</button>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { CommunityPostItem } from '../../stores/useBuyerCommunityStore'

defineProps<{
  posts: CommunityPostItem[]
}>()

defineEmits<{
  (e: 'openPostDetail', postId: number): void
  (e: 'edit', post: CommunityPostItem): void
  (e: 'delete', post: CommunityPostItem): void
}>()
</script>

<style scoped>
.my-post-list {
  display: grid;
  gap: 10px;
}

.my-post-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.my-post-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(21, 56, 35, 0.08);
}

.my-post-main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 6px;
}

.my-post-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.my-post-main h4 {
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
  color: #1f2937;
}

.my-post-excerpt {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.my-post-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.secondary-btn:hover {
  background: #e8f0e8;
  border-color: #9ad3aa;
}

.danger-btn {
  border-color: #f2cbcb;
  color: #b42318;
  background: #fff7f7;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #f2cbcb;
  font-weight: 600;
  cursor: pointer;
}

.tag {
  font-size: 12px;
  font-weight: 700;
  color: #1f7a41;
}

.muted {
  color: #6b7280;
}
</style>
