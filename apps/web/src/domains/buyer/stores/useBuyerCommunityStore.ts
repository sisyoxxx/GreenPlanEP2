import { defineStore } from 'pinia'

const STORAGE_KEY = 'gp2_buyer_community_posts'

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
  auditStatus?: 'pending' | 'approved' | 'rejected'
  auditMessage?: string
}

function seedPosts(): CommunityPostItem[] {
  return [
    {
      id: 1,
      topic: '求助问答',
      title: '番茄幼苗徒长怎么办？',
      content: '室内育苗发现幼苗长得太高了，准备今晚补光和降温。',
      time: '今天',
      likes: 8,
      mine: false,
      author: '园艺新手A'
    },
    {
      id: 2,
      topic: '种植经验',
      title: '阳台香草一周打理清单',
      content: '薄荷、迷迭香、罗勒按这个节奏浇水和修剪更稳。',
      time: '昨天',
      likes: 14,
      mine: true,
      author: '我'
    },
    {
      id: 3,
      topic: '官方活动',
      title: '本周晒图活动开始征集',
      content: '本周社区主题是“阳台春播进度”，欢迎带图发帖参与。',
      time: '昨天',
      likes: 19,
      mine: false,
      author: '社区运营'
    },
    {
      id: 4,
      topic: '成果展示',
      title: '多肉换盆后一周状态分享',
      content: '颗粒土比例调到 7:3，根系服盆后叶片明显更饱满，已进入稳定生长期。',
      time: '2天前',
      likes: 27,
      mine: false,
      author: '肉肉实验室',
      imageUrl: 'https://images.pexels.com/photos/2156901/pexels-photo-2156901.jpeg?cs=srgb&dl=pexels-designecologist-2156901.jpg&fm=jpg',
      imageAlt: '多肉植物组合盆栽'
    },
    {
      id: 5,
      topic: '种植经验',
      title: '早晨浇水和傍晚浇水差别大吗？',
      content: '我连续两周对比记录，早晨浇水在通风好的阳台更不容易出现盆土闷湿问题。',
      time: '2天前',
      likes: 12,
      mine: false,
      author: '小阳台记录'
    },
    {
      id: 6,
      topic: '求助问答',
      title: '营养液浓度是不是调高了？叶尖有轻微焦边',
      content: '按照说明兑水后 EC 还是偏高，准备降低 15% 再观察，想听听大家经验。',
      time: '3天前',
      likes: 9,
      mine: false,
      author: '番茄在路上'
    },
    {
      id: 7,
      topic: '成果展示',
      title: '厨房窗台香草收获第一茬',
      content: '九层塔和欧芹已经可以剪来做意面了，记录一下这个月的生长对比图。',
      time: '3天前',
      likes: 33,
      mine: false,
      author: '厨房花园君',
      imageUrl: 'https://images.pexels.com/photos/305821/pexels-photo-305821.jpeg?cs=srgb&dl=pexels-marta-dzedyshko-1042863-305821.jpg&fm=jpg',
      imageAlt: '香草植物近景'
    },
    {
      id: 8,
      topic: '种植经验',
      title: '春季补肥节奏：少量多次更稳',
      content: '颗粒缓释肥搭配稀释液肥，一周一次薄肥，叶色和新芽速度都更均衡。',
      time: '4天前',
      likes: 21,
      mine: false,
      author: '阳台番茄达人',
      imageUrl: 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg?cs=srgb&dl=pexels-daria-shevtsova-4503273.jpg&fm=jpg',
      imageAlt: '花盆与园艺用品'
    }
  ]
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function normalizePost(raw: any): CommunityPostItem | null {
  const id = Number(raw?.id)
  if (!Number.isFinite(id)) return null
  const topicRaw = String(raw?.topic || '')
  const topic: TopicCategory = topicRaw === '求助问答' || topicRaw === '成果展示' || topicRaw === '官方活动' ? topicRaw : '种植经验'
  return {
    id,
    topic,
    title: String(raw?.title || ''),
    content: String(raw?.content || ''),
    time: String(raw?.time || ''),
    likes: Number.isFinite(Number(raw?.likes)) ? Number(raw.likes) : 0,
    mine: Boolean(raw?.mine),
    author: String(raw?.author || ''),
    imageUrl: raw?.imageUrl ? String(raw.imageUrl) : undefined,
    imageAlt: raw?.imageAlt ? String(raw.imageAlt) : undefined,
    auditStatus: ['pending', 'approved', 'rejected'].includes(raw?.auditStatus) ? raw.auditStatus : undefined,
    auditMessage: raw?.auditMessage ? String(raw.auditMessage) : undefined
  }
}

function loadPosts(): CommunityPostItem[] {
  const raw = safeParse<any[]>(localStorage.getItem(STORAGE_KEY), [])
  if (!Array.isArray(raw) || raw.length === 0) return seedPosts()
  const normalized = raw.map(normalizePost).filter((x): x is CommunityPostItem => !!x)
  return normalized.length > 0 ? normalized : seedPosts()
}

function persist(posts: CommunityPostItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

export const useBuyerCommunityStore = defineStore('buyer-community', {
  state: () => ({
    posts: loadPosts()
  }),
  actions: {
    addPost(post: CommunityPostItem) {
      this.posts = [post, ...this.posts]
      persist(this.posts)
    },
    likePost(postId: number) {
      const safeId = Number(postId)
      if (!Number.isFinite(safeId)) return
      const target = this.posts.find((post) => post.id === safeId)
      if (!target) return
      target.likes += 1
      persist(this.posts)
    },
    getPostById(postId: number) {
      const safeId = Number(postId)
      if (!Number.isFinite(safeId)) return null
      return this.posts.find((post) => post.id === safeId) || null
    },
    setAuditStatus(postId: number, status: 'pending' | 'approved' | 'rejected', message?: string) {
      const safeId = Number(postId)
      if (!Number.isFinite(safeId)) return
      const target = this.posts.find((post) => post.id === safeId)
      if (!target) return
      target.auditStatus = status
      if (message !== undefined) target.auditMessage = message
      persist(this.posts)
    }
  }
})
