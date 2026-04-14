<template>
  <AppLayout>
    <div class="community-shell">
      <!-- 左侧栏 -->
      <aside class="community-sidebar page-lite">
        <button class="post-btn" @click="showPostForm = !showPostForm">+ 发帖</button>

        <nav class="sidebar-nav">
          <button :class="['nav-item', { active: activeTab === 'all' }]" @click="activeTab = 'all'; showTopics = false">
            <span class="nav-icon">🏠</span>全部动态
          </button>

          <div class="nav-item-wrap">
            <button :class="['nav-item', { active: activeTab === 'topics' }]" @click="toggleTopics">
              <span class="nav-icon">💬</span>全部话题
              <span class="nav-arrow" :class="{ open: showTopics }">▾</span>
            </button>
            <Transition name="dropdown">
              <div v-if="showTopics" class="topic-dropdown">
                <button
                  v-for="t in topicCategories"
                  :key="t.key"
                  :class="['topic-item', { active: selectedTopic === t.key }]"
                  @click="selectTopic(t.key)"
                >
                  <span class="topic-dot" :style="{ background: t.color }"></span>
                  {{ t.label }}
                </button>
              </div>
            </Transition>
          </div>

          <button :class="['nav-item', { active: activeTab === 'messages' }]" @click="activeTab = 'messages'; showTopics = false">
            <span class="nav-icon">✉️</span>私信消息
            <span class="msg-badge">3</span>
          </button>
          <button :class="['nav-item', { active: activeTab === 'likes' }]" @click="activeTab = 'likes'; showTopics = false">
            <span class="nav-icon">👍</span>点赞收藏
          </button>
          <button :class="['nav-item', { active: activeTab === 'myPosts' }]" @click="activeTab = 'myPosts'; showTopics = false">
            <span class="nav-icon">📄</span>我的帖子
          </button>
        </nav>
      </aside>

      <!-- 右侧内容区 -->
      <main class="community-main">
        <!-- 公告条（滚动+交互） -->
        <div class="announcement-bar">
          <span class="announce-icon">📢</span>
          <div class="announce-scroll">
            <div class="announce-track" :style="{ transform: `translateY(-${announceIdx * 100}%)` }">
              <span v-for="(a, i) in announcements" :key="i" class="announce-line">{{ a.text }}</span>
            </div>
          </div>
          <span class="announce-date">{{ announcements[announceIdx].date }}</span>
          <span class="announce-counter">{{ announceIdx + 1 }}/{{ announcements.length }}</span>
          <div class="announce-controls">
            <button class="announce-btn" @click="prevAnnounce">‹</button>
            <button class="announce-btn" @click="nextAnnounce">›</button>
            <button class="announce-btn" @click="toggleAnnouncePause">{{ announcePaused ? '▶' : '⏸' }}</button>
          </div>
        </div>

        <!-- 发帖表单 -->
        <div v-if="showPostForm" class="post-form page-lite">
          <div class="post-form-layout">
            <div class="post-form-fields">
              <input v-model="newPost.title" type="text" placeholder="帖子标题" />
              <select v-model="newPost.topic">
                <option v-for="t in topicCategories" :key="t.key" :value="t.key">{{ t.label }}</option>
              </select>
              <textarea v-model="newPost.content" placeholder="分享你的种植经验..." rows="3"></textarea>
              <div class="form-actions">
                <button @click="submitPost">发布</button>
                <button class="secondary-btn" @click="showPostForm = false">取消</button>
              </div>
            </div>
            <div class="post-upload-area" @click="triggerPostUpload">
              <input ref="postFileInput" type="file" accept="image/*" hidden @change="onPostFileChange" />
              <span v-if="!newPost.imageName">📷 上传配图</span>
              <span v-else>🖼️ {{ newPost.imageName }}</span>
            </div>
          </div>
        </div>

        <!-- 私信面板 -->
        <div v-if="activeTab === 'messages'" class="panel-placeholder page-lite">
          <h3>私信消息</h3>
          <div class="msg-list">
            <div class="msg-item" v-for="msg in messages" :key="msg.id">
              <div class="msg-avatar">{{ msg.from.charAt(0) }}</div>
              <div class="msg-body">
                <div class="msg-meta"><strong>{{ msg.from }}</strong><span>{{ msg.time }}</span></div>
                <p>{{ msg.text }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 点赞收藏面板 -->
        <div v-else-if="activeTab === 'likes'" class="panel-placeholder page-lite">
          <h3>点赞收藏</h3>
          <p class="empty-hint">你收藏和点赞过的帖子会显示在这里</p>
        </div>

        <!-- 帖子列表 -->
        <template v-else>
          <div class="community-header page-lite">
            <h2>{{ activeTab === 'myPosts' ? '我的帖子' : activeTab === 'topics' ? topicLabel : '社区动态' }}</h2>
            <input v-model="searchKeyword" type="text" placeholder="搜索帖子..." class="search-input" />
          </div>

          <div v-if="filteredPosts.length === 0" class="empty-state page-lite">
            <p class="empty-hint">暂无帖子</p>
          </div>
          <div v-else class="post-grid">
            <article class="post-card page-lite" v-for="post in filteredPosts" :key="post.id">
              <div v-if="post.hasImage" class="post-image-placeholder">
                <span>{{ post.imageLabel || '📷 图片' }}</span>
              </div>
              <div class="post-card-body">
                <div class="post-card-top">
                  <div class="post-author">
                    <div class="author-avatar">{{ post.author.charAt(0) }}</div>
                    <div>
                      <strong>{{ post.author }}</strong>
                      <span class="post-date">{{ post.date }}</span>
                    </div>
                  </div>
                  <span class="post-topic-tag" :style="{ background: topicColorMap[post.topic] }">{{ topicLabelMap[post.topic] }}</span>
                </div>
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-content">{{ post.content }}</p>
                <div class="post-actions">
                  <button class="action-btn" @click="toggleLike(post)">{{ post.liked ? '👍' : '👍🏻' }} {{ post.likes }}</button>
                  <button class="action-btn">💬 {{ post.comments }}</button>
                  <button class="action-btn" @click="post.favorited = !post.favorited">{{ post.favorited ? '⭐' : '☆' }} 收藏</button>
                </div>
              </div>
            </article>
          </div>
        </template>
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, onUnmounted } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'

