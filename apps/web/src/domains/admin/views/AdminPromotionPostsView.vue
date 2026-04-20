<template>
  <AdminLayout>
    <section class="page-head">
      <div>
        <h2 class="page-title">推广文章</h2>
        <p class="page-desc">支持发布、编辑、删除，并可上传配图用于活动展示。</p>
      </div>
      <button class="secondary-btn" @click="loadData" :disabled="loading">
        {{ loading ? '刷新中...' : '刷新列表' }}
      </button>
    </section>

    <section class="page-lite editor-card">
      <h3>{{ editingId ? '编辑推广文章' : '新增推广文章' }}</h3>

      <select v-model.number="form.promotionId">
        <option :value="0" disabled>请选择关联促销位</option>
        <option v-for="item in promotions" :key="item.id" :value="item.id">{{ item.title }}</option>
      </select>

      <select v-model="form.channel">
        <option value="community">社区</option>
        <option value="home">首页位</option>
        <option value="product">商品页位</option>
      </select>

      <textarea v-model.trim="form.content" rows="4" placeholder="请输入推广内容"></textarea>

      <div class="image-field">
        <p class="field-label">配图（可选）</p>
        <div class="image-row">
          <label class="secondary-btn file-btn">
            上传图片
            <input type="file" accept="image/*" @change="onImageChange" />
          </label>
          <button class="secondary-btn" type="button" @click="clearImage" :disabled="!form.imageUrl">移除图片</button>
        </div>
        <img v-if="form.imageUrl" class="preview-image" :src="form.imageUrl" alt="promotion image" />
      </div>

      <div class="form-actions">
        <button @click="submitPost" :disabled="submitting">
          {{ submitting ? '提交中...' : editingId ? '保存修改' : '发布推广文案' }}
        </button>
        <button class="secondary-btn" @click="resetForm" :disabled="submitting">清空</button>
        <button v-if="editingId" class="secondary-btn" @click="cancelEdit" :disabled="submitting">取消编辑</button>
      </div>
      <p v-if="message" class="message">{{ message }}</p>
    </section>

    <section class="page-lite table-card">
      <div class="table-head">
        <h3>推广文章列表</h3>
        <span class="count-chip">{{ filteredPosts.length }} / {{ posts.length }} 条</span>
      </div>

      <div class="table-filters">
        <input v-model.trim="filterKeyword" type="text" placeholder="搜索推广内容或促销位标题" />
        <select v-model="filterChannel">
          <option value="all">全部渠道</option>
          <option value="community">社区</option>
          <option value="home">首页位</option>
          <option value="product">商品页位</option>
        </select>
      </div>

      <div v-if="loading && posts.length === 0" class="empty-state">推广文章加载中...</div>
      <div v-else-if="error" class="empty-state error">{{ error }}</div>
      <div v-else-if="filteredPosts.length === 0" class="empty-state">暂无匹配的推广文章</div>

      <div v-else class="card-list">
        <article v-for="item in filteredPosts" :key="item.id" class="post-card">
          <div class="post-meta">
            <span class="channel-chip">{{ channelLabelMap[item.channel] || item.channel }}</span>
            <span>{{ promotionTitleMap[item.promotionId] || `促销位 #${item.promotionId}` }}</span>
            <span>{{ formatDateTime(item.publishedAt || item.createdAt) }}</span>
          </div>

          <img v-if="item.imageUrl" class="post-image" :src="item.imageUrl" alt="post image" />
          <p class="post-content">{{ item.content }}</p>

          <div class="post-actions">
            <button class="secondary-btn" @click="startEdit(item)">编辑</button>
            <button class="secondary-btn danger-btn" :disabled="deletingId === item.id" @click="removePost(item)">
              {{ deletingId === item.id ? '删除中...' : '删除' }}
            </button>
          </div>
        </article>
      </div>
    </section>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import {
  createPromotionPost,
  deletePromotionPost,
  fetchPromotionPosts,
  fetchPromotions,
  updatePromotionPost,
  type AdminPromotion,
  type AdminPromotionPost
} from '../api'

const loading = ref(false)
const submitting = ref(false)
const deletingId = ref<number | null>(null)
const editingId = ref<number | null>(null)
const error = ref('')
const message = ref('')
const posts = ref<AdminPromotionPost[]>([])
const promotions = ref<AdminPromotion[]>([])
const filterKeyword = ref('')
const filterChannel = ref('all')

const form = reactive({
  promotionId: 0,
  channel: 'community',
  content: '',
  imageUrl: '' as string
})

const channelLabelMap: Record<string, string> = {
  community: '社区',
  home: '首页位',
  product: '商品页位'
}

const promotionTitleMap = ref<Record<number, string>>({})

