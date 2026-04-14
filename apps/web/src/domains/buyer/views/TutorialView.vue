<template>
  <AppLayout>
    <div class="tutorial-shell">
      <!-- 左侧分类栏 -->
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

      <!-- 右侧内容区 -->
      <main class="tutorial-main">
        <!-- 轮播图 -->
        <div class="carousel-section page-lite">
          <Swiper
            :modules="[Autoplay, Pagination]"
            :autoplay="{ delay: 4000, disableOnInteraction: false }"
            :pagination="{ clickable: true }"
            :loop="true"
            class="tutorial-swiper"
          >
            <SwiperSlide v-for="item in hotTutorials" :key="item.title">
              <div class="slide-card" :style="{ background: item.bg }">
                <div class="slide-tag">{{ item.tag }}</div>
                <h2 class="slide-title">{{ item.title }}</h2>
                <p class="slide-desc">{{ item.desc }}</p>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <!-- 搜索框 -->
        <div class="search-bar page-lite">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索教程标题或关键词..."
            class="search-input"
          />
        </div>

        <!-- 教程卡片 -->
        <div v-if="filteredTutorials.length === 0" class="empty-state page-lite">
          <p class="empty-hint">没有找到相关教程</p>
        </div>
        <div v-else class="tutorial-grid">
          <article class="tutorial-card page-lite" v-for="item in filteredTutorials" :key="item.title">
            <div class="card-thumb" :style="{ background: item.color }">{{ item.tag }}</div>
            <div class="card-body">
              <div class="card-title-row">
                <h3 class="card-title">{{ item.title }}</h3>
                <button class="fav-btn" :class="{ faved: favoriteTitles.has(item.title) }" @click="toggleFavorite(item.title)">
                  {{ favoriteTitles.has(item.title) ? '❤️' : '🤍' }}
                </button>
              </div>
              <p class="card-desc">{{ item.desc }}</p>
              <div class="card-meta">
                <span class="card-difficulty">{{ item.difficulty }}</span>
                <span class="card-duration">{{ item.duration }}</span>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>

    <!-- 智能助手悬浮球 -->
    <FloatingBall icon="🤖" color="#80ab64" :popup-width="380" :popup-height="500">
      <div class="chat-window">
        <div class="chat-header">
          <span class="chat-title">智能助手</span>
        </div>
        <div class="chat-body">
          <div class="chat-welcome">
            <div class="chat-bot-avatar">🤖</div>
            <p>你好！我是种植智能助手，有任何园艺问题都可以问我。</p>
          </div>
        </div>
        <div class="chat-footer">
          <div class="chat-tools">
            <button class="chat-tool-btn" title="上传图片">📷</button>
            <button class="chat-tool-btn" title="语音输入">🎤</button>
            <button class="chat-tool-btn" title="历史记录">📜</button>
          </div>
          <div class="chat-input-row">
            <input type="text" class="chat-input" placeholder="输入你的问题..." />
            <button class="chat-send-btn">发送</button>
          </div>
        </div>
      </div>
    </FloatingBall>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import FloatingBall from '../../../shared/components/FloatingBall.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const categories = [
  { key: 'all', icon: '📚', label: '全部教程' },
  { key: 'seed', icon: '🌱', label: '播种入门' },
  { key: 'care', icon: '💧', label: '日常养护' },
  { key: 'pest', icon: '🛡️', label: '病虫防治' },
  { key: 'advanced', icon: '🔬', label: '进阶技巧' },
  { key: 'seasonal', icon: '🗓️', label: '四季指南' },
  { key: 'tool', icon: '🧰', label: '工具推荐' },
  { key: 'favorite', icon: '❤️', label: '我的收藏' }
]

const activeCategory = ref('all')
const searchKeyword = ref('')

const hotTutorials = [
  { tag: '热门推荐', title: '阳台番茄从零到收获全攻略', desc: '手把手教你在阳台种出饱满多汁的番茄，适合完全零基础的新手。', bg: 'linear-gradient(135deg, #1f7a41, #34d399)' },
  { tag: '本周精选', title: '春季播种时间表与品种推荐', desc: '根据你所在的地区气候，选择最合适的春播品种和时间窗口。', bg: 'linear-gradient(135deg, #2563eb, #60a5fa)' },
  { tag: '新手必读', title: '浇水的学问：频率、水量与时机', desc: '90% 的新手植物死亡都和浇水有关，这篇帮你彻底搞懂。', bg: 'linear-gradient(135deg, #d97706, #fbbf24)' }
]

