<template>
  <AppLayout>
    <div class="fav-shell">
      <aside class="fav-sidebar page-lite">
        <div class="fav-title">
          <h1>我的收藏</h1>
          <p class="desc">演示项目：收藏会保存在本地浏览器（localStorage）。</p>
        </div>

        <nav class="fav-nav">
          <button type="button" class="nav-btn" :class="{ active: activeTab === 'tutorials' }" @click="activeTab = 'tutorials'">
            📚 教程收藏
          </button>
          <button type="button" class="nav-btn" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">
            🗣 帖子收藏
          </button>
        </nav>

        <div class="fav-actions">
          <button type="button" class="secondary-btn" @click="reloadTutorials" :disabled="loadingTutorials">
            {{ loadingTutorials ? '刷新中...' : '刷新教程' }}
          </button>
          <button type="button" class="danger-btn" @click="clearAll" :disabled="isAllEmpty">
            清空收藏
          </button>
        </div>
      </aside>

      <main class="fav-main">
        <section v-if="activeTab === 'tutorials'" class="page-lite fav-card">
          <div class="card-head">
            <div>
              <h2>教程收藏</h2>
              <p class="desc">你可以在教程页点击 ♥ 收藏，或在这里移除。</p>
            </div>
            <button type="button" class="secondary-btn" @click="goTutorial">去教程页</button>
          </div>

          <div v-if="tutorialFavCount === 0" class="empty">
            你还没有收藏教程。
          </div>

          <div v-else-if="tutorialError" class="empty error">
            {{ tutorialError }}
          </div>

          <div v-else-if="loadingTutorials" class="empty">加载中...</div>

          <div v-else class="tutorial-grid">
            <article v-for="item in favoriteTutorials" :key="item.id" class="tutorial-item">
              <div class="tutorial-top">
                <div>
                  <span class="tag">{{ item.tag }}</span>
                  <h3 class="title">{{ item.title }}</h3>
                </div>
                <button type="button" class="text-btn" @click="toggleTutorial(item.id)">移除</button>
              </div>
              <p class="desc">{{ item.description }}</p>
              <div class="meta">
                <span>{{ item.difficulty || '图文' }}</span>
                <span>{{ formatDuration(item.durationMinutes) }}</span>
              </div>
            </article>
          </div>
        </section>

        <section v-else class="page-lite fav-card">
          <div class="card-head">
            <div>
              <h2>帖子收藏</h2>
              <p class="desc">你可以在社区卡片上点击 ⭐ 收藏，或在这里移除。</p>
            </div>
            <button type="button" class="secondary-btn" @click="goCommunity">去社区</button>
          </div>

          <div v-if="postFavs.length === 0" class="empty">
            你还没有收藏帖子。
          </div>

          <div v-else class="post-grid">
            <article v-for="post in postFavs" :key="post.id" class="post-card">
              <div class="post-head">
                <span class="tag">{{ post.topic }}</span>
                <button type="button" class="text-btn danger" @click="removePost(post.id)">移除</button>
              </div>
              <h3 class="title">{{ post.title }}</h3>
              <p class="post-content">{{ post.content }}</p>
              <div class="post-foot">
                <span class="sub">{{ post.author || '匿名' }}</span>
                <span class="sub">{{ post.time }}</span>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import { fetchTutorials, type TutorialItem } from '../api'
import { useBuyerFavoritesStore } from '../stores/useBuyerFavoritesStore'

const router = useRouter()
const favorites = useBuyerFavoritesStore()

const activeTab = ref<'tutorials' | 'posts'>('tutorials')
const loadingTutorials = ref(false)
const tutorials = ref<TutorialItem[]>([])
const tutorialError = ref('')

const tutorialFavCount = computed(() => favorites.tutorialIds.length)
const favoriteTutorials = computed(() => {
  const set = favorites.tutorialIdSet
  return tutorials.value.filter((t) => set.has(t.id))
})

