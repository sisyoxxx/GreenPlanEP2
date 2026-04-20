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
            <button v-for="topic in topicOptions" :key="topic" class="topic-option" :class="{ active: selectedTopic === topic }" @click="selectTopic(topic)">
              {{ topic }}
            </button>
          </div>
        </div>

        <button class="nav-item" :class="{ active: activeTab === 'my' }" @click="setTab('my')">我的帖子</button>
        <button class="nav-item" :class="{ active: activeTab === 'inbox' }" @click="setTab('inbox')">私信中心</button>

        <div class="sidebar-messages">
          <button class="message-item" :class="{ active: activeInbox === 'message' && activeTab === 'inbox' }" @click="openInbox('message')">
            <span>私信消息</span><span class="message-badge">{{ directMessages.length }}</span>
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
            <button class="secondary-btn" @click="resetDraft()">清空</button>
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
            <div v-if="activeInboxItems.length === 0" class="muted">暂时没有新消息</div>
            <article v-for="item in activeInboxItems" :key="item.id" class="inbox-item">
              <p>{{ item.text }}</p>
              <span class="muted">{{ item.time }}</span>
            </article>
          </section>

          <div v-if="activeTab === 'my' && filteredPosts.length === 0" class="page-lite muted">暂无内容</div>

          <section v-if="activeTab !== 'inbox' && filteredPosts.length > 0" class="post-list">
            <article v-for="post in filteredPosts" :key="post.id" class="post-card page-lite">
              <img v-if="post.imageUrl" class="post-image" :src="post.imageUrl" :alt="post.imageAlt || post.title" />
              <div class="post-head">
                <span class="tag">{{ post.topic }}</span>
                <span class="muted">{{ post.time }}</span>
              </div>
              <h3>{{ post.title }}</h3>
              <p>{{ post.content }}</p>
              <div class="row">
                <button class="secondary-btn" @click="like(post)">点赞 {{ post.likes }}</button>
                <button class="secondary-btn" :class="{ active: favoritePostIdSet.has(post.id) }" @click="toggleFavorite(post)">
                  {{ favoritePostIdSet.has(post.id) ? '已收藏' : '收藏' }}
                </button>
                <button class="secondary-btn" @click="prefillReply(post)">回复</button>
                <button class="secondary-btn" @click="prefillMessage(post)">私信</button>
              </div>
            </article>
          </section>
        </template>
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import { fetchAnnouncements, type AnnouncementItem } from '../api'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import { useBuyerFavoritesStore } from '../stores/useBuyerFavoritesStore'

type Tab = 'all' | 'my' | 'inbox' | 'compose'
type InboxType = 'message' | 'reply' | 'like'
type TopicCategory = '种植经验' | '求助问答' | '成果展示' | '官方活动'

type PostItem = {
  id: number
  topic: TopicCategory
  title: string
  content: string
  time: string
  likes: number
  mine: boolean
  author: string
  imageUrl?: string
  imageAlt?: string
}

type InboxItem = { id: number; text: string; time: string }

const topicOptions: TopicCategory[] = ['种植经验', '求助问答', '成果展示', '官方活动']
const buyerTopicOptions: TopicCategory[] = ['种植经验', '求助问答', '成果展示']

const activeTab = ref<Tab>('all')
const activeInbox = ref<InboxType>('message')
const selectedTopic = ref<TopicCategory | null>(null)
const isTopicDropdownOpen = ref(false)
const message = ref('')
const rightKeyword = ref('')
const latestAnnouncement = ref<AnnouncementItem | null>(null)

const authStore = useAuthStore()
const favoritesStore = useBuyerFavoritesStore()
const isAdmin = computed(() => authStore.role === 'ADMIN')
const isComposeMode = computed(() => activeTab.value === 'compose')
const draftTopicOptions = computed<TopicCategory[]>(() => (isAdmin.value ? ['官方活动'] : buyerTopicOptions))
const favoritePostIdSet = computed(() => favoritesStore.postIdSet)

const draft = reactive({ topic: '种植经验' as TopicCategory, title: '', content: '' })
const draftImageInput = ref<HTMLInputElement | null>(null)
const draftImageUrl = ref('')
const draftImageName = ref('')
const managedObjectUrls = new Set<string>()

const directMessages = ref<InboxItem[]>([
  { id: 1, text: '阳台番茄达人：你昨天问的补光灯型号我发你了。', time: '刚刚' },
  { id: 2, text: '厨房花园君：薄荷打顶后恢复很快，记得两天后追肥。', time: '今天' }
])
const replyNotifications = ref<InboxItem[]>([
  { id: 1, text: '阳台番茄达人 回复了你：先补光，再适当降温。', time: '刚刚' }
])
const likeNotifications = ref<InboxItem[]>([
  { id: 1, text: '你的帖子《第一次播种成功发芽了》新增 3 个赞。', time: '今天' }
])

const posts = ref<PostItem[]>([
  {
    id: 1,
    topic: '求助问答',
    title: '番茄幼苗徒长怎么办？',
    content: '室内育苗发现幼苗长得太高了，准备今晚补光和降温。',
    time: '今天',
    likes: 8,
    mine: false,
    author: '园艺新手A'
  },
  {
    id: 2,
    topic: '种植经验',
    title: '阳台香草一周打理清单',
    content: '薄荷、迷迭香、罗勒按这个节奏浇水和修剪更稳。',
    time: '昨天',
    likes: 14,
    mine: true,
    author: '我'
  },
  {
    id: 3,
    topic: '官方活动',
    title: '本周晒图活动开始征集',
    content: '本周社区主题是“阳台春播进度”，欢迎带图发帖参与。',
    time: '昨天',
    likes: 19,
    mine: false,
    author: '社区运营'
  }
])

