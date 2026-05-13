<template>
  <AppLayout>
    <div class="community-shell">
      <CommunitySidebar
        :active-tab="activeTab"
        :is-compose-mode="isComposeMode"
        :is-topic-dropdown-open="isTopicDropdownOpen"
        :selected-topic="selectedTopic"
        :topic-options="topicOptions"
        :active-inbox="activeInbox"
        :direct-conversation-count="directChat.directConversationCount.value"
        :reply-count="replyNotifications.length"
        :like-count="likeNotifications.length"
        @toggle-compose-mode="toggleComposeMode"
        @set-tab="setTab"
        @toggle-topic-dropdown="toggleTopicDropdown"
        @select-topic="selectTopic"
        @open-inbox="openInbox"
      />

      <main ref="mainRef" class="community-main">
        <CommunityComposeModal
          :open="isComposeMode"
          :is-admin="isAdmin"
          @close="setTab('all')"
          @submit="submitDraft"
        />

        <CommunityEditModal
          :open="editingPostId !== null"
          :post="editingPost"
          @close="cancelEdit"
          @submit="submitEdit"
        />

        <div class="page-lite community-search">
          <input v-model.trim="rightKeyword" type="text" placeholder="搜索帖子、作者或消息内容" />
        </div>

        <CommunityAnnouncementBar ref="announcementBarRef" :announcements="announcements" />

        <CommunityInboxPanel
          v-if="activeTab === 'inbox'"
          :active-inbox="activeInbox"
          :inbox-title="inboxTitle"
          :inbox-hint="inboxHint"
          :active-conversation="directChat.activeConversation.value"
          :filtered-conversations="directChat.filteredConversations.value"
          :chat-draft="directChat.chatDraft.value"
          :active-inbox-items="activeInboxItems"
          @open-direct-chat="directChat.openDirectChat"
          @back-to-inbox-list="directChat.backToInboxList"
          @send-direct-message="directChat.sendDirectMessage"
          @update-chat-draft="directChat.chatDraft.value = $event"
        />

        <div v-if="(activeTab === 'my' || activeTab === 'favorites') && filteredPosts.length === 0" class="page-lite muted">
          {{ activeTab === 'my' ? '暂无我的帖子' : '暂无收藏的帖子' }}
        </div>

        <CommunityMyPostList
          v-if="activeTab === 'my' && filteredPosts.length > 0"
          :posts="filteredPosts"
          @open-post-detail="openPostDetail"
          @edit="startEdit"
          @delete="confirmDelete"
        />

        <CommunityPostList
          v-if="activeTab !== 'inbox' && activeTab !== 'my'"
          :posts="filteredPosts"
          :favorite-post-id-set="favoritePostIdSet"
          :show-empty="filteredPosts.length === 0"
          :empty-text="activeTab === 'favorites' ? '暂无收藏的帖子' : '暂无内容'"
          @open-post-detail="openPostDetail"
          @like="like"
          @toggle-favorite="toggleFavorite"
          @prefill-reply="prefillReply"
          @prefill-message="prefillMessage"
        />
      </main>

      <aside v-if="selectedPostId !== null" class="community-detail-panel page-lite">
        <CommunityPostDetailPanel :post-id="selectedPostId" @close="closePostDetail" />
      </aside>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import { fetchAnnouncements, updateCommunityPost, deleteCommunityPost, type AnnouncementItem } from '../api'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import { useBuyerFavoritesStore } from '../stores/useBuyerFavoritesStore'
import { useBuyerCommunityStore, type CommunityPostItem, type TopicCategory } from '../stores/useBuyerCommunityStore'
import { useDirectChat } from '../composables/useDirectChat'
import { useCommunityInbox } from '../composables/useCommunityInbox'
import CommunityPostDetailPanel from '../components/community/CommunityPostDetailPanel.vue'
import CommunitySidebar from '../components/community/CommunitySidebar.vue'
import CommunityInboxPanel from '../components/community/CommunityInboxPanel.vue'
import CommunityAnnouncementBar from '../components/community/CommunityAnnouncementBar.vue'
import CommunityPostList from '../components/community/CommunityPostList.vue'
import CommunityComposeModal from '../components/community/CommunityComposeModal.vue'
import CommunityEditModal from '../components/community/CommunityEditModal.vue'
import CommunityMyPostList from '../components/community/CommunityMyPostList.vue'

type Tab = 'all' | 'my' | 'favorites' | 'inbox' | 'compose'
type InboxType = 'message' | 'reply' | 'like'

const topicOptions: TopicCategory[] = ['种植经验', '求助问答', '成果展示', '官方活动']

const activeTab = ref<Tab>('all')
const activeInbox = ref<InboxType>('message')
const selectedTopic = ref<TopicCategory | null>(null)
const isTopicDropdownOpen = ref(false)
const message = ref('')
const rightKeyword = ref('')
const announcements = ref<AnnouncementItem[]>([])
const selectedPostId = ref<number | null>(null)
const announcementBarRef = ref<{ stopCarousel: () => void } | null>(null)
const authStore = useAuthStore()
const favoritesStore = useBuyerFavoritesStore()
const communityStore = useBuyerCommunityStore()
const isAdmin = computed(() => authStore.role === 'ADMIN')
const isComposeMode = computed(() => activeTab.value === 'compose')
const favoritePostIdSet = computed(() => favoritesStore.postIdSet)

const directChat = useDirectChat(rightKeyword)
const { replyNotifications, likeNotifications, activeInboxItems, inboxTitle, inboxHint, addReplyNotification } =
  useCommunityInbox(rightKeyword, activeInbox)