const postFavs = computed(() => favorites.posts)
const isAllEmpty = computed(() => favorites.tutorialIds.length === 0 && favorites.posts.length === 0)

onMounted(() => {
  reloadTutorials()
})

function formatDuration(durationMinutes: number | null) {
  return durationMinutes ? `${durationMinutes} 分钟` : '图文教程'
}

async function reloadTutorials() {
  if (loadingTutorials.value) return
  loadingTutorials.value = true
  tutorialError.value = ''
  try {
    const res = await fetchTutorials()
    tutorials.value = res.tutorials
  } catch (err: any) {
    tutorialError.value = err?.response?.data?.message || '教程加载失败'
  } finally {
    loadingTutorials.value = false
  }
}

function toggleTutorial(id: number) {
  favorites.toggleTutorial(id)
}

function removePost(id: number) {
  favorites.removePost(id)
}

function clearAll() {
  favorites.clearAll()
}

function goTutorial() {
  router.push('/tutorial')
}

function goCommunity() {
  router.push('/community')
}
</script>

<style scoped>
.fav-shell {
  display: grid;
  grid-template-columns: minmax(240px, 280px) minmax(0, 1fr);
  gap: 18px;
  align-items: stretch;
  height: calc(100vh - 108px);
  overflow: hidden;
}

.fav-sidebar {
  display: grid;
  gap: 14px;
  align-content: start;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.fav-title h1 {
  margin: 0;
  color: #16351f;
  font-size: 20px;
}

.desc {
  margin: 6px 0 0;
  color: #6b7280;
  line-height: 1.7;
  font-size: 13px;
}

.fav-nav {
  display: grid;
  gap: 10px;
}

.nav-btn {
  text-align: left;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid #e3ece5;
  background: #ffffff;
  color: #1f2937;
  font-weight: 800;
  cursor: pointer;
}

.nav-btn.active {
  background: linear-gradient(135deg, #edf9ef, #ffffff);
  border-color: rgba(31, 122, 65, 0.26);
  color: #1f7a41;
}

.fav-actions {
  display: grid;
  gap: 10px;
}

.fav-main {
  display: grid;
  gap: 16px;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.fav-card {
  display: grid;
  gap: 14px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.empty {
  color: #9ca3af;
}

.tutorial-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.tutorial-item {
  border-radius: 16px;
  border: 1px solid #e5efe7;
  background: #fbfefb;
  padding: 14px;
  display: grid;
  gap: 8px;
}

.tutorial-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 800;
}

.title {
  margin: 8px 0 0;
  color: #16351f;
  font-size: 16px;
}

.meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.post-card {
  border-radius: 16px;
  border: 1px solid #e5efe7;
  background: #ffffff;
  padding: 14px;
  display: grid;
  gap: 10px;
}

.post-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.post-content {
  margin: 0;
  color: #4b5563;
  line-height: 1.7;
  font-size: 13px;
}

.post-foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.sub {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.danger-btn {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #be123c;
}

.text-btn {
  border: none;
  background: transparent;
  color: #1f7a41;
  font-weight: 800;
  padding: 0;
  cursor: pointer;
}

.text-btn.danger {
  color: #dc2626;
}

.fav-sidebar::-webkit-scrollbar,
.fav-main::-webkit-scrollbar {
  width: 8px;
}

.fav-sidebar::-webkit-scrollbar-thumb,
.fav-main::-webkit-scrollbar-thumb {
  background: #d2e3d6;
  border-radius: 999px;
}

@media (max-width: 1020px) {
  .fav-shell {
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 14px;
  }
}

@media (max-width: 900px) {
  .fav-shell {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }

  .fav-sidebar {
    overflow: visible;
    padding-right: 0;
  }

  .fav-main {
    overflow: visible;
    padding-right: 0;
  }

  .tutorial-grid,
  .post-grid {
    grid-template-columns: 1fr;
  }

  .card-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
