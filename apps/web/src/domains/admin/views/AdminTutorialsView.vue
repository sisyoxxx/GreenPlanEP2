<template>
  <AdminLayout>
    <div class="page-shell">
      <section class="page-lite page-head">
        <div>
          <h2 class="page-title">教程管理</h2>
          <p class="page-desc">发布、编辑和维护教程内容，支持封面链接与详情视频配置。</p>
        </div>
        <button class="add-btn" @click="openCreate">发布教程</button>
      </section>

      <BaseModal
        :open="showForm"
        :title="editingId ? '编辑教程' : '发布教程'"
        size="lg"
        @close="cancelEdit"
      >
        <TutorialForm
          v-model:form="form"
          :is-edit="!!editingId"
          :submitting="submitting"
          :category-options="categoryOptions"
          @cover-error="message = '封面链接无法加载，请检查图片地址。'"
        />
        <template #footer>
          <button class="secondary-btn" :disabled="submitting" @click="cancelEdit">取消</button>
          <button :disabled="submitting" @click="submit">{{ submitting ? '保存中...' : (editingId ? '保存修改' : '发布教程') }}</button>
        </template>
      </BaseModal>

      <TutorialList
        :items="tutorials"
        :loading="loading"
        :category-options="categoryOptions"
        :message="message"
        @edit="editItem"
        @delete="removeItem"
        @preview="handlePreview"
        @refresh="reload"
        @reorder="handleReorder"
      />
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import BaseModal from '../../../shared/components/BaseModal.vue'
import TutorialForm from '../components/TutorialForm.vue'
import TutorialList from '../components/TutorialList.vue'
import {
  createTutorial,
  deleteTutorial,
  fetchAdminTutorials,
  swapTutorialOrder,
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
const message = ref('')
const tutorials = ref<AdminTutorial[]>([])

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
  detailVideoUrl: '',
  favoriteDefault: false,
  published: true
})

reload()

async function reload() {
  loading.value = true
  message.value = ''
  try {
    tutorials.value = await fetchAdminTutorials()
  } catch (err: any) {
    message.value = err?.response?.data?.message || '加载教程失败'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  resetForm()
  showForm.value = true
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
  form.detailVideoUrl = item.detailVideoUrl || ''
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
  form.detailVideoUrl = ''
  form.favoriteDefault = false
  form.published = true
}

async function submit() {
  if (!form.title.trim() || !form.description.trim() || !form.tag.trim()) {
    message.value = '请先填写标题、标签和简介信息。'
    return
  }

  submitting.value = true
  message.value = ''

  const coverUrl = form.mediaUrl.trim()
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
    mediaUrl: coverUrl || null,
    mediaType: coverUrl ? 'IMAGE' as const : null,
    detailVideoUrl: form.detailVideoUrl || null,
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

async function handleReorder(item: AdminTutorial, direction: 'UP' | 'DOWN') {
  message.value = ''
  try {
    await swapTutorialOrder(item.id, direction)
    message.value = '排序已更新'
    await reload()
  } catch (err: any) {
    message.value = err?.response?.data?.message || '排序更新失败'
  }
}

function handlePreview(item: AdminTutorial) {
  message.value = `预览教程：${item.title}`
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

@media (max-width: 760px) {
  .page-head {
    flex-direction: column;
  }
}
</style>
