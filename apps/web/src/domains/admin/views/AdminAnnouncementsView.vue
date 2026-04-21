<template>
  <AdminLayout>
    <section class="page-head">
      <div>
        <h2 class="page-title">公告管理</h2>
        <p class="page-desc">当前列表直接读取后端公告表，发布后会同步到社区公告展示条。</p>
      </div>
      <button class="secondary-btn" @click="loadAnnouncements" :disabled="loading">
        {{ loading ? '刷新中...' : '刷新列表' }}
      </button>
    </section>

    <section class="page-lite editor-card">
      <h3>发布公告</h3>
      <input v-model.trim="form.title" placeholder="请输入公告标题" />
      <textarea v-model.trim="form.content" rows="4" placeholder="请输入公告内容"></textarea>
      <div class="form-actions">
        <button @click="submitAnnouncement" :disabled="submitting">
          {{ submitting ? '发布中...' : '发布公告' }}
        </button>
        <button class="secondary-btn" @click="resetForm" :disabled="submitting">清空</button>
      </div>
      <p v-if="message" class="message">{{ message }}</p>
    </section>

    <section class="page-lite table-card">
      <div class="table-head">
        <h3>公告列表</h3>
        <span class="count-chip">{{ announcements.length }} 条</span>
      </div>

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
import { createAnnouncement, fetchAnnouncements, type AdminAnnouncement } from '../api'

const announcements = ref<AdminAnnouncement[]>([])
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const message = ref('')

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

async function submitAnnouncement() {
  message.value = ''
  if (!form.title || !form.content) {
    message.value = '请先填写公告标题和内容'
    return
  }

  submitting.value = true
  try {
    await createAnnouncement({
      title: form.title,
      content: form.content
    })
    resetForm()
    message.value = '公告已发布'
    await loadAnnouncements()
  } catch (err: any) {
    message.value = err?.response?.data?.message || '公告发布失败'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  form.title = ''
  form.content = ''
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
.form-actions {
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
</style>
