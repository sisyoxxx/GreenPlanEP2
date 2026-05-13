<template>
  <BaseModal :open="open" title="编辑帖子" @close="handleClose">
    <div class="compose-form-body">
      <div class="form-field">
        <label>分类</label>
        <select v-model="editDraft.topic">
          <option v-for="topic in buyerTopicOptions" :key="topic" :value="topic">{{ topic }}</option>
        </select>
      </div>
      <div class="form-field">
        <label>标题</label>
        <input v-model.trim="editDraft.title" placeholder="请输入帖子标题" />
      </div>
      <div class="form-field">
        <label>内容</label>
        <textarea v-model.trim="editDraft.content" rows="5" placeholder="分享你的种植经验、提出问题或展示成果..."></textarea>
      </div>
      <p v-if="message" class="message">{{ message }}</p>
    </div>
    <template #footer>
      <button class="secondary-btn" @click="handleClose">取消</button>
      <button class="primary-btn" @click="handleSubmit">保存</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import BaseModal from '../../../../shared/components/BaseModal.vue'
import type { CommunityPostItem, TopicCategory } from '../../stores/useBuyerCommunityStore'

const props = defineProps<{
  open: boolean
  post: CommunityPostItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', id: number, payload: { topic: TopicCategory; title: string; content: string; imageUrl: string | null }): void
}>()

const buyerTopicOptions: TopicCategory[] = ['种植经验', '求助问答', '成果展示']

const editDraft = reactive<{ topic: TopicCategory; title: string; content: string; imageUrl: string }>({
  topic: '种植经验',
  title: '',
  content: '',
  imageUrl: ''
})
const message = ref('')

watch(() => props.post, (post) => {
  if (post) {
    editDraft.topic = post.topic
    editDraft.title = post.title
    editDraft.content = post.content
    editDraft.imageUrl = post.imageUrl || ''
    message.value = ''
  } else {
    editDraft.title = ''
    editDraft.content = ''
    editDraft.imageUrl = ''
    message.value = ''
  }
}, { immediate: true })

function handleClose() {
  emit('close')
}

function handleSubmit() {
  if (!editDraft.title || !editDraft.content) {
    message.value = '请填写标题和内容'
    return
  }
  if (!props.post) return
  emit('submit', props.post.id, {
    topic: editDraft.topic,
    title: editDraft.title,
    content: editDraft.content,
    imageUrl: editDraft.imageUrl || null
  })
  message.value = ''
}
</script>

<style scoped>
.compose-form-body {
  display: grid;
  gap: 14px;
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

.message {
  color: #1f7a41;
  margin: 0;
  font-size: 13px;
}
</style>
