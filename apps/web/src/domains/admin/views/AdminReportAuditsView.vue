<template>
  <AdminLayout>
    <h2 class="page-title">举报审核</h2>

    <div class="filter-bar page-lite">
      <div class="filter-row">
        <input v-model="search" type="text" placeholder="搜索举报内容 / 作者..." class="search-input" />
      </div>
      <div class="tab-bar">
        <button :class="['tab-btn', { active: filter === 'pending' }]" @click="filter = 'pending'">
          待处理 ({{ pendingCount }})
        </button>
        <button :class="['tab-btn', { active: filter === 'resolved' }]" @click="filter = 'resolved'">
          已处理 ({{ resolvedCount }})
        </button>
        <button :class="['tab-btn', { active: filter === 'all' }]" @click="filter = 'all'">
          全部 ({{ reports.length }})
        </button>
      </div>
    </div>

    <div v-if="filteredReports.length === 0" class="empty-state page-lite">
      <p class="empty-hint">{{ filter === 'pending' ? '暂无待处理的举报' : '暂无举报记录' }}</p>
    </div>
    <div v-else class="report-list">
      <div class="report-card page-lite" v-for="r in filteredReports" :key="r.id">
        <div class="report-top">
          <div class="report-info">
            <span class="report-id">#{{ r.id }}</span>
            <span class="report-time">{{ r.createdAt }}</span>
          </div>
          <span :class="['status-badge', r.status]">
            {{ statusText(r.status) }}
          </span>
        </div>

        <div class="report-context">
          <div class="context-row">
            <span class="context-label">所属帖子：</span>
            <span class="context-value">{{ r.postTitle }}</span>
          </div>
          <div class="context-row">
            <span class="context-label">评论作者：</span>
            <span class="context-value">{{ r.commentAuthor }}</span>
          </div>
          <div v-if="r.reason" class="context-row">
            <span class="context-label">举报原因：</span>
            <span class="context-value reason">{{ r.reason }}</span>
          </div>
        </div>

        <div class="comment-preview">
          <div class="comment-label">被举报内容</div>
          <p class="comment-text">{{ r.commentContent }}</p>
        </div>

        <div v-if="r.status === 'PENDING'" class="report-actions">
          <button class="action-btn pass" @click="resolveReport(r.id, 'RESOLVED')">通过（隐藏评论）</button>
          <button class="action-btn reject" @click="resolveReport(r.id, 'REJECTED')">拒绝（忽略举报）</button>
        </div>
        <div v-else class="report-result">
          处理结果：<span :class="r.status === 'RESOLVED' ? 'result-pass' : 'result-reject'">{{ r.status === 'RESOLVED' ? '已通过，评论已隐藏' : '已拒绝，举报被忽略' }}</span>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'

const REPORT_STORAGE_KEY = 'gp2_reported_comments'
const HIDDEN_COMMENTS_KEY = 'gp2_admin_hidden_comment_ids'

type ReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED'

interface ReportItem {
  id: number
  commentId: number
  postId: number
  postTitle: string
  commentAuthor: string
  commentContent: string
  reason: string
  status: ReportStatus
  createdAt: string
}

const search = ref('')
const filter = ref<'all' | 'pending' | 'resolved'>('pending')

function loadReports(): ReportItem[] {
  try {
    const raw = localStorage.getItem(REPORT_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ReportItem[]
  } catch {
    return []
  }
}

function saveReports(list: ReportItem[]) {
  localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(list))
}

function loadHiddenComments(): Set<number> {
  try {
    const raw = localStorage.getItem(HIDDEN_COMMENTS_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as number[])
  } catch {
    return new Set()
  }
}

function saveHiddenComments(set: Set<number>) {
  localStorage.setItem(HIDDEN_COMMENTS_KEY, JSON.stringify([...set]))
}

const reports = ref<ReportItem[]>(loadReports())

const pendingCount = computed(() => reports.value.filter((r) => r.status === 'PENDING').length)
const resolvedCount = computed(() => reports.value.filter((r) => r.status !== 'PENDING').length)

