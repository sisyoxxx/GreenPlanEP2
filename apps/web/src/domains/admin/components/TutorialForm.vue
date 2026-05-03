<template>
  <section class="page-lite form-card">
    <h3 class="form-title">{{ isEdit ? '编辑教程' : '发布新教程' }}</h3>

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
          <option value="HOT">HOT（热门）</option>
          <option value="LIST">LIST（列表）</option>
        </select>
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
      <span>封面图片链接（可选）</span>
      <input v-model.trim="form.mediaUrl" type="text" placeholder="https://..." />
      <p class="muted">教程卡片和详情封面将使用该图片链接展示。</p>
    </label>

    <label class="full-span media-field">
      <span>详情页视频（可选，本地上传）</span>
      <div class="media-actions">
        <button class="secondary-btn" type="button" @click="triggerVideoUpload">上传本地视频</button>
        <button v-if="form.detailVideoUrl" class="secondary-btn" type="button" @click="clearDetailVideo">移除视频</button>
        <input ref="videoInput" class="hidden-input" type="file" accept="video/*" @change="handleVideoChange" />
      </div>
      <p class="muted">上传后将作为详情页“视频讲解”内容展示。</p>
    </label>

    <div v-if="form.mediaUrl || form.detailVideoUrl" class="media-preview-grid">
      <div v-if="form.mediaUrl" class="media-preview">
        <strong>封面预览</strong>
        <img :src="form.mediaUrl" alt="cover preview" @error="onCoverError" />
      </div>
      <div v-if="form.detailVideoUrl" class="media-preview">
        <strong>视频预览</strong>
        <video :src="form.detailVideoUrl" controls />
      </div>
    </div>

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
      <button @click="emit('submit')" :disabled="submitting">{{ submitting ? '保存中...' : isEdit ? '保存修改' : '发布教程' }}</button>
      <button class="secondary-btn" @click="emit('cancel')">取消</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

export interface TutorialFormData {
  displayArea: string
  displayOrder: number
  tag: string
  categoryCode: string
  title: string
  description: string
  difficulty: string
  durationMinutes: number | null
  backgroundStyle: string
  mediaUrl: string
  detailVideoUrl: string
  favoriteDefault: boolean
  published: boolean
}

export interface CategoryOption {
  value: string
  label: string
}

const form = defineModel<TutorialFormData>('form', { required: true })

const props = defineProps<{
  isEdit: boolean
  submitting: boolean
  categoryOptions: CategoryOption[]
}>()

const emit = defineEmits<{
  submit: []
  cancel: []
  'cover-error': []
}>()

const videoInput = ref<HTMLInputElement | null>(null)

watch(
  () => form.value.detailVideoUrl,
  (val) => {
    if (!val && videoInput.value) {
      videoInput.value.value = ''
    }
  }
)

function triggerVideoUpload() {
  videoInput.value?.click()
}

function clearDetailVideo() {
  form.value.detailVideoUrl = ''
  if (videoInput.value) videoInput.value.value = ''
}

function handleVideoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.value.detailVideoUrl = String(reader.result || '')
  }
  reader.readAsDataURL(file)
}

function onCoverError() {
  emit('cover-error')
}
</script>

<style scoped>
.form-card {
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
.form-actions {
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

.media-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.media-preview {
  display: grid;
  gap: 8px;
}

.media-preview strong {
  font-size: 12px;
  color: #4b5563;
}

.media-preview img,
.media-preview video {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #e5efe7;
  object-fit: cover;
  max-height: 220px;
}

.muted {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

@media (max-width: 1200px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
