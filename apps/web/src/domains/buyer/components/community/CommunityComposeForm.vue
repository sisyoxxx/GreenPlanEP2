<template>
  <section class="page-lite compose-panel">
    <h3>发布新帖</h3>
    <p class="muted">{{ isAdmin ? '管理员发布会自动归类为“官方活动”。' : '可选分类：种植经验、求助问答、成果展示。' }}</p>
    <select v-model="draft.topic" :disabled="isAdmin">
      <option v-for="topic in draftTopicOptions" :key="topic" :value="topic">{{ topic }}</option>
    </select>
    <input v-model.trim="draft.title" placeholder="标题" />
    <textarea v-model.trim="draft.content" rows="5" placeholder="内容"></textarea>
    <div class="upload-row">
      <button class="secondary-btn" @click="triggerImageUpload">选择图片</button>
      <button v-if="draftImageUrl" class="secondary-btn" @click="removeDraftImage">移除图片</button>
      <input ref="draftImageInput" class="hidden-input" type="file" accept="image/*" @change="handleDraftImageChange" />
    </div>
    <img v-if="draftImageUrl" class="draft-image" :src="draftImageUrl" :alt="draftImageName || '帖子图片'" />
    <div class="row">
      <button class="secondary-btn" @click="onResetClick">清空</button>
      <button @click="submitDraft">发布</button>
    </div>
    <p v-if="localError || message" class="message">{{ localError || message }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { TopicCategory } from '../../stores/useBuyerCommunityStore'

const props = defineProps<{
  isAdmin: boolean
  message: string
}>()

const emit = defineEmits<{
  submit: [data: { topic: TopicCategory; title: string; content: string; imageUrl?: string; imageAlt?: string }]
  reset: []
  imageChange: [file: File]
  removeImage: []
  triggerUpload: []
}>()

const buyerTopicOptions: TopicCategory[] = ['种植经验', '求助问答', '成果展示']

const draft = reactive({ topic: '种植经验' as TopicCategory, title: '', content: '' })
const draftImageInput = ref<HTMLInputElement | null>(null)
const draftImageUrl = ref('')
const draftImageName = ref('')
const localError = ref('')

const draftTopicOptions = computed<TopicCategory[]>(() => (props.isAdmin ? ['官方活动'] : buyerTopicOptions))

function triggerImageUpload() {
  draftImageInput.value?.click()
  emit('triggerUpload')
}

async function handleDraftImageChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  removeDraftImage()
  draftImageUrl.value = await readFileAsDataUrl(file)
  draftImageName.value = file.name
  emit('imageChange', file)
}

function removeDraftImage() {
  draftImageUrl.value = ''
  draftImageName.value = ''
  if (draftImageInput.value) draftImageInput.value.value = ''
  emit('removeImage')
}

function resetDraftInternal() {
  draft.topic = props.isAdmin ? '官方活动' : '种植经验'
  draft.title = ''
  draft.content = ''
  draftImageUrl.value = ''
  draftImageName.value = ''
  if (draftImageInput.value) draftImageInput.value.value = ''
  localError.value = ''
}

function onResetClick() {
  resetDraftInternal()
  emit('reset')
}

function submitDraft() {
  if (!draft.title || !draft.content) {
    localError.value = '请填写标题和内容'
    return
  }
  localError.value = ''
  emit('submit', {
    topic: props.isAdmin ? '官方活动' : (buyerTopicOptions.includes(draft.topic) ? draft.topic : '种植经验'),
    title: draft.title,
    content: draft.content,
    imageUrl: draftImageUrl.value || undefined,
    imageAlt: draftImageName.value || undefined
  })
  resetDraftInternal()
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
.compose-panel {
  display: grid;
  gap: 10px;
}

.compose-panel input,
.compose-panel textarea,
.compose-panel select {
  width: 100%;
}

.upload-row,
.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hidden-input {
  display: none;
}

.draft-image {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 12px;
}

.message {
  color: #1f7a41;
  margin: 0;
}

.muted {
  color: #6b7280;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}
</style>
