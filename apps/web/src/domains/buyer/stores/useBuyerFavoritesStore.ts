import { defineStore } from 'pinia'

const STORAGE_KEY = 'gp2_buyer_favorites'

export interface FavoritePostSnapshot {
  id: number
  topic: string
  title: string
  content: string
  time: string
  author: string
  imageUrl?: string
  imageAlt?: string
}

interface FavoritesState {
  tutorialIds: number[]
  posts: FavoritePostSnapshot[]
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function normalizeState(raw: any): FavoritesState {
  const tutorialIds = Array.isArray(raw?.tutorialIds) ? raw.tutorialIds.filter((x: any) => Number.isFinite(Number(x))).map((x: any) => Number(x)) : []
  const posts = Array.isArray(raw?.posts) ? raw.posts : []
  return { tutorialIds, posts }
}

function persist(state: FavoritesState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const useBuyerFavoritesStore = defineStore('buyer-favorites', {
  state: (): FavoritesState => normalizeState(safeParse(localStorage.getItem(STORAGE_KEY), {})),
  getters: {
    tutorialIdSet: (state) => new Set(state.tutorialIds),
    postIdSet: (state) => new Set(state.posts.map((p) => p.id))
  },
  actions: {
    seedTutorialFavoritesIfEmpty(ids: number[]) {
      if (this.tutorialIds.length > 0) return
      const unique = Array.from(new Set((ids || []).map((x) => Number(x)).filter((x) => Number.isFinite(x))))
      this.tutorialIds = unique
      persist({ tutorialIds: this.tutorialIds, posts: this.posts })
    },
    toggleTutorial(id: number) {
      const safeId = Number(id)
      if (!Number.isFinite(safeId)) return
      const set = new Set(this.tutorialIds)
      if (set.has(safeId)) set.delete(safeId)
      else set.add(safeId)
      this.tutorialIds = Array.from(set)
      persist({ tutorialIds: this.tutorialIds, posts: this.posts })
    },
    togglePost(post: FavoritePostSnapshot) {
      const safeId = Number(post?.id)
      if (!Number.isFinite(safeId)) return
      const existed = this.posts.find((p) => p.id === safeId)
      if (existed) {
        this.posts = this.posts.filter((p) => p.id !== safeId)
      } else {
        this.posts = [
          {
            id: safeId,
            topic: String(post.topic || ''),
            title: String(post.title || ''),
            content: String(post.content || ''),
            time: String(post.time || ''),
            author: String(post.author || ''),
            imageUrl: post.imageUrl,
            imageAlt: post.imageAlt
          },
          ...this.posts
        ]
      }
      persist({ tutorialIds: this.tutorialIds, posts: this.posts })
    },
    removePost(id: number) {
      const safeId = Number(id)
      if (!Number.isFinite(safeId)) return
      this.posts = this.posts.filter((p) => p.id !== safeId)
      persist({ tutorialIds: this.tutorialIds, posts: this.posts })
    },
    clearAll() {
      this.tutorialIds = []
      this.posts = []
      persist({ tutorialIds: this.tutorialIds, posts: this.posts })
    }
  }
})

