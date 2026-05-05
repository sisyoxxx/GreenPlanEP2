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
        :direct-conversation-count="directConversationCount"
        :reply-count="replyNotifications.length"
        :like-count="likeNotifications.length"
        @toggle-compose-mode="toggleComposeMode"
        @set-tab="setTab"
        @toggle-topic-dropdown="toggleTopicDropdown"
        @select-topic="selectTopic"
        @open-inbox="openInbox"
      />

      <main ref="mainRef" class="community-main">
        <section v-if="isComposeMode" class="page-lite compose-panel">
          <h3>发布新帖</h3>
          <p class="muted">{{ isAdmin ? '管理员发布会自动归类为“官方活动”。' : '可选分类：种植经验、求助问答、成果展示。' }}</p>
          <select v-model="draft.topic" :disabled="isAdmin">
            <option v-for="topic in draftTopicOptions" :key="topic" :value="topic">{{ topic }}</option>
          </select>
          <input v-model.trim="draft.title" placeholder="标题" />
          <textarea v-model.trim="draft.content" rows="5" placeholder="内容"></textarea>
          <div class="upload-row">
            <button class="secondary-btn" @click="triggerImageUpload">选择图片</button>
            <button v-if="draftImageUrl" class="secondary-btn" @click="removeDraftImage">移除图片</button>
            <input ref="draftImageInput" class="hidden-input" type="file" accept="image/*" @change="handleDraftImageChange" />
          </div>
          <img v-if="draftImageUrl" class="draft-image" :src="draftImageUrl" :alt="draftImageName || '帖子图片'" />
          <div class="row">
            <button class="secondary-btn" @click="resetDraft">清空</button>
            <button @click="submitDraft">发布</button>
          </div>
          <p v-if="message" class="message">{{ message }}</p>
        </section>

        <template v-else>
          <div class="page-lite community-search">
            <input v-model.trim="rightKeyword" type="text" placeholder="搜索帖子、作者或消息内容" />
          </div>

          <CommunityAnnouncementBar ref="announcementBarRef" :announcements="announcements" />

          <CommunityInboxPanel
            v-if="activeTab === 'inbox'"
            :active-inbox="activeInbox"
            :inbox-title="inboxTitle"
            :inbox-hint="inboxHint"
            :active-conversation="activeConversation"
            :filtered-conversations="filteredConversations"
            :chat-draft="chatDraft"
            :active-inbox-items="activeInboxItems"
            @open-direct-chat="openDirectChat"
            @back-to-inbox-list="backToInboxList"
            @send-direct-message="sendDirectMessage"
            @update-chat-draft="chatDraft = $event"
          />

          <div v-if="activeTab === 'my' && filteredPosts.length === 0" class="page-lite muted">暂无内容</div>

          <CommunityPostList
            v-if="activeTab !== 'inbox'"
            :posts="filteredPosts"
            :favorite-post-id-set="favoritePostIdSet"
            :comment-counts="commentCounts"
            :show-empty="activeTab === 'my' && filteredPosts.length === 0"
            empty-text="暂无内容"
            @open-post-detail="openPostDetail"
            @like="like"
            @toggle-favorite="toggleFavorite"
            @prefill-reply="prefillReply"
            @prefill-message="prefillMessage"
          />
        </template>
      </main>

      <aside v-if="selectedPostId !== null" class="community-detail-panel page-lite">
        <CommunityPostDetailPanel :post-id="selectedPostId" @close="closePostDetail" />
      </aside>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import { fetchAnnouncements, type AnnouncementItem } from '../api'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import { useBuyerFavoritesStore } from '../stores/useBuyerFavoritesStore'
import { useBuyerCommunityStore, type CommunityPostItem, type TopicCategory } from '../stores/useBuyerCommunityStore'
import CommunityPostDetailPanel from '../components/community/CommunityPostDetailPanel.vue'
import CommunitySidebar from '../components/community/CommunitySidebar.vue'
import CommunityInboxPanel from '../components/community/CommunityInboxPanel.vue'
import CommunityAnnouncementBar from '../components/community/CommunityAnnouncementBar.vue'
import CommunityPostList from '../components/community/CommunityPostList.vue'

type Tab = 'all' | 'my' | 'inbox' | 'compose'
type InboxType = 'message' | 'reply' | 'like'
type InboxItem = { id: number; text: string; time: string }
type ChatSender = 'me' | 'other'
type DirectChatMessage = { id: number; sender: ChatSender; text: string; time: string }
type DirectConversation = {
  id: number
  partner: string
  preview: string
  updatedAt: string
  unread: number
  messages: DirectChatMessage[]
}

const DIRECT_CHAT_STORAGE_KEY = 'gp2_buyer_direct_chats'
const topicOptions: TopicCategory[] = ['种植经验', '求助问答', '成果展示', '官方活动']
const buyerTopicOptions: TopicCategory[] = ['种植经验', '求助问答', '成果展示']

