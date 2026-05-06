<template>
  <div v-if="show" class="diary-form">
    <h3 class="form-title">{{ editingId ? '编辑日记' : '新增日记' }}</h3>
    <div class="form-layout">
      <div class="form-fields">
        <input :value="modelValue.title" @input="updateField('title', $event)" type="text" placeholder="日记标题" />
        <input :value="modelValue.plantName" @input="updateField('plantName', $event)" type="text" placeholder="作物名称" />
        <input :value="modelValue.date" @input="updateField('date', $event)" type="date" />
        <select :value="modelValue.category" @change="updateField('category', $event)">
          <option value="seedling">育苗期</option>
          <option value="growing">生长期</option>
          <option value="harvest">收获期</option>
          <option value="note">随记</option>
        </select>
        <textarea :value="modelValue.note" @input="updateField('note', $event)" placeholder="写下今天的观察..." rows="3"></textarea>
        <div class="form-actions">
          <button @click="$emit('submit')">{{ editingId ? '保存修改' : '保存' }}</button>
          <button class="secondary-btn" @click="$emit('cancel')">取消</button>
        </div>
      </div>
      <div class="upload-area" @click="triggerUpload">
        <input ref="fileInput" type="file" accept="image/*" hidden @change="onFileChange" />
        <span v-if="uploading">⏳ 上传中...</span>
        <span v-else-if="!modelValue.imageName">📷 点击上传图片</span>
        <img v-else-if="modelValue.imageName.startsWith('http') || modelValue.imageName.startsWith('/api/')" :src="modelValue.imageName" class="preview-img" />
        <span v-else>🖼️ {{ modelValue.imageName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { uploadPlantingDiaryImage } from '../../api'

interface DiaryFormData {
  title: string
  plantName: string
  category: string
  note: string
  date: string
  imageName: string
}

const props = defineProps<{
  show: boolean
  editingId: number | null
  modelValue: DiaryFormData
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: DiaryFormData): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

function triggerUpload() {
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const url = await uploadPlantingDiaryImage(file)
    emit('update:modelValue', { ...props.modelValue, imageName: url })
  } catch (err) {
    console.error('上传失败', err)
    alert('图片上传失败')
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function updateField(key: keyof DiaryFormData, event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  emit('update:modelValue', { ...props.modelValue, [key]: target.value })
}
</script>

<style scoped>
.diary-form {
  padding: 0;
}

.form-title {
  margin: 0 0 12px;
  font-size: 16px;
  color: #1f2937;
}

.form-layout {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 16px;
  align-items: start;
}

.form-fields {
  display: grid;
  gap: 10px;
}

.diary-form textarea { resize: vertical; }
.form-actions { display: flex; gap: 8px; }

.upload-area {
  min-width: 180px;
  min-height: 160px;
  height: 160px;
  border: 2px dashed #d3d7de;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #80ab64;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
  overflow: hidden;
}

.upload-area:hover { border-color: #80ab64; }

.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

@media (max-width: 760px) {
  .form-layout { grid-template-columns: 1fr; }
}
</style>