const tutorials = [
  { tag: '播种', category: 'seed', title: '播种前如何选种与处理', desc: '介绍适合阳台与庭院的新手种类，并说明浸种、催芽的基础步骤。', difficulty: '入门', duration: '5 分钟', color: 'linear-gradient(135deg, #dff4e4, #b6e8c4)' },
  { tag: '播种', category: 'seed', title: '育苗盘使用与移栽时机', desc: '从播种到移栽的完整流程，避免伤根和缓苗期过长。', difficulty: '入门', duration: '8 分钟', color: 'linear-gradient(135deg, #dff4e4, #b6e8c4)' },
  { tag: '养护', category: 'care', title: '幼苗阶段的光照与浇水', desc: '帮助你避免徒长、积水烂根等常见问题。', difficulty: '入门', duration: '6 分钟', color: 'linear-gradient(135deg, #dbeafe, #93c5fd)' },
  { tag: '养护', category: 'care', title: '家庭肥料搭配与施肥节奏', desc: '有机肥、复合肥怎么选，多久施一次最合适。', difficulty: '中级', duration: '7 分钟', color: 'linear-gradient(135deg, #dbeafe, #93c5fd)' },
  { tag: '防治', category: 'pest', title: '家庭园艺病虫害预防', desc: '从物理防护到日常巡检，降低病虫害发生概率。', difficulty: '中级', duration: '10 分钟', color: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
  { tag: '防治', category: 'pest', title: '常见叶片问题诊断图鉴', desc: '黄叶、卷叶、斑点？对照图片快速判断原因。', difficulty: '入门', duration: '5 分钟', color: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
  { tag: '进阶', category: 'advanced', title: '阳台微型堆肥实操指南', desc: '厨余变沃土，小空间也能做堆肥。', difficulty: '进阶', duration: '12 分钟', color: 'linear-gradient(135deg, #ede9fe, #c4b5fd)' },
  { tag: '四季', category: 'seasonal', title: '四季适合播种的品种速查', desc: '按季节筛选更容易成功的作物，附推荐品种清单。', difficulty: '入门', duration: '4 分钟', color: 'linear-gradient(135deg, #fce7f3, #f9a8d4)' },
  { tag: '工具', category: 'tool', title: '新手园艺工具选购建议', desc: '花盆、铲子、喷壶...哪些值得买，哪些可以省。', difficulty: '入门', duration: '6 分钟', color: 'linear-gradient(135deg, #f3f4f6, #d1d5db)' }
]

const favoriteTitles = ref<Set<string>>(new Set([
  '播种前如何选种与处理',
  '家庭园艺病虫害预防'
]))

function toggleFavorite(title: string) {
  if (favoriteTitles.value.has(title)) favoriteTitles.value.delete(title)
  else favoriteTitles.value.add(title)
}

const filteredTutorials = computed(() => {
  let list = tutorials
  if (activeCategory.value === 'favorite') {
    list = list.filter(t => favoriteTitles.value.has(t.title))
  } else if (activeCategory.value !== 'all') {
    list = list.filter(t => t.category === activeCategory.value)
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(t =>
      t.title.toLowerCase().includes(kw) ||
      t.desc.toLowerCase().includes(kw) ||
      t.tag.toLowerCase().includes(kw)
    )
  }
  return list
})
</script>

<style scoped>
.tutorial-shell {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  max-width: 100%;
  width: calc(100vw - 24px);
  margin-left: calc((100% - (100vw - 24px)) / 2);
  padding: 0 12px;
}

.tutorial-sidebar {
  position: sticky;
  top: 16px;
  display: grid;
  gap: 4px;
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

.tutorial-main { display: grid; gap: 14px; }

.carousel-section { padding: 0; overflow: hidden; }

.tutorial-swiper { width: 100%; border-radius: 16px; }

.slide-card {
  padding: 36px 32px;
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
  background: rgba(255,255,255,0.2);
  width: fit-content;
  padding: 3px 10px;
  border-radius: 999px;
}

.slide-title { margin: 0; font-size: 26px; font-weight: 700; }
.slide-desc { margin: 0; font-size: 15px; line-height: 1.6; opacity: 0.9; max-width: 520px; }

.search-bar { display: flex; }

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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.tutorial-card {
  display: grid;
  gap: 0;
  padding: 0;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.tutorial-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

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
  font-size: 16px;
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
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
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

@media (max-width: 950px) {
  .tutorial-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 760px) {
  .tutorial-shell { grid-template-columns: 1fr; }
  .tutorial-sidebar { position: static; }
  .tutorial-grid { grid-template-columns: 1fr; }
}
</style>