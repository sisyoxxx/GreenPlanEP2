<template>
  <AdminLayout>
    <div class="page-shell">
      <section class="page-lite page-head">
        <div>
          <h2 class="page-title">教程管理</h2>
          <p class="page-desc">发布、编辑和维护教程内容，支持分类与展示区位管理。</p>
        </div>
        <button class="add-btn" @click="startCreate">
          {{ editingId ? '新建教程' : showForm ? '收起表单' : '发布教程' }}
        </button>
      </section>

      <section v-if="showForm" class="page-lite form-card">
        <h3 class="form-title">{{ editingId ? '编辑教程' : '发布新教程' }}</h3>

        <div class="form-grid">
          <label>
            <span>标题</span>
            <input v-model="form.title" type="text" placeholder="请输入教程标题" />
          </label>

          <label>
            <span>标签</span>
            <input v-model="form.tag" type="text" placeholder="如：热门推荐" />
          </label>

          <label>
            <span>展示区域</span>
            <select v-model="form.displayArea">
              <option value="HOT">HOT（轮播）</option>
              <option value="LIST">LIST（列表）</option>
            </select>
          </label>

          <label>
            <span>排序</span>
            <input v-model.number="form.displayOrder" type="number" min="1" />
          </label>

          <label>
            <span>教程分类</span>
            <select v-model="form.categoryCode">
              <option value="">未分类</option>
              <option v-for="item in categoryOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>

          <label>
            <span>难度</span>
            <select v-model="form.difficulty">
              <option value="">未设置</option>
              <option value="入门">入门</option>
              <option value="中级">中级</option>
              <option value="进阶">进阶</option>
            </select>
          </label>

          <label>
            <span>阅读时长（分钟）</span>
            <input v-model.number="form.durationMinutes" type="number" min="1" placeholder="例如 8" />
          </label>

          <label>
            <span>背景样式</span>
            <input v-model="form.backgroundStyle" type="text" placeholder="linear-gradient(...)" />
          </label>
        </div>

        <label class="full-span">
          <span>教程简介</span>
          <textarea v-model="form.description" rows="4" placeholder="输入教程摘要内容"></textarea>
        </label>

        <label class="full-span media-field">
          <span>教程媒体（可选）</span>
          <div class="media-actions">
            <button class="secondary-btn" type="button" @click="triggerMediaUpload">上传图片或视频</button>
            <button v-if="form.mediaUrl" class="secondary-btn" type="button" @click="clearMedia">移除媒体</button>
            <input ref="mediaInput" class="hidden-input" type="file" accept="image/*,video/*" @change="handleMediaChange" />
          </div>
          <div v-if="form.mediaUrl" class="media-preview">
            <img v-if="form.mediaType === 'IMAGE'" :src="form.mediaUrl" alt="tutorial media" />
            <video v-else-if="form.mediaType === 'VIDEO'" :src="form.mediaUrl" controls />
            <p class="muted">当前媒体类型：{{ form.mediaType === 'VIDEO' ? '视频' : '图片' }}</p>
          </div>
        </label>

        <div class="toggle-row">
          <label class="checkbox-field">
            <input v-model="form.favoriteDefault" type="checkbox" />
            <span>默认收藏</span>
          </label>
          <label class="checkbox-field">
            <input v-model="form.published" type="checkbox" />
            <span>立即发布</span>
          </label>
        </div>

        <div class="form-actions">
          <button @click="submit" :disabled="submitting">{{ submitting ? '保存中...' : editingId ? '保存修改' : '发布教程' }}</button>
          <button class="secondary-btn" @click="cancelEdit">取消</button>
        </div>
      </section>

      <section class="page-lite list-card">
        <div class="toolbar">
          <input v-model="keyword" type="text" placeholder="搜索标题、标签、分类或简介" />
          <button class="secondary-btn" @click="reload" :disabled="loading">{{ loading ? '加载中...' : '刷新' }}</button>
        </div>

        <p v-if="message" class="message">{{ message }}</p>

        <div v-if="loading" class="empty-state">教程加载中...</div>
        <div v-else-if="filteredTutorials.length === 0" class="empty-state">没有找到符合条件的教程。</div>

        <div v-else class="tutorial-list">
          <article v-for="item in filteredTutorials" :key="item.id" class="tutorial-item">
            <div class="tutorial-top">
              <div>
                <div class="tutorial-tags">
                  <span class="badge">{{ item.displayArea }}</span>
                  <span class="badge subtle">{{ item.tag }}</span>
                  <span class="badge subtle">{{ item.difficulty || '未设置难度' }}</span>
                  <span v-if="item.mediaType" class="badge subtle">{{ item.mediaType === 'VIDEO' ? '含视频' : '含图片' }}</span>
                </div>
                <h3>{{ item.title }}</h3>
              </div>
              <span :class="['status-badge', item.published ? 'online' : 'draft']">
                {{ item.published ? '已发布' : '草稿' }}
              </span>
            </div>

            <p class="tutorial-desc">{{ item.description }}</p>

            <div class="tutorial-meta">
              <span>分类：{{ categoryLabel(item.categoryCode) }}</span>
              <span>排序：{{ item.displayOrder }}</span>
              <span>时长：{{ item.durationMinutes ? `${item.durationMinutes} 分钟` : '未设置' }}</span>
              <span>更新时间：{{ formatDate(item.updatedAt) }}</span>
            </div>

            <div class="item-actions">
              <button class="text-btn" @click="editItem(item)">编辑</button>
              <button class="text-btn danger" @click="removeItem(item)">删除</button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import {
  createTutorial,
  deleteTutorial,
  fetchAdminTutorials,
  updateTutorial,
  type AdminTutorial
} from '../api'

