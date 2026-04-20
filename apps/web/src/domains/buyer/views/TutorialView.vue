<template>
  <AppLayout>
    <div class="tutorial-shell">
      <aside class="tutorial-sidebar page-lite">
        <h3 class="sidebar-title">教程分类</h3>
        <button
          v-for="cat in categories"
          :key="cat.key"
          :class="['cat-btn', { active: activeCategory === cat.key }]"
          @click="activeCategory = cat.key"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          {{ cat.label }}
        </button>
      </aside>

      <main class="tutorial-main">
        <div class="hero-row">
          <div class="hero-main">
            <div class="carousel-section page-lite">
              <Swiper
                :modules="[Autoplay, Pagination]"
                :autoplay="{ delay: 4000, disableOnInteraction: false }"
                :pagination="{ clickable: true }"
                :loop="hotTutorials.length > 1"
                class="tutorial-swiper"
              >
                <SwiperSlide v-for="item in hotTutorials" :key="item.id">
                  <div class="slide-card" :style="{ background: item.backgroundStyle }">
                    <div class="slide-tag">{{ item.tag }}</div>
                    <h2 class="slide-title">{{ item.title }}</h2>
                    <p class="slide-desc">{{ item.description }}</p>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>

            <div class="search-bar page-lite">
              <input v-model="searchKeyword" type="text" placeholder="搜索教程标题或关键词..." class="search-input" />
            </div>

            <div v-if="status === 'loading'" class="empty-state page-lite">
              <p class="empty-hint">教程加载中...</p>
            </div>
            <div v-else-if="status === 'error'" class="empty-state page-lite">
              <p class="empty-hint">{{ error }}</p>
            </div>
            <div v-else-if="filteredTutorials.length === 0" class="empty-state page-lite">
              <p class="empty-hint">没有找到相关教程</p>
            </div>
            <div v-else class="tutorial-grid">
              <article class="tutorial-card page-lite" v-for="item in filteredTutorials" :key="item.id" @click="openTutorialDetail(item.id)">
                <div v-if="item.mediaUrl" class="card-media">
                  <img v-if="item.mediaType === 'IMAGE'" :src="item.mediaUrl" :alt="item.title" />
                  <video v-else-if="item.mediaType === 'VIDEO'" :src="item.mediaUrl" muted playsinline preload="metadata" />
                  <span class="media-badge">{{ item.mediaType === 'VIDEO' ? '视频' : '图片' }}</span>
                </div>
                <div class="card-thumb" :style="{ background: item.backgroundStyle }">{{ item.tag }}</div>
                <div class="card-body">
                  <div class="card-title-row">
                    <h3 class="card-title">{{ item.title }}</h3>
                    <button class="fav-btn" :class="{ faved: favoriteIdSet.has(item.id) }" @click.stop="toggleFavorite(item.id)">
                      {{ favoriteIdSet.has(item.id) ? '❤' : '♡' }}
                    </button>
                  </div>
                  <p class="card-desc">{{ item.description }}</p>
                  <div class="card-meta">
                    <span class="card-difficulty">{{ item.difficulty || '精选' }}</span>
                    <span class="card-duration">{{ formatDuration(item.durationMinutes) }}</span>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <aside class="advice-panel page-lite">
            <section class="weather-block">
              <div class="panel-kicker">今日天气</div>
              <div class="weather-info">
                <span class="weather-icon">☀</span>
                <div>
                  <strong>晴转多云 22°C ~ 28°C</strong>
                  <span class="weather-meta">湿度 65% · 微风 · 适合阳台养护</span>
                </div>
              </div>
            </section>

            <section class="suggestion-block">
              <div class="panel-kicker">种植建议</div>
              <div class="suggestion-list">
                <div class="suggestion-item">
                  <span class="suggestion-icon">🌱</span>
                  <div>
                    <strong>适合播种</strong>
                    <p>生菜、罗勒和向日葵都适合当前温度段。</p>
                  </div>
                </div>
                <div class="suggestion-item">
                  <span class="suggestion-icon">💧</span>
                  <div>
                    <strong>浇水节奏</strong>
                    <p>建议傍晚少量多次浇水，避免中午高温蒸发过快。</p>
                  </div>
                </div>
                <div class="suggestion-item">
                  <span class="suggestion-icon">📝</span>
                  <div>
                    <strong>本周任务</strong>
                    <p>检查育苗盆通风情况，及时间苗，避免幼苗徒长。</p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>

    <FloatingBall icon="🤖" color="#80ab64" :popup-width="380" :popup-height="500">
      <div class="chat-window">
        <div class="chat-header">
          <span class="chat-title">智能助手</span>
        </div>
        <div ref="chatBodyRef" class="chat-body">
          <div v-if="chatMessages.length === 0" class="chat-welcome">
            <div class="chat-bot-avatar">🤖</div>
            <p>你好，我是种植智能助手。你可以在这里提问，我会给出简洁可执行的建议。</p>
          </div>

          <div v-else class="chat-thread">
            <div v-for="msg in chatMessages" :key="msg.id" class="chat-row" :class="msg.role">
              <div class="chat-bubble" :class="msg.role">
                {{ msg.content }}
              </div>
            </div>
          </div>
        </div>
        <div class="chat-footer">
          <div class="chat-tools">
            <button class="chat-tool-btn" title="上传图片">📷</button>
            <button class="chat-tool-btn" title="语音输入">🎙</button>
            <button class="chat-tool-btn" title="历史记录">🕘</button>
          </div>
          <div class="chat-input-row">
            <input
              v-model.trim="chatInput"
              type="text"
              class="chat-input"
              placeholder="输入你的问题..."
              :disabled="chatSending"
              @keydown.enter.prevent="sendChat"
            />
            <button class="chat-send-btn" :disabled="chatSending || !chatInput" @click="sendChat">
              {{ chatSending ? '发送中...' : '发送' }}
            </button>
          </div>
        </div>
      </div>
    </FloatingBall>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import FloatingBall from '../../../shared/components/FloatingBall.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import { aiChat, fetchTutorials, type AiChatMessage, type TutorialItem } from '../api'
