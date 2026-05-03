<template>
  <AdminLayout>
    <section class="page-head">
      <div>
        <h2 class="page-title">公告管理</h2>
        <p class="page-desc">已发布公告支持编辑与删除，修改后会同步到前台公告展示。</p>
      </div>
      <div class="head-actions">
        <button class="secondary-btn" @click="loadAnnouncements" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新列表' }}
        </button>
        <button @click="openCreate">发布公告</button>
      </div>
    </section>

    <BaseModal
      :open="showForm"
      :title="editingId ? '编辑公告' : '发布公告'"
      size="lg"
      @close="cancelEdit"
    >
      <div class="modal-form">
        <input v-model.trim="form.title" placeholder="请输入公告标题" />
        <textarea v-model.trim="form.content" rows="4" placeholder="请输入公告内容"></textarea>
        <p v-if="message" class="message">{{ message }}</p>
      </div>
      <template #footer>
        <button class="secondary-btn" @click="cancelEdit" :disabled="submitting">取消</button>
        <button @click="submitAnnouncement" :disabled="submitting">
          {{ submitting ? '提交中...' : editingId ? '保存修改' : '发布公告' }}
        </button>
      </template>
    </BaseModal>

    <section class="page-lite table-card">
      <div class="table-head">
        <h3>公告列表</h3>
        <span class="count-chip">{{ announcements.length }} 条</span>
      </div>
      <p v-if="message && !showForm" class="message">{{ message }}</p>

      <div v-if="loading && announcements.length === 0" class="empty-state">公告加载中...</div>
      <div v-else-if="error" class="empty-state error">{{ error }}</div>
      <div v-else-if="announcements.length === 0" class="empty-state">暂无公告数据</div>

      <div v-else class="table-wrap">
        <table class="ann-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>内容</th>
              <th>状态</th>
              <th>发布时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in announcements" :key="item.id">
              <td class="cell-title">{{ item.title }}</td>
              <td class="cell-content">{{ item.content }}</td>
              <td>
                <span class="status-badge">{{ item.status }}</span>
              </td>
              <td class="cell-time">{{ formatDateTime(item.publishedAt || item.createdAt) }}</td>
              <td>
                <div v-if="item.status === 'PUBLISHED'" class="row-actions">
                  <button class="text-link" @click="startEdit(item)" :disabled="submitting || deletingId === item.id">编辑</button>
                  <button class="text-link danger" @click="removeAnnouncement(item)" :disabled="submitting || deletingId === item.id">
                    {{ deletingId === item.id ? '删除中...' : '删除' }}
                  </button>
                </div>
                <span v-else class="cell-time">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import BaseModal from '../../../shared/components/BaseModal.vue'
import {
  createAnnouncement,
  deleteAnnouncement,
  fetchAnnouncements,
  type AdminAnnouncement,
  updateAnnouncement
} from '../api'
import { formatDateTime } from '../../../utils/format'

const announcements = ref<AdminAnnouncement[]>([])
const loading = ref(false)
const submitting = ref(false)
const deletingId = ref<number | null>(null)
const editingId = ref<number | null>(null)
const error = ref('')
const message = ref('')
const showForm = ref(false)

const form = reactive({
  title: '',
  content: ''
})

onMounted(() => {
  loadAnnouncements()
})

async function loadAnnouncements() {
  loading.value = true
  error.value = ''

  try {
    announcements.value = await fetchAnnouncements()
  } catch (err: any) {
    error.value = err?.response?.data?.message || '公告数据加载失败'
  } finally {
    loading.value = false
  }
}

function startEdit(item: AdminAnnouncement) {
  if (item.status !== 'PUBLISHED') {
    message.value = '只有已发布公告支持编辑'
    return
  }
  editingId.value = item.id
  form.title = item.title
  form.content = item.content
  message.value = ''
  showForm.value = true
}

async function submitAnnouncement() {
  message.value = ''
  if (!form.title || !form.content) {
    message.value = '请先填写公告标题和内容'
    return
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await updateAnnouncement(editingId.value, {
        title: form.title,
        content: form.content
      })
      message.value = '公告已更新'
    } else {
      await createAnnouncement({
        title: form.title,
        content: form.content
      })
      message.value = '公告已发布'
    }
    cancelEdit()
    await loadAnnouncements()
  } catch (err: any) {
    message.value = err?.response?.data?.message || (editingId.value ? '公告更新失败' : '公告发布失败')
  } finally {
    submitting.value = false
  }
}

async function removeAnnouncement(item: AdminAnnouncement) {
  if (item.status !== 'PUBLISHED') {
    message.value = '只有已发布公告支持删除'
    return
  }

  const ok = window.confirm(`确认删除公告「${item.title}」吗？`)
  if (!ok) return

  deletingId.value = item.id
  message.value = ''
  try {
    await deleteAnnouncement(item.id)
    message.value = '公告已删除'
    if (editingId.value === item.id) cancelEdit()
    await loadAnnouncements()
  } catch (err: any) {
    message.value = err?.response?.data?.message || '公告删除失败'
  } finally {
    deletingId.value = null
  }
}

function openCreate() {
  resetForm()
  showForm.value = true
}

function cancelEdit() {
  resetForm()
  showForm.value = false
}

function resetForm() {
  editingId.value = null
  form.title = ''
  form.content = ''
  message.value = ''
}



</script>

<style scoped>
.page-head,
.editor-card,
.table-card {
  display: grid;
  gap: 14px;
}

.head-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-form {
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
.row-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.count-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
}

.table-wrap {
  overflow-x: auto;
}

.ann-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.ann-table th,
.ann-table td {
  padding: 12px;
  border-bottom: 1px solid #eef2ef;
  text-align: left;
  vertical-align: top;
}

.ann-table th {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

.cell-title {
  min-width: 180px;
  font-weight: 700;
  color: #1f2937;
}

.cell-content {
  min-width: 360px;
  color: #4b5563;
  line-height: 1.7;
}

.cell-time {
  white-space: nowrap;
  color: #6b7280;
}

.status-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dff5e4;
  color: #166534;
  font-size: 12px;
  font-weight: 700;
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

.text-link {
  border: none;
  background: transparent;
  color: #1f7a41;
  padding: 0;
  font-size: 13px;
}

.text-link.danger {
  color: #dc2626;
}
</style>