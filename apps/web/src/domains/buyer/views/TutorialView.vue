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
            <div class="search-bar">
              <input v-model="searchKeyword" type="text" placeholder="搜索教程标题或关键词..." class="search-input" />
            </div>

            <TutorialGrid
              :items="filteredTutorials"
              :status="status"
              :error="error"
              :favorite-id-set="favoriteIdSet"
              @open-detail="openTutorialDetail"
              @toggle-favorite="toggleFavorite"
            />
          </div>

          <TutorialAdvicePanel />
        </div>
      </main>
    </div>

    <FloatingBall icon="🤖" color="#80ab64" :popup-width="380" :popup-height="500">
      <TutorialAiChat :messages="chat.chatMessages.value" :loading="chat.chatSending.value" @send="chat.sendChat" @clear="chat.clearChat" />
    </FloatingBall>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import FloatingBall from '../../../shared/components/FloatingBall.vue'
import TutorialAiChat from '../components/tutorial/TutorialAiChat.vue'
import TutorialGrid from '../components/tutorial/TutorialGrid.vue'
import TutorialAdvicePanel from '../components/tutorial/TutorialAdvicePanel.vue'
import { fetchTutorials, type TutorialItem } from '../api'
import { useBuyerFavoritesStore } from '../stores/useBuyerFavoritesStore'
import { useTutorialChat } from '../composables/useTutorialChat'

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
const chat = useTutorialChat()

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
      [...res.hotTutorials, ...res.tutorials]
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
  const dedupeMap = new Map<number, TutorialItem>()
  for (const item of hotTutorials.value) dedupeMap.set(item.id, item)
  for (const item of tutorials.value) dedupeMap.set(item.id, item)

  let list = Array.from(dedupeMap.values())
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
  gap: 0;
  min-height: 0;
  overflow: hidden;
}

.tutorial-sidebar::-webkit-scrollbar,
.hero-main::-webkit-scrollbar {
  width: 8px;
}

.tutorial-sidebar::-webkit-scrollbar-thumb,
.hero-main::-webkit-scrollbar-thumb {
  background: #d2e3d6;
  border-radius: 999px;
}

.hero-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 260px);
  gap: 14px;
  align-items: stretch;
  height: 100%;
  min-height: 0;
}

.hero-main {
  display: grid;
  gap: 14px;
  align-content: start;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.search-bar {
  display: flex;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e6f0e8;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #d3d7de;
  background: #f8fcf8;
  font-size: 14px;
}

@media (max-width: 1100px) {
  .tutorial-shell {
    grid-template-columns: 190px minmax(0, 1fr);
  }

  .hero-row {
    grid-template-columns: 1fr;
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

  .hero-row {
    height: auto;
  }

  .hero-main {
    overflow: visible;
    max-height: none;
    padding-right: 0;
  }
}
</style>
