import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchCommunityPosts,
  fetchCommunityPostDetail,
  createCommunityPost,
  toggleLikePost,
  toggleFavoritePost,
  createCommunityComment,
  type CommunityPost,
  type CommunityComment
} from '../api'

export type TopicCategory = '种植经验' | '求助问答' | '成果展示' | '官方活动'

export interface CommunityPostItem {
  id: number
  topic: TopicCategory
  title: string
  content: string
  time: string
  likes: number
  mine: boolean
  author: string
  imageUrl?: string
  imageAlt?: string
  liked?: boolean
  favorited?: boolean
  auditStatus?: 'pending' | 'approved' | 'rejected'
  auditMessage?: string
}

function normalizePost(raw: any): CommunityPostItem | null {
  const id = Number(raw?.id)
  if (!Number.isFinite(id)) return null
  const topicRaw = String(raw?.topic || '')
  const topic: TopicCategory =
    topicRaw === '求助问答' || topicRaw === '成果展示' || topicRaw === '官方活动'
      ? topicRaw
      : '种植经验'
  return {
    id,
    topic,
    title: String(raw?.title || ''),
    content: String(raw?.content || ''),
    time: String(raw?.time || ''),
    likes: Number.isFinite(Number(raw?.likes)) ? Number(raw.likes) : 0,
    mine: Boolean(raw?.mine),
    liked: Boolean(raw?.liked),
    favorited: Boolean(raw?.favorited),
    author: String(raw?.author || ''),
    imageUrl: raw?.imageUrl ? String(raw.imageUrl) : undefined,
    imageAlt: raw?.imageAlt ? String(raw.imageAlt) : undefined,
    auditStatus: ['pending', 'approved', 'rejected'].includes(raw?.auditStatus)
      ? raw.auditStatus
      : undefined,
    auditMessage: raw?.auditMessage ? String(raw.auditMessage) : undefined
  }
}

export const useBuyerCommunityStore = defineStore('buyer-community', () => {
  const posts = ref<CommunityPostItem[]>([])
  const loading = ref(false)
  const error = ref('')

  async function loadPosts() {
    loading.value = true
    error.value = ''
    try {
      const data = await fetchCommunityPosts()
      posts.value = data.map(normalizePost).filter((x): x is CommunityPostItem => !!x)
    } catch (err: any) {
      error.value = err?.response?.data?.message || '加载社区帖子失败'
    } finally {
      loading.value = false
    }
  }

  async function addPost(payload: { topic: string; title: string; content: string; imageUrl?: string | null }) {
    await createCommunityPost(payload)
    await loadPosts()
  }

  async function likePost(postId: number) {
    const safeId = Number(postId)
    if (!Number.isFinite(safeId)) return
    try {
      const result = await toggleLikePost(safeId)
      const target = posts.value.find((p) => p.id === safeId)
      if (target) {
        target.likes = result.likeCount
        target.liked = result.liked
      }
    } catch (err: any) {
      console.error('点赞失败', err)
    }
  }

  async function favoritePost(postId: number) {
    const safeId = Number(postId)
    if (!Number.isFinite(safeId)) return
    try {
      const result = await toggleFavoritePost(safeId)
      const target = posts.value.find((p) => p.id === safeId)
      if (target) {
        target.favorited = result.favorited
      }
    } catch (err: any) {
      console.error('收藏失败', err)
    }
  }

  function getPostById(postId: number): CommunityPostItem | null {
    const safeId = Number(postId)
    if (!Number.isFinite(safeId)) return null
    return posts.value.find((post) => post.id === safeId) || null
  }

  function setAuditStatus(
    postId: number,
    status: 'pending' | 'approved' | 'rejected',
    message?: string
  ) {
    const safeId = Number(postId)
    if (!Number.isFinite(safeId)) return
    const target = posts.value.find((post) => post.id === safeId)
    if (!target) return
    target.auditStatus = status
    if (message !== undefined) target.auditMessage = message
  }

  return {
    posts,
    loading,
    error,
    loadPosts,
    addPost,
    likePost,
    getPostById,
    setAuditStatus,
    favoritePost
  }
})

export type { CommunityPost, CommunityComment }
