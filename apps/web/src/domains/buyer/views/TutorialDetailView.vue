<template>
  <AppLayout>
    <div class="tutorial-detail-shell">
      <section v-if="status === 'loading'" class="page-lite state-card">
        <h2>教程加载中...</h2>
      </section>

      <section v-else-if="status === 'error'" class="page-lite state-card">
        <h2>教程加载失败</h2>
        <p>{{ error }}</p>
        <div class="actions">
          <button type="button" class="secondary-btn" @click="loadDetail">重试</button>
          <button type="button" @click="goBack">返回教程页</button>
        </div>
      </section>

      <template v-else-if="detail">
        <header class="page-lite hero" :style="{ background: detail.backgroundStyle || fallbackBg }">
          <span class="hero-tag">{{ detail.tag }}</span>
          <h1>{{ detail.title }}</h1>
          <p>{{ detail.description }}</p>
          <div class="hero-meta">
            <span>{{ categoryLabel(detail.categoryCode) }}</span>
            <span>{{ detail.difficulty || '精选' }}</span>
            <span>{{ detail.durationMinutes ? `${detail.durationMinutes} 分钟` : '图文教程' }}</span>
          </div>
          <div class="actions">
            <button type="button" class="secondary-btn" @click="goBack">返回教程页</button>
          </div>
        </header>

        <article class="page-lite detail-content">
          <section v-if="detail.mediaUrl || detail.detailVideoUrl" class="media-block">
            <h2>教程演示</h2>
            <template v-if="detail.mediaUrl">
              <h3 class="media-subtitle">封面图</h3>
              <img v-if="detail.mediaType !== 'VIDEO'" :src="detail.mediaUrl" :alt="detail.title" />
              <video v-else :src="detail.mediaUrl" controls />
            </template>
            <template v-if="detail.detailVideoUrl">
              <h3 class="media-subtitle">视频讲解</h3>
              <video :src="detail.detailVideoUrl" controls />
            </template>
          </section>

          <h2>教程内容</h2>
          <p>
            {{ detail.description }}
          </p>
          <h3>建议步骤</h3>
          <ol>
            <li>准备材料与工具，确认操作环境。</li>
            <li>按教程要点分步骤执行，记录关键参数。</li>
            <li>完成后观察 2-3 天，根据状态微调。</li>
          </ol>
          <h3>提示</h3>
          <p>如果你在实践中遇到问题，可以到社区页选择对应话题发布求助。</p>
        </article>
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import { fetchTutorialDetail, type TutorialItem } from '../api'

const route = useRoute()
const router = useRouter()

const status = ref<'idle' | 'loading' | 'ok' | 'error'>('idle')
const error = ref('')
const detail = ref<TutorialItem | null>(null)

const fallbackBg = 'linear-gradient(135deg, #1f7a41, #60a05d)'

const categoryMap: Record<string, string> = {
  seed: '播种入门',
  care: '日常养护',
  pest: '病虫防治',
  advanced: '进阶技巧',
  seasonal: '四季指南',
  tool: '工具推荐'
}

function categoryLabel(code: string | null) {
  if (!code) return '通用'
  return categoryMap[code] || code
}

function goBack() {
  router.push('/tutorial')
}

async function loadDetail() {
  const id = Number(route.params.id)
  if (!Number.isFinite(id) || id <= 0) {
    status.value = 'error'
    error.value = '教程编号无效'
    return
  }

  status.value = 'loading'
  error.value = ''
  try {
    detail.value = await fetchTutorialDetail(id)
    status.value = 'ok'
  } catch (err: any) {
    status.value = 'error'
    error.value = err?.response?.data?.message || '暂时无法获取该教程'
  }
}

onMounted(loadDetail)
</script>

<style scoped>
.tutorial-detail-shell {
  display: grid;
  gap: 14px;
}

.state-card,
.hero,
.detail-content {
  display: grid;
  gap: 12px;
}

.media-block {
  display: grid;
  gap: 10px;
}

.media-subtitle {
  margin: 0;
  font-size: 14px;
  color: #374151;
}

.media-block img,
.media-block video {
  width: 100%;
  max-width: 680px;
  border-radius: 14px;
  border: 1px solid #e5efe7;
  max-height: 380px;
  object-fit: cover;
}

.hero {
  color: #fff;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 20px;
}

.hero-tag {
  display: inline-flex;
  width: fit-content;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
}

.hero h1 {
  margin: 0;
}

.hero p {
  margin: 0;
  line-height: 1.7;
}

.hero-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-meta span {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-content h2,
.detail-content h3,
.detail-content p,
.detail-content ol {
  margin: 0;
}

.detail-content p,
.detail-content li {
  line-height: 1.8;
  color: #4b5563;
}

.detail-content ol {
  padding-left: 20px;
  display: grid;
  gap: 8px;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}
</style>