const activeTab = ref<Tab>('all')
const activeInbox = ref<InboxType>('message')
const selectedTopic = ref<TopicCategory | null>(null)
const isTopicDropdownOpen = ref(false)
const message = ref('')
const rightKeyword = ref('')
const announcements = ref<AnnouncementItem[]>([])
const chatDraft = ref('')
const activeConversationId = ref<number | null>(null)
const selectedPostId = ref<number | null>(null)
const announcementBarRef = ref<{ stopCarousel: () => void } | null>(null)
const authStore = useAuthStore()
const favoritesStore = useBuyerFavoritesStore()
const communityStore = useBuyerCommunityStore()
const isAdmin = computed(() => authStore.role === 'ADMIN')
const isComposeMode = computed(() => activeTab.value === 'compose')
const draftTopicOptions = computed<TopicCategory[]>(() => (isAdmin.value ? ['官方活动'] : buyerTopicOptions))
const favoritePostIdSet = computed(() => favoritesStore.postIdSet)

const draft = reactive({ topic: '种植经验' as TopicCategory, title: '', content: '' })
const draftImageInput = ref<HTMLInputElement | null>(null)
const draftImageUrl = ref('')
const draftImageName = ref('')

const directConversations = ref<DirectConversation[]>(loadDirectConversations())
const directConversationCount = computed(() => directConversations.value.length)
const activeConversation = computed(() => directConversations.value.find((item) => item.id === activeConversationId.value) || null)
const filteredConversations = computed(() => {
  const kw = rightKeyword.value.trim().toLowerCase()
  if (!kw) return directConversations.value
  return directConversations.value.filter((item) => {
    const msgText = item.messages.map((msg) => msg.text).join(' ')
    return [item.partner, item.preview, item.updatedAt, msgText].some((text) => text.toLowerCase().includes(kw))
  })
})

const replyNotifications = ref<InboxItem[]>([
  { id: 1, text: '阳台番茄达人 回复了你：先补光，再适当降温。', time: '刚刚' }
])
const likeNotifications = ref<InboxItem[]>([
  { id: 1, text: '你的帖子《第一次播种成功发芽了》新增 3 个赞。', time: '今天' }
])

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
  let list = [...communityStore.posts]
  if (activeTab.value === 'my') list = list.filter((post) => post.mine)
  if (selectedTopic.value) list = list.filter((post) => post.topic === selectedTopic.value)

  const kw = rightKeyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter((post) => [post.title, post.content, post.author, post.topic].some((text) => text.toLowerCase().includes(kw)))
  }

  return list
})

const activeInboxItems = computed(() => {
  let list: InboxItem[] = activeInbox.value === 'reply' ? replyNotifications.value : likeNotifications.value

  const kw = rightKeyword.value.trim().toLowerCase()
  if (!kw) return list
  return list.filter((item) => item.text.toLowerCase().includes(kw) || item.time.toLowerCase().includes(kw))
})

const inboxTitle = computed(() => activeInbox.value === 'message' ? '私信消息' : activeInbox.value === 'reply' ? '评论回复' : '点赞消息')
const inboxHint = computed(() => {
  if (activeInbox.value === 'message') return '点击一条私信可在当前窗口进入聊天框，消息临时保存在浏览器本地。'
  if (activeInbox.value === 'reply') return '这里显示帖子回复。'
  return '这里显示点赞动态。'
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
  if (isAdmin.value) draft.topic = '官方活动'
}

function openInbox(type: string) {
  activeInbox.value = type as InboxType
  activeTab.value = 'inbox'
  if (type !== 'message') activeConversationId.value = null
}

function openDirectChat(conversationId: number) {
  activeTab.value = 'inbox'
  activeInbox.value = 'message'
  activeConversationId.value = conversationId
  const target = directConversations.value.find((item) => item.id === conversationId)
  if (!target) return
  target.unread = 0
  persistDirectConversations()
}

function backToInboxList() {
  activeConversationId.value = null
}

function sendDirectMessage() {
  const text = chatDraft.value.trim()
  const conversation = activeConversation.value
  if (!text || !conversation) return

  conversation.messages.push({
    id: Date.now(),
    sender: 'me',
    text,
    time: formatNow()
  })
  conversation.preview = text
  conversation.updatedAt = formatNow()
  conversation.unread = 0
  moveConversationToTop(conversation.id)
  persistDirectConversations()
  chatDraft.value = ''
}

function triggerImageUpload() {
  draftImageInput.value?.click()
}

async function handleDraftImageChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  removeDraftImage()
  draftImageUrl.value = await readFileAsDataUrl(file)
  draftImageName.value = file.name
}

function removeDraftImage() {
  draftImageUrl.value = ''
  draftImageName.value = ''
  if (draftImageInput.value) draftImageInput.value.value = ''
}

function resetDraft() {
  draft.topic = isAdmin.value ? '官方活动' : '种植经验'
  draft.title = ''
  draft.content = ''
  message.value = ''
  removeDraftImage()
}