const announcementTitle = computed(() => latestAnnouncement.value?.title || '本周主题：晒出你的阳台春播进度')
const announcementContent = computed(() => latestAnnouncement.value?.content || '带图发帖更容易获得互动。')

const filteredPosts = computed(() => {
  let list = [...posts.value]
  if (activeTab.value === 'my') list = list.filter((post) => post.mine)
  if (selectedTopic.value) list = list.filter((post) => post.topic === selectedTopic.value)

  const kw = rightKeyword.value.trim().toLowerCase()
  if (kw) list = list.filter((post) => [post.title, post.content, post.author, post.topic].some((text) => text.toLowerCase().includes(kw)))

  return list
})

const activeInboxItems = computed(() => {
  let list: InboxItem[] = activeInbox.value === 'message'
    ? directMessages.value
    : activeInbox.value === 'reply'
      ? replyNotifications.value
      : likeNotifications.value

  const kw = rightKeyword.value.trim().toLowerCase()
  if (!kw) return list
  return list.filter((item) => item.text.toLowerCase().includes(kw) || item.time.toLowerCase().includes(kw))
})

const inboxTitle = computed(() => activeInbox.value === 'message' ? '私信消息' : activeInbox.value === 'reply' ? '评论回复' : '点赞消息')
const inboxHint = computed(() => activeInbox.value === 'message' ? '这里汇总私信沟通记录。' : activeInbox.value === 'reply' ? '这里显示帖子回复。' : '这里显示点赞动态。')

onMounted(loadAnnouncement)

onBeforeUnmount(() => {
  for (const url of managedObjectUrls) URL.revokeObjectURL(url)
  managedObjectUrls.clear()
})

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
}

function triggerImageUpload() {
  draftImageInput.value?.click()
}

function handleDraftImageChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  removeDraftImage()
  const url = URL.createObjectURL(file)
  managedObjectUrls.add(url)
  draftImageUrl.value = url
  draftImageName.value = file.name
}

function removeDraftImage() {
  if (draftImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(draftImageUrl.value)
    managedObjectUrls.delete(draftImageUrl.value)
  }
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

  posts.value.unshift({
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

function like(post: PostItem) {
  post.likes += 1
}

function toggleFavorite(post: PostItem) {
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

function prefillReply(post: PostItem) {
  activeTab.value = 'inbox'
  activeInbox.value = 'reply'
  replyNotifications.value.unshift({ id: Date.now(), text: `你回复了帖子：${post.title}`, time: '刚刚' })
}

function prefillMessage(post: PostItem) {
  activeTab.value = 'inbox'
  activeInbox.value = 'message'
  directMessages.value.unshift({ id: Date.now(), text: `你向 ${post.author} 发送了私信`, time: '刚刚' })
}
</script>

<style scoped>
.community-shell { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 16px; height: calc(100vh - 108px); overflow: hidden; }
.community-sidebar { display: grid; gap: 10px; min-height: 0; overflow-y: auto; }
.community-main { display: grid; gap: 12px; min-height: 0; overflow-y: auto; }
.topic-nav-wrap, .sidebar-messages, .compose-panel, .announcement-bar, .inbox-panel, .post-card { display: grid; gap: 10px; }
.post-btn, .nav-item, .message-item, .topic-option { width: 100%; }
.topic-nav-trigger { display: flex; justify-content: space-between; align-items: center; }
.topic-arrow.open { transform: rotate(180deg); }
.topic-dropdown { display: grid; gap: 6px; }
.post-btn {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #1f7a41;
  background: #1f7a41;
  color: #ffffff;
  font-weight: 700;
}
.message-item, .nav-item, .topic-option {
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
.message-item:hover, .nav-item:hover, .topic-option:hover {
  transform: translateY(-1px);
  border-color: #cfe2d3;
  box-shadow: 0 6px 14px rgba(31, 122, 65, 0.08);
}
.message-item.active, .nav-item.active, .topic-option.active {
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
.community-search input, .compose-panel input, .compose-panel textarea, .compose-panel select { width: 100%; }
.upload-row, .row { display: flex; gap: 10px; flex-wrap: wrap; }
.hidden-input { display: none; }
.draft-image { width: 100%; max-height: 220px; object-fit: cover; border-radius: 12px; }
.post-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
.post-image { width: 100%; height: 160px; object-fit: cover; border-radius: 10px; }
.post-head { display: flex; justify-content: space-between; align-items: center; }
.tag { font-weight: 700; color: #1f7a41; }
.muted { color: #6b7280; }
.message { color: #1f7a41; margin: 0; }
.secondary-btn { background: #f2f6f2; border: 1px solid #e3e8e3; color: #1f2937; }
.secondary-btn.active { border-color: #9ad3aa; background: #edf9ef; color: #1f7a41; }
@media (max-width: 900px) {
  .community-shell { grid-template-columns: 1fr; height: auto; overflow: visible; }
  .community-sidebar, .community-main { overflow: visible; }
}
</style>
