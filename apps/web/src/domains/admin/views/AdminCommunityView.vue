<template>
  <AdminLayout>
    <div class="admin-community-shell">
      <main class="admin-community-main">
        <div class="community-search page-lite">
          <input v-model.trim="keyword" type="text" placeholder="搜索帖子、作者或内容" />
        </div>

        <section v-if="filteredPosts.length > 0" class="post-list">
          <article
            v-for="post in filteredPosts"
            :key="post.id"
            class="post-card page-lite"
            role="button"
            tabindex="0"
            @click="openPostDetail(post.id)"
            @keydown.enter.prevent="openPostDetail(post.id)"
          >
            <img v-if="post.imageUrl" class="post-image" :src="post.imageUrl" :alt="post.imageAlt || post.title" />
            <div class="post-head">
              <span class="tag">{{ post.topic }}</span>
              <span class="muted">{{ post.time }}</span>
            </div>
            <h3>{{ post.title }}</h3>
            <p>{{ post.content }}</p>
            <div class="row">
              <button class="action-btn" @click.stop="like(post.id)">
                <span>👍</span> {{ post.likes }}
              </button>
              <button
                class="action-btn"
                :class="{ active: favoritePostIdSet.has(post.id) }"
                @click.stop="toggleFavorite(post)"
              >
                <span>⭐</span>
              </button>
              <button class="action-btn" @click.stop="openPostDetail(post.id)">
                <span>💬</span> {{ commentCounts[post.id] ?? 0 }}
              </button>
            </div>
          </article>
        </section>
        <div v-else class="page-lite muted">暂无帖子</div>
      </main>

      <aside v-if="selectedPostId !== null" class="admin-community-detail page-lite">
        <CommunityPostDetailPanel :post-id="selectedPostId" @close="closePostDetail" />
      </aside>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import CommunityPostDetailPanel from '../../buyer/components/community/CommunityPostDetailPanel.vue'
import { useBuyerFavoritesStore } from '../../buyer/stores/useBuyerFavoritesStore'
import { useBuyerCommunityStore, type CommunityPostItem } from '../../buyer/stores/useBuyerCommunityStore'

const keyword = ref('')
const selectedPostId = ref<number | null>(null)

const favoritesStore = useBuyerFavoritesStore()
const communityStore = useBuyerCommunityStore()

const favoritePostIdSet = computed(() => favoritesStore.postIdSet)

const commentCounts = computed(() => {
  const raw = safeParse<any[]>(localStorage.getItem('gp2_buyer_post_comments'), [])
  if (!Array.isArray(raw)) return {} as Record<number, number>
  const counts: Record<number, number> = {}
  for (const item of raw) {
    const postId = Number(item?.postId)
    if (Number.isFinite(postId)) {
      counts[postId] = (counts[postId] || 0) + 1
    }
  }
  return counts
})

const filteredPosts = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  let list = [...communityStore.posts]
  if (kw) {
    list = list.filter((post) =>
      [post.title, post.content, post.author, post.topic].some((text) => text.toLowerCase().includes(kw))
    )
  }
  return list
})

function openPostDetail(postId: number) {
  selectedPostId.value = postId
}

function closePostDetail() {
  selectedPostId.value = null
}

function like(postId: number) {
  communityStore.likePost(postId)
}

function toggleFavorite(post: CommunityPostItem) {
  favoritesStore.togglePost({
    id: post.id,
    topic: post.topic,
    title: post.title,
    content: post.content,
    time: post.time,
    author: post.author,
    imageUrl: post.imageUrl,
    imageAlt: post.imageAlt
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
.admin-community-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
  height: calc(100vh - 58px);
  overflow: hidden;
  margin: -20px -32px;
  padding: 20px 32px;
}

.admin-community-shell:has(.admin-community-detail) {
  grid-template-columns: minmax(0, 1fr) 400px;
}

.admin-community-main {
  display: grid;
  gap: 12px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.community-search input {
  width: 100%;
}

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
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  display: flex;
  flex-wrap: wrap;
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

.tag {
  font-size: 12px;
  font-weight: 700;
  color: #1f7a41;
}

.muted {
  color: #6b7280;
}

.admin-community-detail {
  min-width: 0;
  height: 100%;
  overflow-y: auto;
}

@media (max-width: 1100px) {
  .admin-community-shell {
    grid-template-columns: minmax(0, 1fr);
  }

  .admin-community-detail {
    display: none;
  }
}

@media (max-width: 760px) {
  .post-list {
    column-count: 1;
    column-width: auto;
  }
}
</style>
