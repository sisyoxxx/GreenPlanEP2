<template>
  <aside class="home-sidebar right-sidebar page-lite">
    <section class="sidebar-section smart-header-card">
      <div>
        <h3 class="sidebar-title">智能模块</h3>
        <p class="sidebar-item-desc">登录前展示定位与内容推荐，登录后展示个人种植日记。</p>
      </div>
      <button v-if="!auth.isLoggedIn" @click="requestLocation">刷新定位</button>
    </section>

    <section class="sidebar-section status-card">
      <h4 class="section-subtitle">定位推荐</h4>
      <div class="sidebar-item-title">{{ locationTitle }}</div>
      <div class="sidebar-item-desc">{{ locationDescription }}</div>
      <div v-if="matchedRegion" class="region-chip">推荐区域：{{ matchedRegion }}</div>
      <div class="recommend-list">
        <article class="recommend-card" v-for="item in regionalRecommendations" :key="item.id">
          <div>
            <div class="recommend-badge">{{ item.suitableRegion || '通用推荐' }}</div>
            <div class="sidebar-item-title">{{ item.name }}</div>
            <div class="sidebar-item-desc">{{ item.description }}</div>
          </div>
        </article>
      </div>
    </section>

    <template v-if="!auth.isLoggedIn">
      <section class="sidebar-section ai-card">
        <div>
          <h4 class="section-subtitle">AI 对话小助手</h4>
          <div class="sidebar-item-desc">当前为免费模型占位版，后续可切换到第三方 API。</div>
        </div>
        <div class="chat-window">
          <div class="chat-bubble assistant">你好，我可以根据地区和季节给你推荐适合种植的商品。</div>
          <div v-for="item in chatMessages" :key="item.id" class="chat-message" :class="item.role === 'user' ? 'is-user' : 'is-assistant'">
            <div class="chat-bubble">{{ item.text }}</div>
          </div>
        </div>
        <div class="chat-input-row">
          <input v-model="chatInput" type="text" placeholder="例如：适合华南阳台种植什么？" @keyup.enter="sendChat" />
          <button @click="sendChat">发送</button>
        </div>
      </section>

      <section class="sidebar-section">
        <h4 class="section-subtitle">内容推荐</h4>
        <article class="notice-card" v-for="item in contentRecommendations" :key="item.title">
          <div class="sidebar-item-title">{{ item.title }}</div>
          <div class="sidebar-item-desc">{{ item.desc }}</div>
        </article>
      </section>
    </template>

    <template v-else>
      <section class="sidebar-section">
        <h4 class="section-subtitle">个人种植日记</h4>
        <article class="notice-card diary-card" v-for="item in diaryEntries" :key="item.id">
          <div class="sidebar-item-title">{{ item.title }}</div>
          <div class="diary-meta">{{ item.plantName }} · {{ item.date }}</div>
          <div class="sidebar-item-desc">{{ item.note }}</div>
        </article>
      </section>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import { fetchProducts, type Product } from '../api'

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  text: string
}

const auth = useAuthStore()
const chatInput = ref('')
const products = ref<Product[]>([])
const matchedRegion = ref('')
const locationStatus = ref<'idle' | 'loading' | 'success' | 'denied' | 'error' | 'unsupported'>('idle')
const locationCoords = ref<{ latitude: number; longitude: number } | null>(null)
const chatMessages = ref<ChatMessage[]>([])

const diaryEntries = [
  { id: 1, title: '番茄育苗第7天', plantName: '番茄', date: '2026-04-10', note: '已出芽，保持通风和散射光。' },
  { id: 2, title: '月季播种第3天', plantName: '月季', date: '2026-04-11', note: '土壤湿润度正常，等待发芽。' },
  { id: 3, title: '罗勒修剪记录', plantName: '罗勒', date: '2026-04-12', note: '顶部摘心后侧芽开始生长，适合继续控水。' }
]

const contentRecommendations = [
  { title: '春播家庭指南', desc: '结合地区温度与空间条件，挑选更容易成活的品类。' },
  { title: '阳台种植避坑清单', desc: '适合新手快速了解光照、浇水和通风的关键细节。' },
  { title: '小空间种植灵感', desc: '适合阳台、窗台和室内角落的内容推荐。' }
]

const locationTitle = computed(() => {
  if (locationStatus.value === 'loading') return '正在获取定位...'
  if (locationStatus.value === 'success') return locationCoords.value ? `已定位到附近区域（${locationCoords.value.latitude.toFixed(2)}, ${locationCoords.value.longitude.toFixed(2)}）` : '已完成定位'
  if (locationStatus.value === 'denied') return '定位权限已拒绝'
  if (locationStatus.value === 'unsupported') return '当前浏览器不支持定位'
  if (locationStatus.value === 'error') return '定位失败'
  return '等待定位授权'
})