function submitDraft() {
  if (!draft.title || !draft.content) {
    message.value = '请填写标题和内容'
    return
  }

  const topic: TopicCategory = isAdmin.value
    ? '官方活动'
    : buyerTopicOptions.includes(draft.topic) ? draft.topic : '种植经验'

  communityStore.addPost({
    topic,
    title: draft.title,
    content: draft.content,
    imageUrl: draftImageUrl.value || null
  }).then(() => {
    resetDraft()
    message.value = '帖子已发布'
    activeTab.value = 'all'
  }).catch((err: any) => {
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
  activeConversationId.value = null
  replyNotifications.value.unshift({ id: Date.now(), text: `你回复了帖子：${post.title}`, time: '刚刚' })
}

function prefillMessage(post: CommunityPostItem) {
  activeTab.value = 'inbox'
  activeInbox.value = 'message'
  const text = `你好，想和你交流一下帖子《${post.title}》`
  const conversationId = appendConversationMessage(post.author, text, 'me')
  openDirectChat(conversationId)
}

function openPostDetail(postId: number) {
  selectedPostId.value = postId
}

function closePostDetail() {
  selectedPostId.value = null
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}

function appendConversationMessage(partner: string, text: string, sender: ChatSender) {
  let conversation = directConversations.value.find((item) => item.partner === partner)
  if (!conversation) {
    conversation = {
      id: Date.now(),
      partner,
      preview: '',
      updatedAt: formatNow(),
      unread: 0,
      messages: []
    }
    directConversations.value = [conversation, ...directConversations.value]
  }

  conversation.messages.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    sender,
    text,
    time: formatNow()
  })
  conversation.preview = text
  conversation.updatedAt = formatNow()
  if (sender === 'other') conversation.unread += 1
  moveConversationToTop(conversation.id)
  persistDirectConversations()
  return conversation.id
}

function moveConversationToTop(conversationId: number) {
  const target = directConversations.value.find((item) => item.id === conversationId)
  if (!target) return
  directConversations.value = [target, ...directConversations.value.filter((item) => item.id !== conversationId)]
}

function persistDirectConversations() {
  localStorage.setItem(DIRECT_CHAT_STORAGE_KEY, JSON.stringify(directConversations.value))
}

function loadDirectConversations(): DirectConversation[] {
  const raw = safeParse<any[]>(localStorage.getItem(DIRECT_CHAT_STORAGE_KEY), [])
  if (!Array.isArray(raw) || raw.length === 0) return defaultConversations()

  const normalized = raw.map((item) => normalizeConversation(item)).filter((item): item is DirectConversation => !!item)
  if (normalized.length === 0) return defaultConversations()
  return normalized
}

function normalizeConversation(raw: any): DirectConversation | null {
  const id = Number(raw?.id)
  if (!Number.isFinite(id)) return null
  const messagesRaw = Array.isArray(raw?.messages) ? raw.messages : []
  const messages = messagesRaw
    .map((msg: any) => {
      const msgId = Number(msg?.id)
      if (!Number.isFinite(msgId)) return null
      const sender: ChatSender = msg?.sender === 'other' ? 'other' : 'me'
      return {
        id: msgId,
        sender,
        text: String(msg?.text || ''),
        time: String(msg?.time || '')
      }
    })
    .filter((msg: DirectChatMessage | null): msg is DirectChatMessage => !!msg)

  return {
    id,
    partner: String(raw?.partner || '社区好友'),
    preview: String(raw?.preview || ''),
    updatedAt: String(raw?.updatedAt || ''),
    unread: Math.max(0, Number(raw?.unread) || 0),
    messages
  }
}

function defaultConversations(): DirectConversation[] {
  return [
    {
      id: 1,
      partner: '阳台番茄达人',
      preview: '你昨天问的补光灯型号我发你了。',
      updatedAt: '刚刚',
      unread: 1,
      messages: [
        { id: 101, sender: 'other', text: '你昨天问的补光灯型号我发你了。', time: '刚刚' }
      ]
    },
    {
      id: 2,
      partner: '厨房花园君',
      preview: '薄荷打顶后恢复很快，记得两天后追肥。',
      updatedAt: '今天',
      unread: 0,
      messages: [
        { id: 201, sender: 'other', text: '薄荷打顶后恢复很快，记得两天后追肥。', time: '今天' }
      ]
    }
  ]
}

function formatNow() {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
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

.compose-panel {
  display: grid;
  gap: 10px;
}

.community-search input,
.compose-panel input,
.compose-panel textarea,
.compose-panel select {
  width: 100%;
}

.upload-row,
.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hidden-input {
  display: none;
}

.draft-image {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 12px;
}



.muted {
  color: #6b7280;
}

.message {
  color: #1f7a41;
  margin: 0;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.secondary-btn.active {
  border-color: #9ad3aa;
  background: #edf9ef;
  color: #1f7a41;
}

@media (max-width: 1280px) {
  .post-list {
    column-width: 220px;
    column-gap: 10px;
  }
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