const categoryOptions = [
  { value: 'seed', label: '播种入门' },
  { value: 'care', label: '日常养护' },
  { value: 'pest', label: '病虫防治' },
  { value: 'advanced', label: '进阶技巧' },
  { value: 'seasonal', label: '四季指南' },
  { value: 'tool', label: '工具推荐' }
]

const loading = ref(false)
const submitting = ref(false)
const showForm = ref(false)
const editingId = ref<number | null>(null)
const keyword = ref('')
const message = ref('')
const tutorials = ref<AdminTutorial[]>([])
const mediaInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  displayArea: 'LIST',
  displayOrder: 1,
  tag: '',
  categoryCode: '',
  title: '',
  description: '',
  difficulty: '',
  durationMinutes: null as number | null,
  backgroundStyle: 'linear-gradient(135deg, #dff4e4, #b6e8c4)',
  mediaUrl: '',
  mediaType: null as 'IMAGE' | 'VIDEO' | null,
  favoriteDefault: false,
  published: true
})

const filteredTutorials = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  if (!value) return tutorials.value
  return tutorials.value.filter((item) =>
    [item.title, item.tag, item.description, item.categoryCode || '', item.difficulty || '']
      .some((text) => text.toLowerCase().includes(value))
  )
})

reload()

async function reload() {
  loading.value = true
  try {
    tutorials.value = await fetchAdminTutorials()
  } catch (err: any) {
    message.value = err?.response?.data?.message || '加载教程失败'
  } finally {
    loading.value = false
  }
}

function startCreate() {
  if (editingId.value || !showForm.value) {
    resetForm()
    showForm.value = true
    return
  }
  showForm.value = false
}

function editItem(item: AdminTutorial) {
  editingId.value = item.id
  showForm.value = true
  form.displayArea = item.displayArea
  form.displayOrder = item.displayOrder
  form.tag = item.tag
  form.categoryCode = item.categoryCode || ''
  form.title = item.title
  form.description = item.description
  form.difficulty = item.difficulty || ''
  form.durationMinutes = item.durationMinutes
  form.backgroundStyle = item.backgroundStyle || ''
  form.mediaUrl = item.mediaUrl || ''
  form.mediaType = item.mediaType || null
  form.favoriteDefault = item.favoriteDefault
  form.published = item.published
}

function cancelEdit() {
  resetForm()
  showForm.value = false
}

function resetForm() {
  editingId.value = null
  form.displayArea = 'LIST'
  form.displayOrder = 1
  form.tag = ''
  form.categoryCode = ''
  form.title = ''
  form.description = ''
  form.difficulty = ''
  form.durationMinutes = null
  form.backgroundStyle = 'linear-gradient(135deg, #dff4e4, #b6e8c4)'
  form.mediaUrl = ''
  form.mediaType = null
  form.favoriteDefault = false
  form.published = true
  if (mediaInput.value) mediaInput.value.value = ''
}

