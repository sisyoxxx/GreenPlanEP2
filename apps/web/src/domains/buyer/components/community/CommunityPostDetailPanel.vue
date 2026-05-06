<template>
  <div class="detail-panel">
    <div v-if="post" class="detail-card page-lite">
      <div class="detail-top">
        <div class="detail-header-row">
          <button class="secondary-btn" @click="emitClose">关闭</button>
          <div class="meta-line">
            <span class="tag">{{ post.topic }}</span>
            <span class="muted">{{ post.time }}</span>
            <span class="muted">作者：{{ post.author }}</span>
          </div>
        </div>
      </div>

      <h1>{{ post.title }}</h1>

      <img v-if="post.imageUrl" class="cover" :src="post.imageUrl" :alt="post.imageAlt || post.title" />

      <article class="content">{{ post.content }}</article>

      <div class="actions">
        <button class="secondary-btn" :class="{ active: post.liked }" @click="like(post.id)">
          <span class="icon-like">{{ post.liked ? '♥' : '♡' }}</span> {{ post.likes }}
        </button>
        <button class="secondary-btn" :class="{ active: favoritePostIdSet.has(post.id) }" @click="toggleFavorite(post)">
          <span class="icon-fav">{{ favoritePostIdSet.has(post.id) ? '★' : '☆' }}</span>
        </button>
      </div>

      <section class="comment-panel">
        <h3>评论区（{{ postComments.length }}）</h3>

        <div v-if="replyTarget" class="reply-tip">
          回复 @{{ replyTarget.author }}
          <button class="text-btn" @click="cancelReply">取消</button>
        </div>

        <div class="comment-editor">
          <textarea
            v-model.trim="commentDraft"
            rows="3"
            :placeholder="replyTarget ? `回复 ${replyTarget.author}...` : '说点什么，参与讨论吧...'"
          />
          <button class="secondary-btn" :disabled="!commentDraft" @click="submitComment">发布评论</button>
        </div>

        <div v-if="loadingComments" class="muted">加载评论中...</div>
        <div v-else-if="rootComments.length === 0" class="muted">还没有评论，来发布第一条吧。</div>

        <div v-else class="comment-list">
          <article v-for="comment in rootComments" :key="comment.id" class="comment-item">
            <div class="comment-head">
              <strong>{{ comment.author }}</strong>
              <span class="muted">{{ comment.time }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
            <button class="text-btn" @click="startReply(comment)">回复</button>

            <div v-if="getReplies(comment.id).length > 0" class="reply-list">
              <article v-for="reply in getReplies(comment.id)" :key="reply.id" class="reply-item">
                <div class="comment-head">
                  <strong>{{ reply.author }}</strong>
                  <span class="muted">{{ reply.time }}</span>
                </div>
                <p class="comment-content">{{ reply.content }}</p>
                <button class="text-btn" @click="startReply(reply)">回复</button>
              </article>
            </div>
          </article>
        </div>
      </section>
    </div>

    <div v-else class="detail-card page-lite">
      <h2>帖子不存在或已删除</h2>
      <p class="muted">请返回社区列表重新选择帖子。</p>
      <button class="secondary-btn" @click="emitClose">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useBuyerFavoritesStore } from '../../stores/useBuyerFavoritesStore'
import { useBuyerCommunityStore, type CommunityPostItem } from '../../stores/useBuyerCommunityStore'
import { fetchCommunityPostDetail, createCommunityComment, type CommunityComment } from '../../api'

type PostComment = {
  id: number
  postId: number
  parentId: number | null
  author: string
  content: string
  time: string
}

const props = defineProps<{ postId: number }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const favoritesStore = useBuyerFavoritesStore()
const communityStore = useBuyerCommunityStore()

const commentDraft = ref('')
const comments = ref<PostComment[]>([])
const replyTarget = ref<PostComment | null>(null)
const loadingComments = ref(false)

