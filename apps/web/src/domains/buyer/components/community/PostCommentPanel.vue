<template>
  <section class="comment-panel">
    <h3>评论区（{{ comments.length }}）</h3>

    <div v-if="replyTarget" class="reply-tip">
      回复 @{{ replyTarget.author }}
      <button class="text-btn" @click="cancelReply">取消</button>
    </div>

    <div class="comment-editor-compact">
      <textarea
        v-model.trim="draft"
        rows="2"
        :placeholder="replyTarget ? `回复 ${replyTarget.author}...` : '说点什么，参与讨论吧...'"
      />
      <button class="submit-btn" :disabled="!draft" @click="submit">发布</button>
    </div>

    <div v-if="rootComments.length === 0" class="muted">还没有评论，来发布第一条吧。</div>

    <div v-else class="comment-list-compact">
      <div v-for="comment in rootComments" :key="comment.id" class="comment-row">
        <div class="comment-row-head">
          <strong>{{ comment.author }}</strong>
          <span class="comment-time">{{ comment.time }}</span>
        </div>
        <p class="comment-row-content">{{ comment.content }}</p>
        <div class="comment-row-actions">
          <button class="text-btn" @click="startReply(comment)">回复</button>
        </div>

        <div v-if="getReplies(comment.id).length > 0" class="reply-list-compact">
          <div v-for="reply in getReplies(comment.id)" :key="reply.id" class="comment-row reply">
            <div class="comment-row-head">
              <strong>{{ reply.author }}</strong>
              <span class="comment-time">{{ reply.time }}</span>
            </div>
            <p class="comment-row-content">{{ reply.content }}</p>
            <div class="comment-row-actions">
              <button class="text-btn" @click="startReply(reply)">回复</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export interface PostComment {
  id: number
  postId: number
  parentId: number | null
  author: string
  content: string
  time: string
}

const props = defineProps<{
  comments: PostComment[]
}>()

const emit = defineEmits<{
  (e: 'add', comment: Omit<PostComment, 'id'>): void
}>()

const draft = ref('')
const replyTarget = ref<PostComment | null>(null)

const rootComments = computed(() => props.comments.filter((c) => c.parentId === null))

function getReplies(commentId: number) {
  return props.comments.filter((c) => c.parentId === commentId)
}

function startReply(comment: PostComment) {
  replyTarget.value = comment
}

function cancelReply() {
  replyTarget.value = null
}

function submit() {
  const content = draft.value.trim()
  if (!content) return
  emit('add', {
    postId: replyTarget.value?.postId ?? 0,
    parentId: replyTarget.value?.id ?? null,
    author: '我',
    content,
    time: formatNow()
  })
  draft.value = ''
  replyTarget.value = null
}

function formatNow() {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}
</script>

<style scoped>
.comment-panel {
  display: grid;
  gap: 10px;
  border-top: 1px solid #e7ede8;
  padding-top: 14px;
  margin-top: 4px;
}

.reply-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1d5b36;
  font-size: 13px;
}

.comment-editor-compact {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.comment-editor-compact textarea {
  flex: 1;
  min-width: 0;
  border: 1px solid #d8e2da;
  border-radius: 10px;
  padding: 8px 10px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
}

.submit-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #1f7a41;
  background: #1f7a41;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  align-self: flex-start;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-list-compact {
  display: grid;
  gap: 14px;
}

.comment-row {
  display: grid;
  gap: 4px;
}

.comment-row-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-row-head strong {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.comment-time {
  font-size: 12px;
  color: #9ca3af;
}

.comment-row-content {
  margin: 0;
  color: #374151;
  line-height: 1.65;
  white-space: pre-wrap;
  font-size: 14px;
}

.comment-row-actions {
  display: flex;
  gap: 10px;
}

.text-btn {
  border: none;
  background: transparent;
  color: #1f7a41;
  font-weight: 600;
  font-size: 13px;
  width: fit-content;
  padding: 0;
  cursor: pointer;
}

.text-btn:hover {
  text-decoration: underline;
}

.reply-list-compact {
  display: grid;
  gap: 10px;
  padding-left: 14px;
  border-left: 2px solid #e4efe6;
  margin-top: 6px;
}

.reply-list-compact .comment-row.reply {
  padding-top: 4px;
}

.muted {
  color: #6b7280;
}

h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}
</style>
