<template>
  <AdminLayout>
    <h2 class="page-title">评价审核</h2>

    <!-- 搜索和筛选栏 -->
    <div class="filter-bar page-lite">
      <div class="filter-row">
        <input v-model="search" type="text" placeholder="搜索评价内容 / 用户名..." class="search-input" />
        <select v-model="filterProduct" class="filter-select">
          <option value="">全部商品</option>
          <option v-for="p in productOptions" :key="p" :value="p">{{ p }}</option>
        </select>
        <select v-model="filterRating" class="filter-select">
          <option value="0">全部评分</option>
          <option value="5">5星</option>
          <option value="4">4星</option>
          <option value="3">3星</option>
          <option value="2">2星及以下</option>
        </select>
        <select v-model="sortBy" class="filter-select">
          <option value="newest">最新优先</option>
          <option value="oldest">最早优先</option>
          <option value="rating-high">评分从高到低</option>
          <option value="rating-low">评分从低到高</option>
        </select>
      </div>
      <div class="tab-bar">
        <button :class="['tab-btn', { active: filter === 'all' }]" @click="filter = 'all'">全部 ({{ reviews.length }})</button>
        <button :class="['tab-btn', { active: filter === 'pending' }]" @click="filter = 'pending'">待处理 ({{ pendingCount }})</button>
        <button :class="['tab-btn', { active: filter === 'replied' }]" @click="filter = 'replied'">已回复</button>
        <button :class="['tab-btn', { active: filter === 'negative' }]" @click="filter = 'negative'">差评预警</button>
      </div>
    </div>

    <div v-if="loading" class="empty-state page-lite">
      <p class="empty-hint">加载中...</p>
    </div>
    <div v-else-if="sortedReviews.length === 0" class="empty-state page-lite">
      <p class="empty-hint">暂无匹配的评价</p>
    </div>
    <div v-else class="review-list">
      <div class="review-card page-lite" v-for="r in sortedReviews" :key="r.id">
        <div class="review-top">
          <div class="review-info">
            <div class="review-avatar">{{ (r.buyerUsername || '用').charAt(0) }}</div>
            <div>
              <strong>{{ r.buyerUsername || '匿名用户' }}</strong>
              <span class="review-date">{{ formatDateTime(r.createdAt) }}</span>
            </div>
          </div>
          <div class="review-top-right">
            <span class="review-stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
            <span :class="['handle-tag', isHandled(r.id) ? 'done' : 'todo']">{{ isHandled(r.id) ? '已处理' : '待处理' }}</span>
          </div>
        </div>
        <div class="review-product">商品：{{ r.productName }}</div>
        <p class="review-content">{{ r.content }}</p>

        <div v-if="replyMap[r.id]" class="review-reply">
          <strong>商家回复：</strong>{{ replyMap[r.id] }}
        </div>

        <div v-if="replyingId === r.id" class="reply-form">
          <input v-model="replyText" placeholder="输入回复内容..." />
          <button @click="submitReply(r)">回复</button>
          <button class="secondary-btn" @click="replyingId = null">取消</button>
        </div>

        <div class="review-actions">
          <button v-if="!replyMap[r.id]" class="text-link" @click="startReply(r)">回复</button>
          <button v-if="!isHandled(r.id)" class="text-link" @click="handleReview(r.id)">标记已处理</button>
          <button v-else class="text-link muted">已处理</button>
          <button class="text-link del" @click="deleteReview(r)">删除</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import { fetchAdminReviews, deleteAdminReview, type AdminOrderReviewItem } from '../api'

const REVIEW_STATUS_KEY = 'gp2_admin_review_status'
const REVIEW_REPLY_KEY = 'gp2_admin_review_reply'

const filter = ref('all')
const search = ref('')
const filterProduct = ref('')
const filterRating = ref('0')
const sortBy = ref('newest')
const replyingId = ref<number | null>(null)
const replyText = ref('')
const reviews = ref<AdminOrderReviewItem[]>([])
const loading = ref(false)

// localStorage 存储的处理状态和回复
const handledSet = ref<Set<number>>(loadHandledSet())
const replyMap = ref<Record<number, string>>(loadReplyMap())

const productOptions = computed(() => [...new Set(reviews.value.map((r) => r.productName))])
const pendingCount = computed(() => reviews.value.filter((r) => !isHandled(r.id)).length)

function isHandled(id: number) {
  return handledSet.value.has(id)
}