import { useBuyerFavoritesStore } from '../stores/useBuyerFavoritesStore'
import 'swiper/css'
import 'swiper/css/pagination'

const categories = [
  { key: 'all', icon: '📘', label: '全部教程' },
  { key: 'seed', icon: '🌱', label: '播种入门' },
  { key: 'care', icon: '💧', label: '日常养护' },
  { key: 'pest', icon: '🛡', label: '病虫防治' },
  { key: 'advanced', icon: '🧠', label: '进阶技巧' },
  { key: 'seasonal', icon: '🗓', label: '四季指南' },
  { key: 'tool', icon: '🧰', label: '工具推荐' },
  { key: 'favorite', icon: '❤', label: '我的收藏' }
]

const status = ref<'idle' | 'loading' | 'ok' | 'error'>('idle')
const error = ref('')
const activeCategory = ref('all')
const searchKeyword = ref('')
const hotTutorials = ref<TutorialItem[]>([])
const tutorials = ref<TutorialItem[]>([])
const favoritesStore = useBuyerFavoritesStore()
const favoriteIdSet = computed(() => favoritesStore.tutorialIdSet)
const router = useRouter()

type ChatRole = 'user' | 'assistant'
type ChatMsg = { id: number; role: ChatRole; content: string }

const chatInput = ref('')
const chatSending = ref(false)
const chatMessages = ref<ChatMsg[]>([])
const chatBodyRef = ref<HTMLElement | null>(null)

function formatDuration(durationMinutes: number | null) {
  return durationMinutes ? `${durationMinutes} 分钟` : '图文教程'
}

function toggleFavorite(id: number) {
  favoritesStore.toggleTutorial(id)
}

function openTutorialDetail(id: number) {
  router.push(`/tutorial/${id}`)
}

async function loadTutorials() {
  status.value = 'loading'
  error.value = ''
  try {
    const res = await fetchTutorials()
    hotTutorials.value = res.hotTutorials
    tutorials.value = res.tutorials
    favoritesStore.seedTutorialFavoritesIfEmpty(
      res.tutorials
        .filter((item) => item.favoriteDefault)
        .map((item) => item.id)
    )
    status.value = 'ok'
  } catch (e: any) {
    status.value = 'error'
    error.value = e?.response?.data?.message || '加载教程失败'
  }
}

