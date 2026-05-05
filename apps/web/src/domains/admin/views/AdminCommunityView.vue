<template>
  <AdminLayout>
    <div class="admin-community-shell">
      <main class="admin-community-main">
        <div class="community-search-bar">
          <div class="community-search">
            <input v-model.trim="keyword" type="text" placeholder="搜索帖子、作者或内容" />
          </div>
          <button class="compose-toggle" @click="showCompose = !showCompose">
            {{ showCompose ? '取消' : '发布官方活动' }}
          </button>
        </div>

        <div v-if="showCompose" class="compose-form page-lite">
          <h4>发布官方活动</h4>
          <input v-model.trim="composeForm.title" type="text" placeholder="标题" />
          <textarea v-model.trim="composeForm.content" placeholder="内容" rows="4" />
          <input v-model.trim="composeForm.imageUrl" type="text" placeholder="图片链接（可选）" />
          <div class="compose-actions">
            <button class="submit-btn" @click="submitPost">发布</button>
          </div>
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
              <button class="action-btn" :class="{ active: post.liked }" @click.stop="like(post.id)">
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
        <div v-else-if="communityStore.loading" class="page-lite muted">帖子加载中...</div>
        <div v-else class="page-lite muted">暂无帖子</div>
      </main>

      <aside v-if="selectedPostId !== null" class="admin-community-detail page-lite">
        <CommunityPostDetailPanel :post-id="selectedPostId" @close="closePostDetail" />
      </aside>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import CommunityPostDetailPanel from '../../buyer/components/community/CommunityPostDetailPanel.vue'
import { useBuyerFavoritesStore } from '../../buyer/stores/useBuyerFavoritesStore'
import { useBuyerCommunityStore, type CommunityPostItem } from '../../buyer/stores/useBuyerCommunityStore'
import { createCommunityPost } from '../../buyer/api'

const keyword = ref('')
const selectedPostId = ref<number | null>(null)
const showCompose = ref(false)
const composeForm = reactive({ title: '', content: '', imageUrl: '' })

async function submitPost() {
  if (!composeForm.title || !composeForm.content) return
  try {
    await createCommunityPost({
      topic: '官方活动',
      title: composeForm.title,
      content: composeForm.content,
      imageUrl: composeForm.imageUrl || null
    })
    composeForm.title = ''
    composeForm.content = ''
    composeForm.imageUrl = ''
    showCompose.value = false
    communityStore.loadPosts()
  } catch (e) {
    console.error('发布失败', e)
    alert('发布失败，请检查内容后重试')
  }
}

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

onMounted(() => {
  communityStore.loadPosts()
})

const filteredPosts = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  let list = communityStore.posts.filter((post) => post.auditStatus === 'approved')
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

async function toggleFavorite(post: CommunityPostItem) {
  await favoritesStore.togglePost({
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

.community-search-bar {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.community-search {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e6f0e8;
  padding: 10px 12px;
}

.community-search input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  outline: none;
}

.compose-toggle {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #1f7a41;
  background: #1f7a41;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.compose-toggle:hover {
  background: #276749;
}

.compose-form {
  display: grid;
  gap: 10px;
  padding: 16px;
}

.compose-form h4 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}

.compose-form input,
.compose-form textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d3d7de;
  background: #f8fcf8;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.compose-form textarea {
  resize: vertical;
}

.compose-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: #1f7a41;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.submit-btn:hover {
  background: #276749;
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
