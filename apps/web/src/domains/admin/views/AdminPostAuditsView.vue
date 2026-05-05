<template>
  <AdminLayout>
    <h2 class="page-title">帖子审核</h2>

    <div class="filter-bar page-lite">
      <div class="filter-row">
        <input v-model="search" type="text" placeholder="搜索帖子标题 / 作者 / 内容..." class="search-input" />
        <select v-model="filterTopic" class="filter-select">
          <option value="">全部话题</option>
          <option value="种植经验">种植经验</option>
          <option value="求助问答">求助问答</option>
          <option value="成果展示">成果展示</option>
          <option value="官方活动">官方活动</option>
        </select>
        <select v-model="sortBy" class="filter-select">
          <option value="newest">最新优先</option>
          <option value="oldest">最早优先</option>
          <option value="likes-high">点赞从高到低</option>
          <option value="likes-low">点赞从低到高</option>
        </select>
      </div>
      <div class="tab-bar">
        <button :class="['tab-btn', { active: filter === 'all' }]" @click="filter = 'all'">
          全部 ({{ posts.length }})
        </button>
        <button :class="['tab-btn', { active: filter === 'visible' }]" @click="filter = 'visible'">
          显示中 ({{ visibleCount }})
        </button>
        <button :class="['tab-btn', { active: filter === 'rejected' }]" @click="filter = 'rejected'">
          已打回 ({{ rejectedCount }})
        </button>
        <button :class="['tab-btn', { active: filter === 'hidden' }]" @click="filter = 'hidden'">
          已隐藏 ({{ hiddenCount }})
        </button>
      </div>
    </div>

    <div v-if="filteredPosts.length === 0" class="empty-state page-lite">
      <p class="empty-hint">暂无匹配的帖子</p>
    </div>
    <div v-else class="post-list">
      <div class="post-card page-lite" v-for="post in filteredPosts" :key="post.id">
        <div class="post-top">
          <div class="post-meta">
            <span class="post-topic">{{ post.topic }}</span>
            <span class="post-author">{{ post.author }}</span>
            <span class="post-time">{{ post.time }}</span>
          </div>
          <div class="post-badges">
            <span v-if="post.auditStatus === 'rejected'" class="status-badge rejected">已打回</span>
            <span v-if="isHidden(post.id)" class="status-badge hidden">已隐藏</span>
            <span v-if="post.auditStatus !== 'rejected' && !isHidden(post.id)" class="status-badge visible">显示中</span>
          </div>
        </div>
        <h4 class="post-title">{{ post.title }}</h4>
        <p class="post-content">{{ post.content }}</p>
        <div v-if="post.imageUrl" class="post-image">
          <img :src="post.imageUrl" :alt="post.title" />
        </div>
        <div v-if="post.auditStatus === 'rejected' && post.auditMessage" class="audit-reason">
          <strong>打回原因：</strong>{{ post.auditMessage }}
        </div>
        <div class="post-stats">
          <span>👍 {{ post.likes }}</span>
        </div>
        <div class="post-actions">
          <button v-if="post.auditStatus === 'rejected'" class="action-btn pass" @click="approvePost(post.id)">通过</button>
          <button v-else class="action-btn reject" @click="openRejectModal(post.id)">打回</button>
          <button v-if="!isHidden(post.id)" class="action-btn hide" @click="hidePost(post.id)">隐藏</button>
          <button v-else class="action-btn restore" @click="restorePost(post.id)">恢复显示</button>
        </div>
      </div>
    </div>

    <!-- 打回原因输入弹窗 -->
    <BaseModal :open="rejectModalOpen" title="打回帖子" size="sm" @close="rejectModalOpen = false">
      <div class="reject-form">
        <p class="reject-hint">请填写打回原因，将通知发帖人。</p>
        <textarea v-model.trim="rejectReason" rows="3" placeholder="例如：内容涉及广告推广，请修改后重新发布..." />
      </div>
      <template #footer>
        <div class="modal-actions">
          <button class="secondary-btn" @click="rejectModalOpen = false">取消</button>
          <button class="primary-btn" :disabled="!rejectReason" @click="confirmReject">确认打回</button>
        </div>
      </template>
    </BaseModal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import BaseModal from '../../../shared/components/BaseModal.vue'
import { fetchAdminCommunityPosts, auditCommunityPost, type AdminCommunityPost } from '../api'

