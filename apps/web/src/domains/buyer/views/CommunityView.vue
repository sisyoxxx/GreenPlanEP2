<template>
  <AppLayout>
    <div class="community-shell">
      <aside class="community-sidebar page-lite">
        <button class="post-btn" @click="toggleComposeMode">{{ isComposeMode ? '返回社区' : '+ 发帖' }}</button>

        <div class="topic-nav-wrap">
          <button class="nav-item topic-nav-trigger" :class="{ active: activeTab === 'all' }" @click="toggleTopicDropdown">
            话题分类
            <span class="topic-arrow" :class="{ open: isTopicDropdownOpen }">⌄</span>
          </button>
          <div v-if="isTopicDropdownOpen" class="topic-dropdown">
            <button
              v-for="topic in topicOptions"
              :key="topic"
              class="topic-option"
              :class="{ active: selectedTopic === topic }"
              @click="selectTopic(topic)"
            >
              {{ topic }}
            </button>
          </div>
        </div>

        <button class="nav-item" :class="{ active: activeTab === 'my' }" @click="setTab('my')">我的帖子</button>
        <button class="nav-item" :class="{ active: activeTab === 'inbox' }" @click="setTab('inbox')">私信中心</button>

        <div class="sidebar-messages">
          <button class="message-item" :class="{ active: activeInbox === 'message' && activeTab === 'inbox' }" @click="openInbox('message')">
            <span>私信消息</span><span class="message-badge">{{ directConversationCount }}</span>
          </button>
          <button class="message-item" :class="{ active: activeInbox === 'reply' && activeTab === 'inbox' }" @click="openInbox('reply')">
            <span>评论回复</span><span class="message-badge">{{ replyNotifications.length }}</span>
          </button>
          <button class="message-item" :class="{ active: activeInbox === 'like' && activeTab === 'inbox' }" @click="openInbox('like')">
            <span>点赞消息</span><span class="message-badge">{{ likeNotifications.length }}</span>
          </button>
        </div>
      </aside>

      <main class="community-main">
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

          <div v-if="activeTab === 'all'" class="page-lite announcement-bar">
            <strong>{{ announcementTitle }}</strong>
            <span>{{ announcementContent }}</span>
          </div>

          <section v-if="activeTab === 'inbox'" class="page-lite inbox-panel">
            <h3>{{ inboxTitle }}</h3>
            <p class="muted">{{ inboxHint }}</p>

            <template v-if="activeInbox === 'message'">
              <div v-if="!activeConversation" class="conversation-list">
                <button
                  v-for="conversation in filteredConversations"
                  :key="conversation.id"
                  class="conversation-item"
                  @click="openDirectChat(conversation.id)"
                >
                  <div class="conversation-main">
                    <strong>{{ conversation.partner }}</strong>
                    <p>{{ conversation.preview || '暂无消息内容' }}</p>
                  </div>
                  <div class="conversation-meta">
                    <span>{{ conversation.updatedAt }}</span>
                    <span v-if="conversation.unread > 0" class="message-badge">{{ conversation.unread }}</span>
                  </div>
                </button>
                <div v-if="filteredConversations.length === 0" class="muted">暂时没有私信消息</div>
              </div>

              <div v-else class="chat-panel">
                <div class="chat-head">
                  <button class="secondary-btn" @click="backToInboxList">返回消息列表</button>
                  <strong>与 {{ activeConversation.partner }} 的聊天</strong>
                </div>

                <div class="chat-thread">
                  <article
                    v-for="msg in activeConversation.messages"
                    :key="msg.id"
                    class="chat-row"
                    :class="{ mine: msg.sender === 'me' }"
                  >
                    <p class="chat-bubble">{{ msg.text }}</p>
                    <span class="muted">{{ msg.time }}</span>
                  </article>
                </div>

                <div class="chat-compose">
                  <input v-model.trim="chatDraft" type="text" placeholder="输入消息并回车发送" @keydown.enter.prevent="sendDirectMessage" />
                  <button class="secondary-btn" :disabled="!chatDraft" @click="sendDirectMessage">发送</button>
                </div>
              </div>
            </template>

            <template v-else>
              <div v-if="activeInboxItems.length === 0" class="muted">暂时没有新消息</div>
              <article v-for="item in activeInboxItems" :key="item.id" class="inbox-item">
                <p>{{ item.text }}</p>
                <span class="muted">{{ item.time }}</span>
              </article>
            </template>
          </section>

          <div v-if="activeTab === 'my' && filteredPosts.length === 0" class="page-lite muted">暂无内容</div>

          <section v-if="activeTab !== 'inbox' && filteredPosts.length > 0" class="post-list">
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
                <button class="secondary-btn" @click.stop="like(post.id)">点赞 {{ post.likes }}</button>
                <button class="secondary-btn" :class="{ active: favoritePostIdSet.has(post.id) }" @click.stop="toggleFavorite(post)">
                  {{ favoritePostIdSet.has(post.id) ? '已收藏' : '收藏' }}
                </button>
                <button class="secondary-btn" @click.stop="prefillReply(post)">评论</button>
                <button class="secondary-btn" @click.stop="prefillMessage(post)">私信</button>
              </div>
            </article>
          </section>
        </template>
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import { fetchAnnouncements, type AnnouncementItem } from '../api'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import { useBuyerFavoritesStore } from '../stores/useBuyerFavoritesStore'
import { useBuyerCommunityStore, type CommunityPostItem, type TopicCategory } from '../stores/useBuyerCommunityStore'

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
const latestAnnouncement = ref<AnnouncementItem | null>(null)
const chatDraft = ref('')
const activeConversationId = ref<number | null>(null)

