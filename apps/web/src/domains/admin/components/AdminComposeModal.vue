<template>
  <BaseModal :open="open" title="发布官方活动" @close="$emit('close')">
    <div class="compose-form-body">
      <div class="form-field">
        <label>标题</label>
        <input v-model.trim="form.title" type="text" placeholder="请输入活动标题" />
      </div>
      <div class="form-field">
        <label>内容</label>
        <textarea v-model.trim="form.content" rows="4" placeholder="请输入活动内容..."></textarea>
      </div>
      <div class="form-field">
        <label>图片链接（可选）</label>
        <input v-model.trim="form.imageUrl" type="text" placeholder="https://..." />
      </div>
    </div>
    <template #footer>
      <button class="secondary-btn" @click="$emit('close')">取消</button>
      <button class="submit-btn" @click="handleSubmit">发布</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseModal from '../../../shared/components/BaseModal.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: { title: string; content: string; imageUrl: string | null }): void
}>()

const form = reactive({ title: '', content: '', imageUrl: '' })

watch(() => props.open, (val) => {
  if (!val) {
    form.title = ''
    form.content = ''
    form.imageUrl = ''
  }
})

function handleSubmit() {
  if (!form.title || !form.content) return
  emit('submit', {
    title: form.title,
    content: form.content,
    imageUrl: form.imageUrl || null
  })
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
.compose-form-body textarea {
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
.compose-form-body textarea:focus {
  border-color: #1f7a41;
  box-shadow: 0 0 0 3px rgba(31, 122, 65, 0.1);
  background: #fff;
}

.compose-form-body textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

.submit-btn {
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

.submit-btn:hover {
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
</style>