async function submit() {
  if (!form.title.trim() || !form.description.trim() || !form.tag.trim()) {
    message.value = '请先填写标题、标签和简介信息。'
    return
  }

  submitting.value = true
  message.value = ''

  const payload = {
    displayArea: form.displayArea,
    displayOrder: form.displayOrder,
    tag: form.tag.trim(),
    categoryCode: form.categoryCode.trim(),
    title: form.title.trim(),
    description: form.description.trim(),
    difficulty: form.difficulty,
    durationMinutes: form.durationMinutes,
    backgroundStyle: form.backgroundStyle.trim(),
    mediaUrl: form.mediaUrl || null,
    mediaType: form.mediaUrl ? form.mediaType : null,
    favoriteDefault: form.favoriteDefault,
    published: form.published
  }

  try {
    if (editingId.value) {
      await updateTutorial(editingId.value, payload)
      message.value = '教程已更新。'
    } else {
      await createTutorial(payload)
      message.value = '教程已发布。'
    }

    await reload()
    cancelEdit()
  } catch (err: any) {
    message.value = err?.response?.data?.message || '保存教程失败'
  } finally {
    submitting.value = false
  }
}

async function removeItem(item: AdminTutorial) {
  try {
    await deleteTutorial(item.id)
    message.value = `已删除教程：${item.title}`
    await reload()
    if (editingId.value === item.id) cancelEdit()
  } catch (err: any) {
    message.value = err?.response?.data?.message || '删除教程失败'
  }
}

function categoryLabel(code: string | null) {
  if (!code) return '未设置'
  return categoryOptions.find((item) => item.value === code)?.label || code
}

function formatDate(value: string | null) {
  if (!value) return '刚刚'
  return value.replace('T', ' ').slice(0, 16)
}

function triggerMediaUpload() {
  mediaInput.value?.click()
}

function clearMedia() {
  form.mediaUrl = ''
  form.mediaType = null
  if (mediaInput.value) mediaInput.value.value = ''
}

function handleMediaChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.mediaUrl = String(reader.result || '')
    form.mediaType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.page-shell {
  display: grid;
  gap: 16px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  border: 1px solid #dcebdd;
  background: linear-gradient(135deg, #f7fcf8, #ffffff);
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #16351f;
}

.page-desc {
  margin: 6px 0 0;
  color: #6b7280;
  line-height: 1.6;
}

.add-btn {
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  background: #80ab64;
  color: #fff;
}

.form-card,
.list-card {
  display: grid;
  gap: 14px;
}

.form-title {
  margin: 0;
  color: #16351f;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

label {
  display: grid;
  gap: 6px;
}

label span {
  font-size: 12px;
  font-weight: 700;
  color: #4b5563;
}

.full-span {
  grid-column: 1 / -1;
}

.toggle-row,
.form-actions,
.toolbar,
.tutorial-top,
.tutorial-meta,
.item-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.checkbox-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.hidden-input {
  display: none;
}

.media-field {
  display: grid;
  gap: 8px;
}

.media-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.media-preview {
  display: grid;
  gap: 8px;
}

.media-preview img,
.media-preview video {
  width: 100%;
  max-width: 360px;
  border-radius: 12px;
  border: 1px solid #e5efe7;
  object-fit: cover;
  max-height: 220px;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.toolbar {
  justify-content: space-between;
  align-items: center;
}

.toolbar input {
  flex: 1;
  min-width: 260px;
}

.message {
  margin: 0;
  color: #1f7a41;
  font-weight: 600;
}

.empty-state {
  color: #6b7280;
  padding: 20px 0 10px;
}

.tutorial-list {
  display: grid;
  gap: 12px;
}

.tutorial-item {
  display: grid;
  gap: 12px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #e5efe7;
  background: #fbfefb;
}

.tutorial-top {
  justify-content: space-between;
  align-items: start;
}

.tutorial-top h3 {
  margin: 8px 0 0;
  color: #1f2937;
}

.tutorial-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.badge {
  background: #edf9ef;
  color: #1f7a41;
}

.badge.subtle {
  background: #f4f7f4;
  color: #4b5563;
}

.status-badge.online {
  background: #dff4e4;
  color: #1f7a41;
}

.status-badge.draft {
  background: #f3f4f6;
  color: #6b7280;
}

.tutorial-desc {
  margin: 0;
  color: #6b7280;
  line-height: 1.7;
}

.tutorial-meta {
  color: #5f6d66;
  font-size: 12px;
}

.text-btn {
  border: none;
  background: transparent;
  color: #1f7a41;
  padding: 0;
}

.text-btn.danger {
  color: #dc2626;
}

@media (max-width: 1200px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .page-head,
  .toolbar,
  .tutorial-top {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
