<template>
  <AppLayout>
    <div class="detail-shell">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
        <span>返回社区</span>
      </button>

      <section v-if="post" class="detail-card page-lite">
        <div v-if="post.auditStatus === 'rejected'" class="audit-alert">
          <span class="audit-icon">⚠</span>
          <div class="audit-body">
            <strong>帖子已被打回</strong>
            <p v-if="post.auditMessage">{{ post.auditMessage }}</p>
          </div>
        </div>

        <h1>{{ post.title }}</h1>

        <div class="meta-line">
          <span class="tag">{{ post.topic }}</span>
          <span class="dot">·</span>
          <span class="muted">{{ post.time }}</span>
          <span class="dot">·</span>
          <span class="muted">{{ post.author }}</span>
        </div>

        <img v-if="post.imageUrl" class="cover" :src="post.imageUrl" :alt="post.imageAlt || post.title" />

        <article class="content">{{ post.content }}</article>

        <div class="actions-bar">
          <button class="action-btn" :class="{ active: liked }" @click="like(post.id)">
            <span>👍</span> {{ post.likes }}
          </button>
          <button class="action-btn" :class="{ active: favoritePostIdSet.has(post.id) }" @click="toggleFavorite(post)">
            <span>⭐</span> {{ favoritePostIdSet.has(post.id) ? '已收藏' : '收藏' }}
          </button>
        </div>

        <PostCommentPanel
          :comments="postComments"
          @add="onAddComment"
        />
      </section>

      <section v-else class="detail-card page-lite">
        <h2>帖子不存在或已删除</h2>
        <p class="muted">请返回社区列表重新选择帖子。</p>
        <button class="back-btn-inline" @click="goBack">返回社区</button>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import PostCommentPanel from '../components/community/PostCommentPanel.vue'
import { useBuyerFavoritesStore } from '../stores/useBuyerFavoritesStore'
import { useBuyerCommunityStore, type CommunityPostItem } from '../stores/useBuyerCommunityStore'

type PostComment = {
  id: number
  postId: number
  parentId: number | null
  author: string
  content: string
  time: string
}

const COMMENT_STORAGE_KEY = 'gp2_buyer_post_comments'
const SCROLL_KEY = 'gp2_community_scroll_top'

const route = useRoute()
const router = useRouter()
const favoritesStore = useBuyerFavoritesStore()
const communityStore = useBuyerCommunityStore()

const comments = ref<PostComment[]>(loadComments())
const liked = ref(false)

const postId = computed(() => Number(route.params.id))
const post = computed(() => communityStore.getPostById(postId.value))
const favoritePostIdSet = computed(() => favoritesStore.postIdSet)
const postComments = computed(() => comments.value.filter((item) => item.postId === postId.value))
function goBack() {
  router.push('/community')
}

function like(id: number) {
  communityStore.likePost(id)
  liked.value = true
}

function toggleFavorite(item: CommunityPostItem) {
  favoritesStore.togglePost({
    id: item.id,
    topic: item.topic,
    title: item.title,
    content: item.content,
    time: item.time,
    author: item.author,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt
  })
}

function onAddComment(comment: Omit<PostComment, 'id'>) {
  const currentPost = post.value
  if (!currentPost) return
  comments.value.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    ...comment,
    postId: currentPost.id
  })
  persistComments()
}

function loadComments(): PostComment[] {
  const raw = safeParse<any[]>(localStorage.getItem(COMMENT_STORAGE_KEY), [])
  if (!Array.isArray(raw) || raw.length === 0) return defaultComments()

  const normalized = raw
    .map((item) => normalizeComment(item))
    .filter((item: PostComment | null): item is PostComment => !!item)

  if (normalized.length === 0) return defaultComments()
  return normalized
}

function normalizeComment(raw: any): PostComment | null {
  const id = Number(raw?.id)
  const postIdValue = Number(raw?.postId)
  if (!Number.isFinite(id) || !Number.isFinite(postIdValue)) return null

  const parentRaw = raw?.parentId
  const parentId = parentRaw === null || parentRaw === undefined ? null : Number(parentRaw)
  return {
    id,
    postId: postIdValue,
    parentId: Number.isFinite(parentId) ? parentId : null,
    author: String(raw?.author || '匿名用户'),
    content: String(raw?.content || ''),
    time: String(raw?.time || '')
  }
}

function defaultComments(): PostComment[] {
  return [
    { id: 1, postId: 1, parentId: null, author: '阳台番茄达人', content: '先降温到 20~22°C，再补光，徒长会明显缓解。', time: '昨天' },
    { id: 2, postId: 1, parentId: 1, author: '园艺新手A', content: '收到，我今晚就开始调整温度。', time: '昨天' },
    { id: 3, postId: 4, parentId: null, author: '多肉观察员', content: '这盆搭配很好看，想问颗粒土品牌是哪个？', time: '2天前' }
  ]
}

function persistComments() {
  localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(comments.value))
}

function formatNow() {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}
</script>

<style scoped>
.detail-shell {
  position: relative;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 12px 24px;
}

.back-btn {
  position: sticky;
  top: 0;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 -12px;
  padding: 10px 14px;
  border: none;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  width: calc(100% + 24px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.95);
}

.back-icon {
  font-size: 16px;
  line-height: 1;
}

.detail-card {
  display: grid;
  gap: 12px;
  padding-top: 8px;
}

.audit-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.audit-icon {
  font-size: 18px;
  line-height: 1;
  margin-top: 1px;
}

.audit-body {
  display: grid;
  gap: 4px;
}

.audit-body strong {
  font-size: 14px;
}

.audit-body p {
  margin: 0;
  font-size: 13px;
  color: #b91c1c;
}

h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.35;
  color: #111827;
}

h2 {
  margin: 0;
  font-size: 16px;
}

h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.meta-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
}

.tag {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  font-weight: 700;
  font-size: 12px;
}

.dot {
  color: #d1d5db;
  font-size: 12px;
}

.muted {
  color: #6b7280;
}

.cover {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 12px;
}

.content {
  margin: 0;
  color: #374151;
  line-height: 1.85;
  white-space: pre-wrap;
  font-size: 15px;
}

.actions-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 10px;
  border: 1px solid #e3e8e3;
  background: #f2f6f2;
  color: #1f2937;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: #e8f0e8;
}

.action-btn.active {
  border-color: #9ad3aa;
  background: #edf9ef;
  color: #1f7a41;
}

.back-btn-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid #e3e8e3;
  background: #f2f6f2;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: fit-content;
}

@media (max-width: 900px) {
  .detail-shell {
    padding: 0 10px 20px;
  }

  .back-btn {
    margin: 0 -10px;
    width: calc(100% + 20px);
  }

  h1 {
    font-size: 20px;
  }
}
</style>