const filteredPosts = computed(() => {
  const keyword = filterKeyword.value.trim().toLowerCase()
  return posts.value.filter((item) => {
    const byChannel = filterChannel.value === 'all' || item.channel === filterChannel.value
    if (!byChannel) return false
    if (!keyword) return true
    const promotionTitle = promotionTitleMap.value[item.promotionId] || ''
    return item.content.toLowerCase().includes(keyword) || promotionTitle.toLowerCase().includes(keyword)
  })
})

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    const [promotionList, postList] = await Promise.all([fetchPromotions(), fetchPromotionPosts()])
    promotions.value = promotionList
    posts.value = postList
    promotionTitleMap.value = Object.fromEntries(promotionList.map((item) => [item.id, item.title]))
    if (!form.promotionId && promotionList.length > 0) {
      form.promotionId = promotionList[0].id
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || '推广文章数据加载失败'
  } finally {
    loading.value = false
  }
}

async function submitPost() {
  message.value = ''
  if (!form.promotionId || !form.content) {
    message.value = '请先选择促销位并填写推广内容'
    return
  }

  submitting.value = true
  try {
    const payload = {
      promotionId: form.promotionId,
      channel: form.channel,
      content: form.content,
      imageUrl: form.imageUrl || null
    }

    if (editingId.value) {
      await updatePromotionPost(editingId.value, payload)
      message.value = '推广文章已更新'
    } else {
      await createPromotionPost(payload)
      message.value = '推广文章已发布'
    }

    resetForm()
    await loadData()
  } catch (err: any) {
    message.value = err?.response?.data?.message || (editingId.value ? '推广文章更新失败' : '推广文章发布失败')
  } finally {
    submitting.value = false
  }
}

function startEdit(item: AdminPromotionPost) {
  editingId.value = item.id
  form.promotionId = item.promotionId
  form.channel = normalizeChannel(item.channel)
  form.content = item.content
  form.imageUrl = item.imageUrl || ''
  message.value = '已载入编辑内容'
}

function cancelEdit() {
  resetForm()
  message.value = '已取消编辑'
}

async function removePost(item: AdminPromotionPost) {
  if (!confirm(`确认删除该推广文章？\n\n${item.content.slice(0, 36)}${item.content.length > 36 ? '...' : ''}`)) return
  deletingId.value = item.id
  message.value = ''
  try {
    await deletePromotionPost(item.id)
    if (editingId.value === item.id) resetForm()
    message.value = '推广文章已删除'
    await loadData()
  } catch (err: any) {
    message.value = err?.response?.data?.message || '推广文章删除失败'
  } finally {
    deletingId.value = null
  }
}

function resetForm() {
  editingId.value = null
  form.content = ''
  form.channel = 'community'
  form.imageUrl = ''
  form.promotionId = promotions.value[0]?.id || 0
}

function clearImage() {
  form.imageUrl = ''
}

function onImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.imageUrl = String(reader.result || '')
  }
  reader.readAsDataURL(file)
}

function normalizeChannel(value: string) {
  const channel = (value || '').trim().toLowerCase()
  if (channel === 'community' || channel === 'home' || channel === 'product') return channel
  return 'community'
}

function formatDateTime(value: string | null) {
  if (!value) return '未记录'
  return value.replace('T', ' ').slice(0, 16)
}
</script>

<style scoped>
.page-head,
.editor-card,
.table-card {
  display: grid;
  gap: 14px;
}

.page-head {
  grid-template-columns: 1fr auto;
  align-items: start;
  margin-bottom: 14px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  color: #1f2937;
}

.page-desc {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.table-head,
.form-actions,
.post-actions,
.image-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.table-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.table-filters input {
  min-width: 260px;
  flex: 1;
}

.count-chip,
.channel-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
}

.card-list {
  display: grid;
  gap: 12px;
}

.post-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #e5eee7;
  background: #fbfdfb;
}

.post-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  color: #6b7280;
  font-size: 12px;
}

.post-image,
.preview-image {
  width: 100%;
  max-width: 320px;
  border-radius: 12px;
  border: 1px solid #e3ece5;
  object-fit: cover;
}

.preview-image {
  max-height: 200px;
}

.post-image {
  max-height: 180px;
}

.post-content {
  margin: 0;
  color: #374151;
  line-height: 1.7;
}

.file-btn {
  position: relative;
  cursor: pointer;
}

.file-btn input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.field-label {
  margin: 0;
  color: #4b5563;
  font-size: 13px;
  font-weight: 700;
}

.image-field {
  display: grid;
  gap: 10px;
}

.empty-state {
  padding: 28px 10px;
  text-align: center;
  color: #6b7280;
}

.error {
  color: #dc2626;
}

.message {
  margin: 0;
  color: #1f7a41;
  font-weight: 600;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.danger-btn {
  border-color: #f2cbcb;
  color: #b42318;
  background: #fff7f7;
}
</style>