type Tab = 'all' | 'topics' | 'messages' | 'likes' | 'myPosts'

const announcements = [
  { text: '社区公约已更新，请文明交流、友善互助，共建绿色社区。', date: '04-12' },
  { text: '春季种子交换活动火热进行中，快来分享你的多余种子吧！', date: '04-10' },
  { text: '新增"晒图分享"话题分类，上传你的种植美图赢积分奖励。', date: '04-08' },
  { text: '本周六晚8点社区直播：家庭阳台番茄种植全流程，欢迎预约。', date: '04-06' },
  { text: '社区积分商城即将上线，敬请期待！参与互动可提前积累积分。', date: '04-03' },
  { text: '园艺工具团购第二期开启，满50人成团享8折优惠。', date: '04-01' },
  { text: '四月病虫害高发期，社区已整理防治手册，点击话题查看。', date: '03-30' },
  { text: '恭喜用户"阳台农夫C"获得本月最佳晒图奖，奖励已发放。', date: '03-28' },
  { text: '社区新规：每日发帖上限调整为10条，鼓励高质量内容。', date: '03-25' },
  { text: '清明假期快乐！分享你的假期种植计划，参与话题赢种子礼包。', date: '03-22' }
]
const announceIdx = ref(0)
const announcePaused = ref(false)
let announceTimer: ReturnType<typeof setInterval> | null = null

function startAnnounceTimer() {
  announceTimer = setInterval(() => {
    if (!announcePaused.value) {
      announceIdx.value = (announceIdx.value + 1) % announcements.length
    }
  }, 3500)
}

function prevAnnounce() {
  announceIdx.value = (announceIdx.value - 1 + announcements.length) % announcements.length
}

function nextAnnounce() {
  announceIdx.value = (announceIdx.value + 1) % announcements.length
}

function toggleAnnouncePause() {
  announcePaused.value = !announcePaused.value
}

onMounted(() => { startAnnounceTimer() })
onUnmounted(() => { if (announceTimer) clearInterval(announceTimer) })

const activeTab = ref<Tab>('all')
const showTopics = ref(false)
const selectedTopic = ref('all')
const searchKeyword = ref('')
const showPostForm = ref(false)

const topicCategories = [
  { key: 'all', label: '全部话题', color: '#80ab64' },
  { key: 'experience', label: '种植经验', color: '#34d399' },
  { key: 'question', label: '问题求助', color: '#f59e0b' },
  { key: 'show', label: '晒图分享', color: '#60a5fa' },
  { key: 'activity', label: '官方活动', color: '#f472b6' },
  { key: 'trade', label: '种子交换', color: '#a78bfa' }
]

const topicLabelMap: Record<string, string> = {}
const topicColorMap: Record<string, string> = {}
topicCategories.forEach(t => { topicLabelMap[t.key] = t.label; topicColorMap[t.key] = t.color })
const topicLabel = computed(() => topicLabelMap[selectedTopic.value] || '全部话题')