const editingPostId = ref<number | null>(null)
const editingPost = computed(() => communityStore.posts.find((p) => p.id === editingPostId.value) || null)

const filteredPosts = computed(() => {
  let list = [...communityStore.posts]
  if (activeTab.value === 'my') list = list.filter((post) => post.mine)
  if (activeTab.value === 'favorites') {
    const favSet = favoritesStore.postIdSet
    list = list.filter((post) => favSet.has(post.id))
  }
  if (selectedTopic.value) list = list.filter((post) => post.topic === selectedTopic.value)

  const kw = rightKeyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter((post) => [post.title, post.content, post.author, post.topic].some((text) => text.toLowerCase().includes(kw)))
  }

  return list
})

onMounted(() => {
  loadAnnouncements()
  communityStore.loadPosts()
  favoritesStore.loadFavoritePostsFromServer()
  restoreScroll()
})

onBeforeUnmount(() => {
  saveScroll()
  announcementBarRef.value?.stopCarousel()
})

const SCROLL_KEY = 'gp2_community_scroll_top'
const mainRef = ref<HTMLElement | null>(null)

function saveScroll() {
  const el = mainRef.value
  if (!el) return
  sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop))
}

function restoreScroll() {
  const saved = sessionStorage.getItem(SCROLL_KEY)
  if (saved === null) return
  const top = Number(saved)
  if (!Number.isFinite(top)) return
  requestAnimationFrame(() => {
    const el = mainRef.value
    if (el) el.scrollTop = top
  })
}

async function loadAnnouncements() {
  try {
    const list = await fetchAnnouncements()
    announcements.value = list.slice(0, 5)
  } catch {
    announcements.value = []
  }
}

function setTab(tab: string) {
  activeTab.value = tab as Tab
  if (tab !== 'all') isTopicDropdownOpen.value = false
}

function toggleTopicDropdown() {
  if (activeTab.value !== 'all') setTab('all')
  isTopicDropdownOpen.value = !isTopicDropdownOpen.value
}

function selectTopic(topic: TopicCategory) {
  selectedTopic.value = selectedTopic.value === topic ? null : topic
  activeTab.value = 'all'
}

function toggleComposeMode() {
  if (isComposeMode.value) {
    setTab('all')
    return
  }
  activeTab.value = 'compose'
}

function openInbox(type: string) {
  activeInbox.value = type as InboxType
  activeTab.value = 'inbox'
  if (type !== 'message') directChat.activeConversationId.value = null
}

function submitDraft(payload: { topic: TopicCategory; title: string; content: string; imageUrl: string | null }) {
  communityStore.addPost(payload)
    .then(() => {
      message.value = '帖子已发布'
      activeTab.value = 'all'
    })
    .catch((err: any) => {
      message.value = err?.response?.data?.message || '发布失败'
    })
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

function prefillReply(post: CommunityPostItem) {
  activeTab.value = 'inbox'
  activeInbox.value = 'reply'
  directChat.activeConversationId.value = null
  addReplyNotification(`你回复了帖子：${post.title}`)
}

function prefillMessage(post: CommunityPostItem) {
  activeTab.value = 'inbox'
  activeInbox.value = 'message'
  const text = `你好，想和你交流一下帖子《${post.title}》`
  const conversationId = directChat.appendConversationMessage(post.author, text, 'me')
  directChat.openDirectChat(conversationId)
}

function openPostDetail(postId: number) {
  if (selectedPostId.value === postId) {
    closePostDetail()
    return
  }
  selectedPostId.value = postId
}

function closePostDetail() {
  selectedPostId.value = null
}

function startEdit(post: CommunityPostItem) {
  editingPostId.value = post.id
  message.value = ''
}

function cancelEdit() {
  editingPostId.value = null
}

async function submitEdit(id: number, payload: { topic: TopicCategory; title: string; content: string; imageUrl: string | null }) {
  try {
    await updateCommunityPost(id, payload)
    await communityStore.loadPosts()
    editingPostId.value = null
    message.value = '帖子已更新'
  } catch (err: any) {
    message.value = err?.response?.data?.message || '更新失败'
  }
}

async function confirmDelete(post: CommunityPostItem) {
  if (!confirm(`确定要删除帖子「${post.title}」吗？`)) return
  try {
    await deleteCommunityPost(post.id)
    await communityStore.loadPosts()
    message.value = '帖子已删除'
  } catch (err: any) {
    message.value = err?.response?.data?.message || '删除失败'
  }
}
</script>

<style scoped>
.community-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 18px;
  height: calc(100vh - 108px);
  overflow: hidden;
}

.community-shell:has(.community-detail-panel) {
  grid-template-columns: 280px minmax(0, 1fr) 400px;
}

.community-sidebar {
  display: grid;
  gap: 10px;
  min-height: 0;
  overflow-y: auto;
}

.community-main {
  display: grid;
  gap: 12px;
  min-height: 0;
  overflow-y: auto;
}

.community-search input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e6f0e8;
  background: #fff;
  font-size: 14px;
  outline: none;
}

.muted {
  color: #6b7280;
}

@media (max-width: 1100px) {
  .community-shell:has(.community-detail-panel) {
    grid-template-columns: 280px minmax(0, 1fr);
  }

  .community-detail-panel {
    display: none;
  }
}

@media (max-width: 900px) {
  .community-shell,
  .community-shell:has(.community-detail-panel) {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }

  .community-sidebar,
  .community-main {
    overflow: visible;
  }

  .chat-thread {
    max-height: 260px;
  }
}

@media (max-width: 760px) {
  .post-list {
    column-count: 1;
    column-width: auto;
  }

  .chat-compose {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