const post = computed(() => communityStore.getPostById(props.postId))
const favoritePostIdSet = computed(() => favoritesStore.postIdSet)
const postComments = computed(() => comments.value.filter((item) => item.postId === props.postId))
const rootComments = computed(() => postComments.value.filter((item) => item.parentId === null))

watch(() => props.postId, () => {
  replyTarget.value = null
  commentDraft.value = ''
  loadComments()
})

onMounted(() => {
  loadComments()
})

async function loadComments() {
  const id = props.postId
  if (!Number.isFinite(id)) return
  loadingComments.value = true
  try {
    const detail = await fetchCommunityPostDetail(id)
    comments.value = (detail.comments || []).map((c: CommunityComment) => ({
      id: c.id,
      postId: c.postId,
      parentId: c.parentId,
      author: c.author,
      content: c.content,
      time: c.time
    }))
  } catch {
    comments.value = []
  } finally {
    loadingComments.value = false
  }
}

function emitClose() {
  emit('close')
}

function like(id: number) {
  communityStore.likePost(id)
}

function toggleFavorite(item: CommunityPostItem) {
  favoritesStore.togglePost({
    id: item.id,
    topic: item.topic,
    title: item.title,
    content: item.content,
    time: item.time,
    author: item.author,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt
  })
}

async function submitComment() {
  const currentPost = post.value
  const content = commentDraft.value.trim()
  if (!currentPost || !content) return

  try {
    await createCommunityComment(currentPost.id, {
      content,
      parentCommentId: replyTarget.value?.id ?? null
    })
    await loadComments()
    commentDraft.value = ''
    replyTarget.value = null
  } catch (err: any) {
    console.error('评论发布失败', err)
  }
}

function startReply(comment: PostComment) {
  replyTarget.value = comment
}

function cancelReply() {
  replyTarget.value = null
}

function getReplies(commentId: number) {
  return postComments.value.filter((item) => item.parentId === commentId)
}
</script>

<style scoped>
.detail-panel {
  height: calc(100vh - 108px);
  overflow-y: auto;
  min-width: 0;
}

.detail-card {
  display: grid;
  gap: 14px;
}

.detail-top {
  display: grid;
  gap: 10px;
}

.detail-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.meta-line {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.tag {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  font-weight: 700;
  font-size: 12px;
}

.cover {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: 14px;
}

.content {
  margin: 0;
  color: #374151;
  line-height: 1.9;
  white-space: pre-wrap;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.comment-panel {
  display: grid;
  gap: 10px;
  border-top: 1px solid #e7ede8;
  padding-top: 12px;
}

.reply-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1d5b36;
}

.comment-editor {
  display: grid;
  gap: 8px;
}

.comment-editor textarea {
  width: 100%;
  border: 1px solid #d8e2da;
  border-radius: 10px;
  padding: 10px;
  resize: vertical;
}

.comment-list {
  display: grid;
  gap: 10px;
}

.comment-item,
.reply-item {
  border: 1px solid #e7efe8;
  border-radius: 10px;
  padding: 10px;
  display: grid;
  gap: 6px;
}

.reply-list {
  display: grid;
  gap: 8px;
  padding-left: 14px;
  border-left: 2px solid #e4efe6;
}

.comment-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.comment-content {
  margin: 0;
  color: #374151;
  line-height: 1.7;
  white-space: pre-wrap;
}

.text-btn {
  border: none;
  background: transparent;
  color: #1f7a41;
  font-weight: 700;
  width: fit-content;
  padding: 0;
  cursor: pointer;
}

.muted {
  color: #6b7280;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 10px;
}

.secondary-btn.active {
  border-color: #9ad3aa;
  background: #edf9ef;
  color: #1f7a41;
}

.icon-like {
  color: #e74c3c;
}

.icon-fav {
  color: #f39c12;
}

h1 {
  margin: 0;
  font-size: 18px;
  line-height: 1.4;
}

h2 {
  margin: 0;
  font-size: 16px;
}

h3 {
  margin: 0;
  font-size: 15px;
}

@media (max-width: 900px) {
  .detail-panel {
    height: auto;
    overflow: visible;
  }
}
</style>