function loadHandledSet(): Set<number> {
  try {
    const raw = localStorage.getItem(REVIEW_STATUS_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as number[]
    return new Set(arr)
  } catch {
    return new Set()
  }
}

function saveHandledSet() {
  localStorage.setItem(REVIEW_STATUS_KEY, JSON.stringify([...handledSet.value]))
}

function loadReplyMap(): Record<number, string> {
  try {
    const raw = localStorage.getItem(REVIEW_REPLY_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<number, string>
  } catch {
    return {}
  }
}

function saveReplyMap() {
  localStorage.setItem(REVIEW_REPLY_KEY, JSON.stringify(replyMap.value))
}

const filteredReviews = computed(() => {
  let list = [...reviews.value]
  if (filter.value === 'pending') list = list.filter((r) => !isHandled(r.id))
  if (filter.value === 'replied') list = list.filter((r) => !!replyMap.value[r.id])
  if (filter.value === 'negative') list = list.filter((r) => r.rating <= 2)
  if (filterProduct.value) list = list.filter((r) => r.productName === filterProduct.value)
  if (Number(filterRating.value) > 0) {
    const v = Number(filterRating.value)
    list = v === 2 ? list.filter((r) => r.rating <= 2) : list.filter((r) => r.rating === v)
  }
  if (search.value) {
    const kw = search.value.toLowerCase()
    list = list.filter(
      (r) =>
        r.content.toLowerCase().includes(kw) ||
        (r.buyerUsername || '').toLowerCase().includes(kw) ||
        r.productName.toLowerCase().includes(kw)
    )
  }
  return list
})

const sortedReviews = computed(() => {
  const list = [...filteredReviews.value]
  if (sortBy.value === 'newest')
    list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  if (sortBy.value === 'oldest')
    list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
  if (sortBy.value === 'rating-high') list.sort((a, b) => b.rating - a.rating)
  if (sortBy.value === 'rating-low') list.sort((a, b) => a.rating - b.rating)
  return list
})

function formatDateTime(value: string | null) {
  if (!value) return '未记录'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

function startReply(r: AdminOrderReviewItem) {
  replyingId.value = r.id
  replyText.value = ''
}

function submitReply(r: AdminOrderReviewItem) {
  if (!replyText.value.trim()) return
  replyMap.value[r.id] = replyText.value.trim()
  saveReplyMap()
  handledSet.value.add(r.id)
  saveHandledSet()
  replyingId.value = null
  replyText.value = ''
}

function handleReview(id: number) {
  handledSet.value.add(id)
  saveHandledSet()
}

async function deleteReview(r: AdminOrderReviewItem) {
  if (!confirm('确定要删除这条评价吗？')) return
  try {
    await deleteAdminReview(r.id)
    reviews.value = reviews.value.filter((x) => x.id !== r.id)
    handledSet.value.delete(r.id)
    saveHandledSet()
    delete replyMap.value[r.id]
    saveReplyMap()
  } catch (e) {
    alert('删除失败：' + (e instanceof Error ? e.message : '未知错误'))
  }
}

onMounted(async () => {
  loading.value = true
  try {
    reviews.value = await fetchAdminReviews()
  } catch {
    reviews.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-title { margin: 0 0 14px; font-size: 22px; color: #1f2937; }

.filter-bar { display: grid; gap: 10px; margin-bottom: 14px; }
.filter-row { display: flex; gap: 8px; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 180px; padding: 8px 12px; border-radius: 8px; border: 1px solid #d3d7de; font-size: 13px; }
.filter-select { padding: 8px 10px; border-radius: 8px; border: 1px solid #d3d7de; font-size: 13px; background: #fff; }

.tab-bar { display: flex; gap: 6px; }
.tab-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid #e6ece7; background: #fff; color: #374151; font-size: 13px; cursor: pointer; }
.tab-btn.active { background: #e6f4ea; color: #1f7a41; font-weight: 600; border-color: #80ab64; }

.review-list { display: grid; gap: 12px; }
.review-card { display: grid; gap: 10px; }

.review-top { display: flex; justify-content: space-between; align-items: center; }
.review-top-right { display: flex; align-items: center; gap: 10px; }
.review-info { display: flex; align-items: center; gap: 10px; }

.review-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: #e6f4ea; color: #1f7a41; font-weight: 700;
  display: flex; align-items: center; justify-content: center; font-size: 14px;
}

.review-info strong { font-size: 14px; color: #1f2937; }
.review-date { display: block; font-size: 12px; color: #9ca3af; }
.review-stars { color: #f59e0b; font-size: 14px; }
.review-product { font-size: 13px; color: #6b7280; }
.review-content { margin: 0; font-size: 14px; color: #374151; line-height: 1.6; }

.handle-tag { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.handle-tag.done { background: #d1fae5; color: #065f46; }
.handle-tag.todo { background: #fef3c7; color: #92400e; }

.review-reply {
  padding: 10px 12px; background: #f0f7f1; border-radius: 8px;
  font-size: 13px; color: #374151; line-height: 1.5;
}

.reply-form { display: flex; gap: 8px; align-items: center; }
.reply-form input { flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid #d3d7de; font-size: 13px; }
.reply-form button { padding: 8px 14px; border-radius: 8px; font-size: 13px; background: #1f7a41; color: #fff; border: none; cursor: pointer; }
.reply-form button.secondary-btn { background: #fff; color: #374151; border: 1px solid #d3d7de; }

.review-actions { display: flex; gap: 8px; }
.text-link { background: transparent; color: #1f7a41; border: none; padding: 2px 6px; font-size: 13px; cursor: pointer; }
.text-link:hover { text-decoration: underline; }
.text-link.del { color: #dc2626; }
.text-link.muted { color: #9ca3af; cursor: default; }
.text-link.muted:hover { text-decoration: none; }

.empty-state { text-align: center; padding: 30px; }
.empty-hint { color: #9ca3af; margin: 0; }
</style>