function toggleTopics() {
  activeTab.value = 'topics'
  showTopics.value = !showTopics.value
}

function selectTopic(key: string) {
  selectedTopic.value = key
  activeTab.value = 'topics'
}

const newPost = reactive({ title: '', content: '', topic: 'experience', imageName: '' })
const postFileInput = ref<HTMLInputElement | null>(null)

function triggerPostUpload() { postFileInput.value?.click() }
function onPostFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) newPost.imageName = file.name
}

const messages = ref([
  { id: 1, from: '园艺达人A', text: '你的番茄种得真好，能分享下经验吗？', time: '10分钟前' },
  { id: 2, from: '绿植玩家B', text: '我有多余的薄荷种子，要交换吗？', time: '1小时前' },
  { id: 3, from: '系统通知', text: '你的帖子获得了10个赞！', time: '昨天' }
])

const posts = ref([
  { id: 1, title: '如何提高番茄发芽率？', content: '建议提前浸种6小时，播后保湿，温度保持20-25°C。亲测有效，发芽率从60%提升到90%。', author: '园艺达人A', date: '2026-04-09', topic: 'experience', likes: 24, comments: 8, liked: false, favorited: false, hasImage: false, imageLabel: '' },
  { id: 2, title: '阳台种植防虫经验', content: '优先使用黄板+物理隔离，减少药剂使用。薄荷和罗勒混种也能驱虫。', author: '绿植玩家B', date: '2026-04-10', topic: 'experience', likes: 18, comments: 5, liked: false, favorited: false, hasImage: true, imageLabel: '🪴 防虫对比图' },
  { id: 3, title: '我的草莓终于红了！', content: '从播种到结果用了三个月，虽然个头不大但超级甜，阳台种植的成就感太棒了。', author: '阳台农夫C', date: '2026-04-11', topic: 'show', likes: 42, comments: 12, liked: true, favorited: false, hasImage: true, imageLabel: '🍓 草莓成熟照' },
  { id: 4, title: '叶子发黄是什么原因？', content: '我的薄荷最近叶子从底部开始发黄，浇水频率正常，是缺肥还是光照不足？', author: '新手小白D', date: '2026-04-11', topic: 'question', likes: 6, comments: 15, liked: false, favorited: false, hasImage: true, imageLabel: '🍃 叶片特写' },
  { id: 5, title: '春季种子交换活动', content: '官方组织的春季种子交换开始啦！把你多余的种子分享给其他花友吧。', author: '官方运营', date: '2026-04-08', topic: 'activity', likes: 56, comments: 20, liked: false, favorited: true, hasImage: false, imageLabel: '' },
  { id: 6, title: '多肉换香草，坐标华东', content: '有一批多肉叶插苗，想换罗勒或迷迭香种子，有意私信。', author: '多肉爱好者E', date: '2026-04-10', topic: 'trade', likes: 9, comments: 4, liked: false, favorited: false, hasImage: true, imageLabel: '🌵 多肉合集' }
])

let nextId = 7
function submitPost() {
  if (!newPost.title || !newPost.content) return
  posts.value.unshift({
    id: nextId++, title: newPost.title, content: newPost.content,
    author: '我', date: new Date().toISOString().slice(0, 10),
    topic: newPost.topic, likes: 0, comments: 0, liked: false, favorited: false,
    hasImage: !!newPost.imageName, imageLabel: newPost.imageName ? `🖼️ ${newPost.imageName}` : ''
  })
  newPost.title = ''; newPost.content = ''; newPost.topic = 'experience'; newPost.imageName = ''
  showPostForm.value = false
}

function toggleLike(post: any) {
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1
}

const filteredPosts = computed(() => {
  let list = posts.value
  if (activeTab.value === 'myPosts') list = list.filter(p => p.author === '我')
  if (activeTab.value === 'topics' && selectedTopic.value !== 'all') {
    list = list.filter(p => p.topic === selectedTopic.value)
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(p => p.title.toLowerCase().includes(kw) || p.content.toLowerCase().includes(kw))
  }
  return list
})
</script>

<style scoped>
.community-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  max-width: 100%;
  width: calc(100vw - 24px);
  margin-left: calc((100% - (100vw - 24px)) / 2);
  padding: 0 12px;
}

.community-sidebar {
  position: sticky;
  top: 16px;
  display: grid;
  gap: 12px;
  align-content: start;
  height: calc(100vh - 100px);
  overflow-y: auto;
}