const COMMUNITY_POSTS_KEY = 'gp2_buyer_community_posts'

const search = ref('')
const filterTopic = ref('')
const filter = ref<'all' | 'visible' | 'rejected' | 'hidden'>('all')
const sortBy = ref('newest')
const rejectModalOpen = ref(false)
const rejectReason = ref('')
const rejectTargetId = ref<number | null>(null)
const loading = ref(false)

const posts = ref<AdminCommunityPost[]>([])

onMounted(() => {
  loadPosts()
})

async function loadPosts() {
  loading.value = true
  try {
    const data = await fetchAdminCommunityPosts()
    posts.value = data
    // 尝试同步 localStorage 中的旧数据到后端
    await syncLocalStoragePosts()
  } catch (err: any) {
    console.error('加载帖子失败', err)
  } finally {
    loading.value = false
  }
}

async function syncLocalStoragePosts() {
  try {
    const raw = localStorage.getItem(COMMUNITY_POSTS_KEY)
    if (!raw) return
    const localPosts = JSON.parse(raw) as Array<{
      id: number
      topic: string
      title: string
      content: string
      time: string
      likes: number
      author: string
      imageUrl?: string
      auditStatus?: string
      auditMessage?: string
    }>
    if (!Array.isArray(localPosts) || localPosts.length === 0) return

    // 重新加载后端帖子列表以获取最新状态
    const backendPosts = await fetchAdminCommunityPosts()
    const backendIds = new Set(backendPosts.map((p) => p.id))

    // 将 localStorage 中不存在于后端的帖子同步上去
    // 注意：由于 ID 可能冲突，这里简单跳过已有相同 ID 的帖子
    // 实际导入需要创建新帖子，但由于没有管理端创建帖子的 API，
    // 这里只做数据迁移的提示，清空 localStorage 避免重复尝试
    const unsynced = localPosts.filter((p) => !backendIds.has(p.id))
    if (unsynced.length > 0) {
      console.warn('localStorage 中有未同步的帖子，但由于缺少管理端发帖 API，已跳过同步:', unsynced)
    }
    // 同步完成后清空 localStorage，避免重复尝试
    localStorage.removeItem(COMMUNITY_POSTS_KEY)
  } catch {
    // ignore
  }
}

const visibleCount = computed(() => posts.value.filter((p) => p.auditStatus !== 'rejected' && p.auditStatus !== 'hidden').length)
const rejectedCount = computed(() => posts.value.filter((p) => p.auditStatus === 'rejected').length)
const hiddenCount = computed(() => posts.value.filter((p) => p.auditStatus === 'hidden').length)

function isHidden(id: number) {
  const post = posts.value.find((p) => p.id === id)
  return post?.auditStatus === 'hidden'
}

const filteredPosts = computed(() => {
  let list = [...posts.value]
  if (filter.value === 'visible') list = list.filter((p) => p.auditStatus !== 'rejected' && p.auditStatus !== 'hidden')
  if (filter.value === 'rejected') list = list.filter((p) => p.auditStatus === 'rejected')
  if (filter.value === 'hidden') list = list.filter((p) => p.auditStatus === 'hidden')
  if (filterTopic.value) list = list.filter((p) => p.topic === filterTopic.value)
  if (search.value) {
    const kw = search.value.toLowerCase()
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) ||
        p.content.toLowerCase().includes(kw) ||
        p.author.toLowerCase().includes(kw)
    )
  }
  // 排序
  if (sortBy.value === 'newest') list.sort((a, b) => b.id - a.id)
  if (sortBy.value === 'oldest') list.sort((a, b) => a.id - b.id)
  if (sortBy.value === 'likes-high') list.sort((a, b) => b.likes - a.likes)
  if (sortBy.value === 'likes-low') list.sort((a, b) => a.likes - b.likes)
  return list
})

async function approvePost(postId: number) {
  try {
    await auditCommunityPost(postId, { auditStatus: 'approved', auditMessage: null })
    await loadPosts()
  } catch (err: any) {
    console.error('审核通过失败', err)
  }
}

function openRejectModal(postId: number) {
  rejectTargetId.value = postId
  rejectReason.value = ''
  rejectModalOpen.value = true
}