const router = useRouter()
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

const announcementTitle = computed(() => latestAnnouncement.value?.title || '本周主题：晒出你的阳台春播进度')
const announcementContent = computed(() => latestAnnouncement.value?.content || '带图发帖更容易获得互动。')

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

onMounted(loadAnnouncement)

async function loadAnnouncement() {
  try {
    const list = await fetchAnnouncements()
    latestAnnouncement.value = list[0] || null
  } catch {
    latestAnnouncement.value = null
  }
}

function setTab(tab: Tab) {
  activeTab.value = tab
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

function openInbox(type: InboxType) {
  activeInbox.value = type
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
    id: Date.now(),
    topic,
    title: draft.title,
    content: draft.content,
    time: '刚刚',
    likes: 0,
    mine: true,
    author: '我',
    imageUrl: draftImageUrl.value || undefined,
    imageAlt: draftImageName.value || undefined
  })

  resetDraft()
  message.value = '帖子已发布'
  activeTab.value = 'all'
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
  router.push(`/community/posts/${postId}`)
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

.topic-nav-wrap,
.sidebar-messages,
.compose-panel,
.announcement-bar,
.inbox-panel,
.post-card {
  display: grid;
  gap: 10px;
}

.post-btn,
.nav-item,
.message-item,
.topic-option {
  width: 100%;
}

.topic-nav-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topic-arrow.open {
  transform: rotate(180deg);
}

.topic-dropdown {
  display: grid;
  gap: 6px;
}

.post-btn {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #1f7a41;
  background: #1f7a41;
  color: #ffffff;
  font-weight: 700;
}

.message-item,
.nav-item,
.topic-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e2ece3;
  background: #ffffff;
  color: #1f2937;
  font-weight: 600;
  text-align: left;
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.message-item:hover,
.nav-item:hover,
.topic-option:hover {
  transform: translateY(-1px);
  border-color: #cfe2d3;
  box-shadow: 0 6px 14px rgba(31, 122, 65, 0.08);
}

.message-item.active,
.nav-item.active,
.topic-option.active {
  border-color: #9ad3aa;
  box-shadow: 0 0 0 1px rgba(31, 122, 65, 0.12);
  color: #1d5b36;
  background: #ffffff;
}

.message-badge {
  border-radius: 999px;
  padding: 0 8px;
  background: #f4f8f4;
  color: #4b5563;
}

.message-item.active .message-badge {
  background: #e8f6eb;
  color: #1d5b36;
}

.community-search input,
.compose-panel input,
.compose-panel textarea,
.compose-panel select,
.chat-compose input {
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

.conversation-list {
  display: grid;
  gap: 10px;
}

.conversation-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e3ece5;
  background: #fff;
  text-align: left;
}

.conversation-main {
  min-width: 0;
}

.conversation-main p {
  margin: 4px 0 0;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-meta {
  display: grid;
  justify-items: end;
  gap: 6px;
  color: #9ca3af;
  font-size: 12px;
}

.chat-panel {
  display: grid;
  gap: 10px;
}

.chat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.chat-thread {
  display: grid;
  gap: 8px;
  max-height: 340px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid #e6eee8;
  background: #fbfefc;
}

.chat-row {
  display: grid;
  gap: 2px;
  justify-items: start;
}

.chat-row.mine {
  justify-items: end;
}

.chat-bubble {
  margin: 0;
  max-width: min(460px, 90%);
  border-radius: 10px;
  padding: 8px 10px;
  background: #f3f7f4;
  color: #1f2937;
}

.chat-row.mine .chat-bubble {
  background: #e8f6eb;
  color: #1d5b36;
}

.chat-compose {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chat-compose input {
  flex: 1;
}

.post-list {
  column-width: 248px;
  column-gap: 12px;
}

.post-card {
  break-inside: avoid;
  margin-bottom: 12px;
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

.post-card .secondary-btn {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.2;
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

@media (max-width: 900px) {
  .community-shell {
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