const filteredTutorials = computed(() => {
  let list = tutorials.value
  if (activeCategory.value === 'favorite') {
    list = list.filter((item) => favoriteIdSet.value.has(item.id))
  } else if (activeCategory.value !== 'all') {
    list = list.filter((item) => item.categoryCode === activeCategory.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter((item) =>
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.tag.toLowerCase().includes(keyword)
    )
  }

  return list
})

onMounted(() => {
  loadTutorials()
})

async function sendChat() {
  const question = chatInput.value.trim()
  if (!question || chatSending.value) return

  const idBase = Date.now()
  chatMessages.value.push({ id: idBase, role: 'user', content: question })
  chatInput.value = ''
  await nextTick()
  scrollChatToBottom()

  chatSending.value = true
  try {
    const payload: AiChatMessage[] = [
      {
        role: 'system',
        content: '你是家庭种植助手，请给出简洁且可执行的步骤建议。'
      },
      ...chatMessages.value.map((m) => ({ role: m.role, content: m.content } as AiChatMessage))
    ]
    const res = await aiChat(payload)
    chatMessages.value.push({ id: idBase + 1, role: 'assistant', content: res.content })
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'AI 请求失败'
    chatMessages.value.push({ id: idBase + 1, role: 'assistant', content: `提示：${msg}` })
  } finally {
    chatSending.value = false
    await nextTick()
    scrollChatToBottom()
  }
}

function scrollChatToBottom() {
  const el = chatBodyRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}
</script>

<style scoped>
.tutorial-shell {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 14px;
  align-items: stretch;
  max-width: 100%;
  width: calc(100vw - 24px);
  margin-left: calc((100% - (100vw - 24px)) / 2);
  padding: 0 12px;
  height: calc(100vh - 108px);
  overflow: hidden;
}

.tutorial-sidebar {
  display: grid;
  align-content: start;
  gap: 4px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.sidebar-title {
  margin: 0 0 8px;
  font-size: 13px;
  color: #9ca3af;
  letter-spacing: 0.5px;
  padding: 0 10px;
}

.cat-btn {
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

.cat-btn:hover { background: #f0f7f1; }
.cat-btn.active { background: #e6f4ea; color: #1f7a41; font-weight: 600; }
.cat-icon { font-size: 16px; width: 22px; text-align: center; }

.tutorial-main {
  display: grid;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.tutorial-sidebar::-webkit-scrollbar,
.tutorial-main::-webkit-scrollbar {
  width: 8px;
}

.tutorial-sidebar::-webkit-scrollbar-thumb,
.tutorial-main::-webkit-scrollbar-thumb {
  background: #d2e3d6;
  border-radius: 999px;
}

.hero-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 260px);
  gap: 14px;
  align-items: start;
}

.hero-main {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.carousel-section {
  padding: 12px;
  overflow: hidden;
}

.tutorial-swiper {
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
}

.slide-card {
  padding: 32px 28px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  color: #fff;
}

.slide-tag {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.85;
  background: rgba(255, 255, 255, 0.2);
  width: fit-content;
  padding: 3px 10px;
  border-radius: 999px;
}

.slide-title { margin: 0; font-size: 26px; font-weight: 700; }
.slide-desc { margin: 0; font-size: 15px; line-height: 1.6; opacity: 0.92; max-width: 480px; }

.advice-panel {
  display: grid;
  gap: 16px;
  align-content: start;
  background: linear-gradient(180deg, #fbfefb, #f5fbf6);
  width: 100%;
  max-width: 260px;
  justify-self: end;
}

.panel-kicker {
  font-size: 12px;
  font-weight: 700;
  color: #1f7a41;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.weather-block,
.suggestion-block {
  display: grid;
  gap: 10px;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  background: #f8fcf8;
  border: 1px solid #e4efe6;
}

.weather-icon {
  font-size: 24px;
}

.weather-info strong {
  display: block;
  color: #1f2937;
}

.weather-meta {
  display: block;
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
}

.suggestion-list {
  display: grid;
  gap: 10px;
}

.suggestion-item {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 12px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e4efe6;
}

.suggestion-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #edf9ef;
  color: #1f7a41;
}

.suggestion-item strong {
  color: #1f2937;
}

.suggestion-item p {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.search-bar {
  display: flex;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #d3d7de;
  background: #f8fcf8;
  font-size: 14px;
}

.tutorial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.tutorial-card {
  display: grid;
  gap: 0;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.tutorial-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); }

.card-media {
  position: relative;
  height: 142px;
  overflow: hidden;
}

.card-media img,
.card-media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.media-badge {
  position: absolute;
  left: 10px;
  top: 10px;
  border-radius: 999px;
  padding: 2px 8px;
  background: rgba(17, 24, 39, 0.65);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.card-thumb {
  padding: 20px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #1f7a41;
}

.card-body { padding: 0 16px 16px; display: grid; gap: 8px; }
.card-title { margin: 0; font-size: 16px; color: #1f2937; }

.card-title-row { display: flex; justify-content: space-between; align-items: start; gap: 6px; }

.fav-btn {
  background: transparent;
  border: none;
  padding: 0;
  font-size: 18px;
  cursor: pointer;
  flex-shrink: 0;
  line-height: 1;
}

.fav-btn:hover { transform: scale(1.2); }
.card-desc { margin: 0; font-size: 13px; color: #6b7280; line-height: 1.6; }

.card-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
}

.card-difficulty {
  padding: 2px 8px;
  border-radius: 999px;
  background: #e6f4ea;
  color: #1f7a41;
  font-weight: 600;
}

.card-duration { color: #9ca3af; line-height: 1.8; }

.empty-state { text-align: center; padding: 40px 16px; }
.empty-hint { color: #9ca3af; margin: 0; }

.chat-window { display: flex; flex-direction: column; height: 100%; }

.chat-header {
  padding: 14px 16px;
  background: #80ab64;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  flex-shrink: 0;
}

.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8fcf8;
}

.chat-welcome {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.chat-bot-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e6f4ea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.chat-welcome p {
  margin: 0;
  background: #fff;
  padding: 10px 14px;
  border-radius: 0 12px 12px 12px;
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.chat-thread {
  display: grid;
  gap: 10px;
}

.chat-row {
  display: flex;
}

.chat-row.user {
  justify-content: flex-end;
}

.chat-row.assistant {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 78%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.chat-bubble.assistant {
  background: #fff;
  color: #374151;
  border-radius: 0 12px 12px 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.chat-bubble.user {
  background: #1f7a41;
  color: #fff;
  border-radius: 12px 0 12px 12px;
  box-shadow: 0 6px 16px rgba(31, 122, 65, 0.12);
}

.chat-footer {
  padding: 10px 12px;
  border-top: 1px solid #f0f0f0;
  display: grid;
  gap: 8px;
  flex-shrink: 0;
  background: #fff;
}

.chat-tools { display: flex; gap: 6px; }

.chat-tool-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.chat-tool-btn:hover { background: #e6f4ea; }

.chat-input-row { display: flex; gap: 8px; }

.chat-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d3d7de;
  font-size: 13px;
}

.chat-send-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #1f7a41;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

.chat-send-btn:hover { background: #276749; }

@media (max-width: 1100px) {
  .tutorial-shell {
    grid-template-columns: 190px minmax(0, 1fr);
  }

  .hero-row {
    grid-template-columns: 1fr;
  }

  .advice-panel {
    max-width: none;
    justify-self: stretch;
  }

  .tutorial-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 905px) {
  .tutorial-shell {
    grid-template-columns: 1fr;
    width: 100%;
    margin-left: 0;
    height: auto;
    overflow: visible;
  }

  .tutorial-sidebar {
    overflow: visible;
    padding-right: 0;
  }

  .tutorial-main {
    overflow: visible;
    padding-right: 0;
  }
}

@media (max-width: 680px) {
  .carousel-section {
    padding: 10px;
  }

  .slide-card {
    min-height: 180px;
    padding: 24px 18px;
  }

  .slide-title {
    font-size: 22px;
  }

  .tutorial-grid {
    grid-template-columns: 1fr;
  }
}
</style>