.post-btn {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: none;
  background: #80ab64;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.post-btn:hover { background: #6e9a55; }

.sidebar-nav { display: grid; gap: 2px; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.nav-item:hover { background: #f0f7f1; }
.nav-item.active { background: #e6f4ea; color: #1f7a41; font-weight: 600; }

.nav-icon { font-size: 16px; width: 22px; text-align: center; }

.nav-arrow {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.2s;
}

.nav-arrow.open { transform: rotate(180deg); }

.msg-badge {
  margin-left: auto;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 50%;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-item-wrap { display: grid; gap: 0; }

.topic-dropdown {
  padding: 4px 0 4px 30px;
  display: grid;
  gap: 2px;
  overflow: hidden;
}

.dropdown-enter-active { transition: all 0.25s ease; }
.dropdown-leave-active { transition: all 0.2s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; max-height: 0; }
.dropdown-enter-to, .dropdown-leave-from { opacity: 1; max-height: 300px; }

.topic-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.topic-item:hover { background: #f0f7f1; color: #374151; }
.topic-item.active { color: #1f7a41; font-weight: 600; }

.topic-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.community-main { display: grid; gap: 12px; padding: 0 80px; }

.announcement-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f0f7f1;
  border: 1px solid #d7e8d9;
  border-radius: 10px;
  font-size: 13px;
  color: #374151;
  overflow: hidden;
}

.announce-icon { font-size: 16px; flex-shrink: 0; }

.announce-scroll {
  flex: 1;
  height: 20px;
  overflow: hidden;
  position: relative;
}

.announce-track {
  transition: transform 0.5s ease;
}

.announce-line {
  display: block;
  height: 20px;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.announce-date {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}

.announce-counter {
  font-size: 11px;
  color: #9ca3af;
  flex-shrink: 0;
  min-width: 36px;
  text-align: center;
}

.announce-controls {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.announce-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid #d7e8d9;
  background: #fff;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
}

.announce-btn:hover { background: #e6f4ea; color: #1f7a41; }

.post-form { padding: 20px 24px; }

.post-form-layout {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 16px;
  align-items: start;
}

.post-form-fields { display: grid; gap: 10px; }

.post-upload-area {
  min-height: 160px;
  border: 2px dashed #d3d7de;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #80ab64;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.post-upload-area:hover { border-color: #80ab64; }

.post-form textarea { resize: vertical; }
.form-actions { display: flex; gap: 8px; }

.community-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.community-header h2 { margin: 0; font-size: 20px; color: #1f2937; }

.search-input {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #d3d7de;
  font-size: 13px;
  width: 220px;
}

.post-grid {
  columns: 2;
  column-gap: 14px;
}

.post-card {
  display: grid;
  gap: 0;
  padding: 0;
  overflow: hidden;
  break-inside: avoid;
  margin-bottom: 14px;
}

.post-image-placeholder {
  width: 100%;
  min-height: 140px;
  background: linear-gradient(135deg, #e6f4ea, #f0f7f1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #80ab64;
  font-size: 15px;
  font-weight: 600;
}

.post-card-body { padding: 14px; display: grid; gap: 10px; }

.post-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e6f4ea;
  color: #1f7a41;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.post-author strong { font-size: 14px; color: #1f2937; }
.post-date { display: block; font-size: 12px; color: #9ca3af; }

.post-topic-tag {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.post-title { margin: 0; font-size: 16px; color: #1f2937; }
.post-content { margin: 0; font-size: 14px; color: #4b5563; line-height: 1.7; }

.post-actions { display: flex; gap: 12px; }

.action-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
}

.action-btn:hover { background: #f0f7f1; color: #1f7a41; }

.panel-placeholder { display: grid; gap: 12px; }
.panel-placeholder h3 { margin: 0; font-size: 18px; }

.msg-list { display: grid; gap: 10px; }

.msg-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #f8fcf8;
  border-radius: 10px;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e6f4ea;
  color: #1f7a41;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.msg-body { flex: 1; }
.msg-meta { display: flex; justify-content: space-between; font-size: 13px; }
.msg-meta span { color: #9ca3af; font-size: 12px; }
.msg-body p { margin: 4px 0 0; font-size: 14px; color: #4b5563; }

.empty-state { text-align: center; padding: 40px 16px; }
.empty-hint { color: #9ca3af; margin: 0; }

@media (max-width: 760px) {
  .community-shell { grid-template-columns: 1fr; }
  .community-sidebar { position: static; height: auto; }
  .search-input { width: 100%; }
  .community-main { padding: 0; }
  .post-form-layout { grid-template-columns: 1fr; }
}
</style>
