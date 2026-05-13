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

        <AdminComposeModal
          :open="showCompose"
          @close="showCompose = false"
          @submit="submitPost"
        />

        <AdminPostList
          :posts="filteredPosts"
          :favorite-post-id-set="favoritePostIdSet"
          :loading="communityStore.loading"
          @like="like"
          @toggle-favorite="toggleFavorite"
          @open-post-detail="openPostDetail"
        />
      </main>

      <aside v-if="selectedPostId !== null" class="admin-community-detail page-lite">
        <CommunityPostDetailPanel :post-id="selectedPostId" @close="closePostDetail" />
      </aside>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import CommunityPostDetailPanel from '../../buyer/components/community/CommunityPostDetailPanel.vue'
import { useBuyerFavoritesStore } from '../../buyer/stores/useBuyerFavoritesStore'
import { useBuyerCommunityStore, type CommunityPostItem } from '../../buyer/stores/useBuyerCommunityStore'
import { createCommunityPost } from '../../buyer/api'
import AdminComposeModal from '../components/AdminComposeModal.vue'
import AdminPostList from '../components/AdminPostList.vue'

const keyword = ref('')
const selectedPostId = ref<number | null>(null)
const showCompose = ref(false)

const favoritesStore = useBuyerFavoritesStore()
const communityStore = useBuyerCommunityStore()

const favoritePostIdSet = computed(() => favoritesStore.postIdSet)

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

async function submitPost(payload: { title: string; content: string; imageUrl: string | null }) {
  try {
    await createCommunityPost({
      topic: '官方活动',
      title: payload.title,
      content: payload.content,
      imageUrl: payload.imageUrl
    })
    showCompose.value = false
    communityStore.loadPosts()
  } catch (e) {
    console.error('发布失败', e)
    alert('发布失败，请检查内容后重试')
  }
}

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
</style>