const locationDescription = computed(() => {
  if (locationStatus.value === 'success') return matchedRegion.value ? `已按 ${matchedRegion.value} 优先推荐适合你的商品。` : '已获取定位，但暂未匹配到明确地区，将展示默认推荐。'
  if (locationStatus.value === 'denied') return '你可以稍后重新授权定位，也可以先浏览默认推荐。'
  if (locationStatus.value === 'unsupported') return '请更换支持定位的浏览器或设备。'
  if (locationStatus.value === 'error') return '定位不可用，当前展示默认推荐。'
  if (locationStatus.value === 'loading') return '授权后将根据地理位置推荐商品。'
  return '登录前会主动请求定位，并根据区域展示商品推荐。'
})

const regionalRecommendations = computed(() => {
  if (!products.value.length) return []
  if (!matchedRegion.value) return products.value.slice(0, 3)

  const matched = products.value.filter((item) => item.suitableRegion?.includes(matchedRegion.value))
  return (matched.length ? matched : products.value).slice(0, 3)
})

onMounted(async () => {
  products.value = await fetchProducts()
  if (!auth.isLoggedIn) requestLocation()
})

function requestLocation() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    locationStatus.value = 'unsupported'
    return
  }

  locationStatus.value = 'loading'
  navigator.geolocation.getCurrentPosition(
    (position) => {
      locationCoords.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
      matchedRegion.value = mapCoordsToRegion(position.coords.latitude, position.coords.longitude)
      locationStatus.value = 'success'
    },
    (error) => {
      locationStatus.value = error.code === error.PERMISSION_DENIED ? 'denied' : 'error'
      matchedRegion.value = ''
    },
    { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
  )
}

function mapCoordsToRegion(latitude: number, longitude: number) {
  if (longitude >= 118 && latitude >= 20 && latitude <= 36) return '华东'
  if (longitude >= 108 && longitude < 118 && latitude >= 20 && latitude <= 30) return '华南'
  if (longitude >= 112 && longitude <= 123 && latitude > 36) return '华北'
  if (longitude >= 104 && longitude < 112 && latitude >= 25 && latitude <= 34) return '华中'
  if (longitude < 104 && latitude >= 23 && latitude <= 34) return '西南'
  if (longitude < 110 && latitude > 34) return '西北'
  return '东北'
}

function sendChat() {
  const text = chatInput.value.trim()
  if (!text) return

  chatMessages.value.push({ id: Date.now(), role: 'user', text })
  chatMessages.value.push({
    id: Date.now() + 1,
    role: 'assistant',
    text: matchedRegion.value
      ? `结合你当前匹配到的${matchedRegion.value}地区，我建议优先关注耐热或适合当季播种的商品，也可以先看看右侧推荐卡片。`
      : '可以先授权定位，我会优先按地区推荐；如果暂不定位，也可以根据阳台光照和季节先选基础蔬菜或香草类商品。'
  })
  chatInput.value = ''
}
</script>

<style scoped>
.home-sidebar {
  display: grid;
  gap: 12px;
}

.sidebar-section {
  display: grid;
  gap: 10px;
}

.sidebar-title,
.section-subtitle {
  margin: 0;
  color: #1f7a41;
}

.sidebar-title {
  font-size: 18px;
}

.section-subtitle {
  font-size: 16px;
}

.smart-header-card,
.status-card,
.ai-card,
.recommend-card,
.notice-card {
  padding: 12px;
  border-radius: 14px;
  background: #f8fcf8;
  border: 1px solid #e4efe6;
}

.sidebar-item-title {
  font-weight: 600;
  color: #1f2937;
}

.sidebar-item-desc,
.diary-meta {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
}

.region-chip,
.recommend-badge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  border-radius: 999px;
  background: #dff4e4;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
}

.recommend-list,
.chat-window {
  display: grid;
  gap: 8px;
}

.chat-window {
  max-height: 220px;
  overflow: auto;
  scrollbar-width: none;
}

.chat-window::-webkit-scrollbar {
  display: none;
}

.chat-message {
  display: flex;
}

.chat-message.is-user {
  justify-content: flex-end;
}

.chat-bubble {
  max-width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  background: #eef7f0;
  color: #1f2937;
  font-size: 13px;
  line-height: 1.5;
}

.chat-message.is-user .chat-bubble {
  background: #dff4e4;
}

.chat-input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.chat-input-row input {
  width: 100%;
}

.diary-card {
  gap: 4px;
}

@media (max-width: 905px) {
  .right-sidebar {
    display: none;
  }
}
</style>