async function confirmReject() {
  const postId = rejectTargetId.value
  const reason = rejectReason.value.trim()
  if (!postId || !reason) return

  try {
    await auditCommunityPost(postId, { auditStatus: 'rejected', auditMessage: reason })
    await loadPosts()
    rejectModalOpen.value = false
    rejectTargetId.value = null
    rejectReason.value = ''
  } catch (err: any) {
    console.error('打回失败', err)
  }
}

async function hidePost(id: number) {
  if (!confirm('确定要隐藏这条帖子吗？买家端将不再显示。')) return
  try {
    await auditCommunityPost(id, { auditStatus: 'hidden', auditMessage: null })
    await loadPosts()
  } catch (err: any) {
    console.error('隐藏失败', err)
  }
}

async function restorePost(id: number) {
  try {
    await auditCommunityPost(id, { auditStatus: 'approved', auditMessage: null })
    await loadPosts()
  } catch (err: any) {
    console.error('恢复显示失败', err)
  }
}
</script>

<style scoped>
.page-title { margin: 0 0 14px; font-size: 22px; color: #1f2937; }

.filter-bar { display: grid; gap: 10px; margin-bottom: 14px; }
.filter-row { display: flex; gap: 8px; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 180px; padding: 8px 12px; border-radius: 8px; border: 1px solid #d3d7de; font-size: 13px; }
.filter-select { padding: 8px 10px; border-radius: 8px; border: 1px solid #d3d7de; font-size: 13px; background: #fff; }

.tab-bar { display: flex; gap: 6px; flex-wrap: wrap; }
.tab-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid #e6ece7; background: #fff; color: #374151; font-size: 13px; cursor: pointer; }
.tab-btn.active { background: #e6f4ea; color: #1f7a41; font-weight: 600; border-color: #80ab64; }

.post-list { display: grid; gap: 12px; }
.post-card { display: grid; gap: 10px; }

.post-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.post-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.post-topic { padding: 2px 8px; border-radius: 6px; background: #e6f4ea; color: #1f7a41; font-size: 12px; font-weight: 600; }
.post-author { font-size: 13px; color: #374151; font-weight: 600; }
.post-time { font-size: 12px; color: #9ca3af; }

.post-badges { display: flex; gap: 6px; flex-shrink: 0; }
.status-badge { padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.status-badge.visible { background: #d1fae5; color: #065f46; }
.status-badge.hidden { background: #fee2e2; color: #991b1b; }
.status-badge.rejected { background: #fef3c7; color: #92400e; }

.post-title { margin: 0; font-size: 16px; color: #1f2937; }
.post-content { margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6; }
.post-image img { max-width: 200px; max-height: 140px; border-radius: 8px; object-fit: cover; }
.post-stats { display: flex; gap: 12px; font-size: 13px; color: #6b7280; }

.audit-reason {
  padding: 8px 12px;
  background: #fff7ed;
  border-left: 3px solid #f59e0b;
  border-radius: 0 8px 8px 0;
  font-size: 13px;
  color: #92400e;
}
.audit-reason strong { color: #b45309; }

.post-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.action-btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  border: 1px solid;
  cursor: pointer;
  font-weight: 500;
  background: #fff;
}
.action-btn.pass { border-color: #1f7a41; color: #1f7a41; }
.action-btn.pass:hover { background: #e6f4ea; }
.action-btn.reject { border-color: #dc2626; color: #dc2626; }
.action-btn.reject:hover { background: #fef2f2; }
.action-btn.hide { border-color: #6b7280; color: #6b7280; }
.action-btn.hide:hover { background: #f3f4f6; }
.action-btn.restore { border-color: #1f7a41; color: #1f7a41; }
.action-btn.restore:hover { background: #e6f4ea; }

.reject-form { display: grid; gap: 10px; }
.reject-hint { margin: 0; font-size: 13px; color: #6b7280; }
.reject-form textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #d3d7de;
  font-size: 13px;
  resize: vertical;
}

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
.modal-actions .secondary-btn {
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 13px;
  border: 1px solid #d3d7de;
  background: #fff;
  color: #374151;
  cursor: pointer;
}
.modal-actions .primary-btn {
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 13px;
  border: none;
  background: #dc2626;
  color: #fff;
  cursor: pointer;
}
.modal-actions .primary-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.empty-state { text-align: center; padding: 30px; }
.empty-hint { color: #9ca3af; margin: 0; }
</style>
