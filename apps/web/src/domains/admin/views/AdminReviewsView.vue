<template>
  <AdminLayout>
    <h2 class="page-title">用户评价</h2>

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
        <button :class="['tab-btn', { active: filter === 'pending' }]" @click="filter = 'pending'">待回复 ({{ pendingCount }})</button>
        <button :class="['tab-btn', { active: filter === 'replied' }]" @click="filter = 'replied'">已回复</button>
        <button :class="['tab-btn', { active: filter === 'negative' }]" @click="filter = 'negative'">差评预警</button>
      </div>
    </div>

    <!-- 评价列表 -->
    <div v-if="sortedReviews.length === 0" class="empty-state page-lite">
      <p class="empty-hint">暂无匹配的评价</p>
    </div>
    <div v-else class="review-list">
      <div class="review-card page-lite" v-for="r in sortedReviews" :key="r.id">
        <div class="review-top">
          <div class="review-info">
            <div class="review-avatar">{{ r.user.charAt(0) }}</div>
            <div>
              <strong>{{ r.user }}</strong>
              <span class="review-date">{{ r.date }}</span>
            </div>
          </div>
          <div class="review-top-right">
            <span class="review-stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
            <span :class="['handle-tag', r.handled ? 'done' : 'todo']">{{ r.handled ? '已处理' : '待处理' }}</span>
          </div>
        </div>
        <div class="review-product">商品：{{ r.product }}</div>
        <p class="review-content">{{ r.content }}</p>

        <div v-if="r.reply" class="review-reply">
          <strong>商家回复：</strong>{{ r.reply }}
        </div>

        <div v-if="replyingId === r.id" class="reply-form">
          <input v-model="replyText" placeholder="输入回复内容..." />
          <button @click="submitReply(r)">回复</button>
          <button class="secondary-btn" @click="replyingId = null">取消</button>
        </div>

        <div class="review-actions">
          <button v-if="!r.reply" class="text-link" @click="startReply(r)">回复</button>
          <button v-if="!r.handled" class="text-link" @click="handleReview(r)">标记已处理</button>
          <button v-else class="text-link muted">已处理</button>
          <button class="text-link del" @click="deleteReview(r)">删除</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'

const filter = ref('all')
const search = ref('')
const filterProduct = ref('')
const filterRating = ref('0')
const sortBy = ref('newest')
const replyingId = ref<number | null>(null)
const replyText = ref('')

const reviews = ref([
  { id: 1, user: '张三', product: '家庭番茄种植套装', rating: 5, content: '发芽率很高，包装也很好，推荐！', date: '2026-04-10', reply: '', handled: false },
  { id: 2, user: '李四', product: '有机薄荷种子', rating: 4, content: '长势不错，就是发货稍慢。', date: '2026-04-09', reply: '感谢反馈，我们会优化物流速度！', handled: true },
  { id: 3, user: '王五', product: '阳台草莓种植全套', rating: 5, content: '草莓终于结果了，超级甜！套装很齐全。', date: '2026-04-08', reply: '', handled: false },
  { id: 4, user: '赵六', product: '迷你园艺工具三件套', rating: 3, content: '铲子手柄有点松，其他还行。', date: '2026-04-07', reply: '', handled: false },
  { id: 5, user: '孙七', product: '有机营养土 5L', rating: 5, content: '土质松软，植物长得很好。', date: '2026-04-06', reply: '感谢好评，祝种植愉快！', handled: true },
  { id: 6, user: '周八', product: '自动浇水器', rating: 2, content: '用了一周就漏水了，希望改进质量。', date: '2026-04-05', reply: '', handled: false },
  { id: 7, user: '吴九', product: '家庭番茄种植套装', rating: 4, content: '整体不错，就是说明书太简单了。', date: '2026-04-04', reply: '', handled: false },
  { id: 8, user: '郑十', product: '向日葵种子', rating: 1, content: '种子全部没发芽，非常失望。', date: '2026-04-03', reply: '', handled: false }
])

const productOptions = computed(() => [...new Set(reviews.value.map(r => r.product))])
const pendingCount = computed(() => reviews.value.filter(r => !r.reply).length)

const filteredReviews = computed(() => {
  let list = reviews.value
  if (filter.value === 'pending') list = list.filter(r => !r.reply)
  if (filter.value === 'replied') list = list.filter(r => !!r.reply)
  if (filter.value === 'negative') list = list.filter(r => r.rating <= 2)
  if (filterProduct.value) list = list.filter(r => r.product === filterProduct.value)
  if (Number(filterRating.value) > 0) {
    const v = Number(filterRating.value)
    list = v === 2 ? list.filter(r => r.rating <= 2) : list.filter(r => r.rating === v)
  }
  if (search.value) {
    const kw = search.value.toLowerCase()
    list = list.filter(r => r.content.toLowerCase().includes(kw) || r.user.toLowerCase().includes(kw) || r.product.toLowerCase().includes(kw))
  }
  return list
})

const sortedReviews = computed(() => {
  const list = [...filteredReviews.value]
  if (sortBy.value === 'newest') list.sort((a, b) => b.date.localeCompare(a.date))
  if (sortBy.value === 'oldest') list.sort((a, b) => a.date.localeCompare(b.date))
  if (sortBy.value === 'rating-high') list.sort((a, b) => b.rating - a.rating)
  if (sortBy.value === 'rating-low') list.sort((a, b) => a.rating - b.rating)
  return list
})

function startReply(r: any) { replyingId.value = r.id; replyText.value = '' }
function submitReply(r: any) { if (replyText.value) { r.reply = replyText.value; r.handled = true; replyingId.value = null; replyText.value = '' } }
function handleReview(r: any) { r.handled = true }
function deleteReview(r: any) { reviews.value = reviews.value.filter(x => x.id !== r.id) }
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
.reply-form button { padding: 8px 14px; border-radius: 8px; font-size: 13px; }

.review-actions { display: flex; gap: 8px; }
.text-link { background: transparent; color: #1f7a41; border: none; padding: 2px 6px; font-size: 13px; cursor: pointer; }
.text-link:hover { text-decoration: underline; }
.text-link.del { color: #dc2626; }
.text-link.muted { color: #9ca3af; cursor: default; }
.text-link.muted:hover { text-decoration: none; }

.empty-state { text-align: center; padding: 30px; }
.empty-hint { color: #9ca3af; margin: 0; }
</style>