function statusText(status: ReportStatus) {
  if (status === 'PENDING') return '待处理'
  if (status === 'RESOLVED') return '已通过'
  return '已拒绝'
}

const filteredReports = computed(() => {
  let list = [...reports.value]
  if (filter.value === 'pending') list = list.filter((r) => r.status === 'PENDING')
  if (filter.value === 'resolved') list = list.filter((r) => r.status !== 'PENDING')
  if (search.value) {
    const kw = search.value.toLowerCase()
    list = list.filter(
      (r) =>
        r.commentContent.toLowerCase().includes(kw) ||
        r.commentAuthor.toLowerCase().includes(kw) ||
        r.postTitle.toLowerCase().includes(kw) ||
        r.reason.toLowerCase().includes(kw)
    )
  }
  // 默认按时间倒序
  return list.sort((a, b) => b.id - a.id)
})

function resolveReport(id: number, status: ReportStatus) {
  const report = reports.value.find((r) => r.id === id)
  if (!report) return

  if (status === 'RESOLVED') {
    if (!confirm('确定要通过这条举报吗？该评论将在社区中被隐藏。')) return
    const hidden = loadHiddenComments()
    hidden.add(report.commentId)
    saveHiddenComments(hidden)
  } else {
    if (!confirm('确定要拒绝这条举报吗？该评论将继续显示。')) return
  }

  report.status = status
  saveReports(reports.value)
}
</script>

<style scoped>
.page-title { margin: 0 0 14px; font-size: 22px; color: #1f2937; }

.filter-bar { display: grid; gap: 10px; margin-bottom: 14px; }
.filter-row { display: flex; gap: 8px; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 180px; padding: 8px 12px; border-radius: 8px; border: 1px solid #d3d7de; font-size: 13px; }

.tab-bar { display: flex; gap: 6px; }
.tab-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid #e6ece7; background: #fff; color: #374151; font-size: 13px; cursor: pointer; }
.tab-btn.active { background: #e6f4ea; color: #1f7a41; font-weight: 600; border-color: #80ab64; }

.report-list { display: grid; gap: 12px; }
.report-card { display: grid; gap: 10px; }

.report-top { display: flex; justify-content: space-between; align-items: center; }
.report-info { display: flex; align-items: center; gap: 10px; }
.report-id { font-size: 13px; color: #9ca3af; font-weight: 600; }
.report-time { font-size: 12px; color: #9ca3af; }

.status-badge { padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.status-badge.PENDING { background: #fef3c7; color: #92400e; }
.status-badge.RESOLVED { background: #d1fae5; color: #065f46; }
.status-badge.REJECTED { background: #e5e7eb; color: #374151; }

.report-context { display: grid; gap: 4px; }
.context-row { display: flex; gap: 6px; font-size: 13px; }
.context-label { color: #6b7280; flex-shrink: 0; }
.context-value { color: #1f2937; font-weight: 500; }
.context-value.reason { color: #dc2626; }

.comment-preview {
  padding: 10px 12px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #80ab64;
}
.comment-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
.comment-text { margin: 0; font-size: 14px; color: #374151; line-height: 1.5; }

.report-actions { display: flex; gap: 10px; }
.action-btn { padding: 7px 16px; border-radius: 8px; font-size: 13px; border: none; cursor: pointer; font-weight: 500; }
.action-btn.pass { background: #1f7a41; color: #fff; }
.action-btn.pass:hover { background: #166534; }
.action-btn.reject { background: #fff; color: #374151; border: 1px solid #d3d7de; }
.action-btn.reject:hover { background: #f3f4f6; }

.report-result { font-size: 13px; color: #6b7280; }
.result-pass { color: #065f46; font-weight: 600; }
.result-reject { color: #374151; font-weight: 600; }

.empty-state { text-align: center; padding: 30px; }
.empty-hint { color: #9ca3af; margin: 0; }
</style>
