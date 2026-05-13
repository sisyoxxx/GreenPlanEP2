<template>
  <BaseModal :open="open" title="发布新帖" @close="handleClose">
    <div class="compose-form-body">
      <p class="form-hint">{{ isAdmin ? '管理员发布会自动归类为"官方活动"。' : '可选分类：种植经验、求助问答、成果展示。' }}</p>
      <div class="form-field">
        <label>分类</label>
        <select v-model="draft.topic" :disabled="isAdmin">
          <option v-for="topic in topicOptions" :key="topic" :value="topic">{{ topic }}</option>
        </select>
      </div>
      <div class="form-field">
        <label>标题</label>
        <input v-model.trim="draft.title" placeholder="请输入帖子标题" />
      </div>
      <div class="form-field">
        <label>内容</label>
        <textarea v-model.trim="draft.content" rows="5" placeholder="分享你的种植经验、提出问题或展示成果..."></textarea>
      </div>
      <div class="upload-row">
        <button class="secondary-btn" @click="triggerImageUpload">📎 选择图片</button>
        <button v-if="draftImageUrl" class="secondary-btn danger-outline" @click="removeDraftImage">移除图片</button>
        <input ref="draftImageInput" class="hidden-input" type="file" accept="image/*" @change="handleDraftImageChange" />
      </div>
      <img v-if="draftImageUrl" class="draft-image-preview" :src="draftImageUrl" :alt="draftImageName || '帖子图片'" />
      <p v-if="message" class="message">{{ message }}</p>
    </div>
    <template #footer>
      <button class="secondary-btn" @click="handleClose">取消</button>
      <button class="primary-btn" @click="handleSubmit">发布</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import BaseModal from '../../../../shared/components/BaseModal.vue'
import type { TopicCategory } from '../../stores/useBuyerCommunityStore'

const props = defineProps<{
  open: boolean
  isAdmin: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: { topic: TopicCategory; title: string; content: string; imageUrl: string | null }): void
}>()

const buyerTopicOptions: TopicCategory[] = ['种植经验', '求助问答', '成果展示']

const draft = reactive<{ topic: TopicCategory; title: string; content: string }>({
  topic: '种植经验',
  title: '',
  content: ''
})
const draftImageInput = ref<HTMLInputElement | null>(null)
const draftImageUrl = ref('')
const draftImageName = ref('')
const message = ref('')

const topicOptions = computed<TopicCategory[]>(() =>
  props.isAdmin ? ['官方活动'] : buyerTopicOptions
)

watch(() => props.open, (val) => {
  if (val) {
    draft.topic = props.isAdmin ? '官方活动' : '种植经验'
    draft.title = ''
    draft.content = ''
    message.value = ''
    removeDraftImage()
  }
})

import { computed, watch } from 'vue'

function triggerImageUpload() {
  draftImageInput.value?.click()
}

async function handleDraftImageChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  removeDraftImage()
  draftImageUrl.value = await readFileAsDataUrl(file)
  draftImageName.value = file.name
}

function removeDraftImage() {
  draftImageUrl.value = ''
  draftImageName.value = ''
  if (draftImageInput.value) draftImageInput.value.value = ''
}

function handleClose() {
  emit('close')
}

function handleSubmit() {
  if (!draft.title || !draft.content) {
    message.value = '请填写标题和内容'
    return
  }
  const topic: TopicCategory = props.isAdmin
    ? '官方活动'
    : buyerTopicOptions.includes(draft.topic) ? draft.topic : '种植经验'

  emit('submit', {
    topic,
    title: draft.title,
    content: draft.content,
    imageUrl: draftImageUrl.value || null
  })
  message.value = ''
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}
</script>

<style scoped>
.compose-form-body {
  display: grid;
  gap: 14px;
}

.form-hint {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.form-field {
  display: grid;
  gap: 6px;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.compose-form-body input,
.compose-form-body textarea,
.compose-form-body select {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #d3d7de;
  background: #f8faf9;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.compose-form-body input:focus,
.compose-form-body textarea:focus,
.compose-form-body select:focus {
  border-color: #1f7a41;
  box-shadow: 0 0 0 3px rgba(31, 122, 65, 0.1);
  background: #fff;
}

.compose-form-body textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.compose-form-body select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.upload-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.draft-image-preview {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #e3ece5;
}

.primary-btn {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: #1f7a41;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.primary-btn:hover {
  background: #276749;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.secondary-btn:hover {
  background: #e8f0e8;
  border-color: #9ad3aa;
}

.danger-outline {
  border-color: #f2cbcb !important;
  color: #b42318 !important;
  background: #fff7f7 !important;
}

.danger-outline:hover {
  background: #fee2e2 !important;
}

.hidden-input {
  display: none;
}

.message {
  color: #1f7a41;
  margin: 0;
  font-size: 13px;
}
</style>
