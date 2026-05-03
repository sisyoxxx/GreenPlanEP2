<template>
  <div class="chat-window">
    <div class="chat-header">
      <span class="chat-title">智能助手</span>
    </div>
    <div ref="chatBodyRef" class="chat-body">
      <div v-if="messages.length === 0" class="chat-welcome">
        <div class="chat-bot-avatar">🤖</div>
        <p>你好，我是种植智能助手。你可以在这里提问，我会给出简洁可执行的建议。</p>
      </div>

      <div v-else class="chat-thread">
        <div v-for="msg in messages" :key="msg.id" class="chat-row" :class="msg.role">
          <div class="chat-bubble" :class="msg.role">
            {{ msg.content }}
          </div>
        </div>
      </div>
    </div>
    <div class="chat-footer">
      <div class="chat-tools">
        <button class="chat-tool-btn" title="上传图片">📷</button>
        <button class="chat-tool-btn" title="语音输入">🎙</button>
        <button class="chat-tool-btn" title="清空对话" @click="handleClear">🗑</button>
      </div>
      <div class="chat-input-row">
        <input
          v-model.trim="chatInput"
          type="text"
          class="chat-input"
          placeholder="输入你的问题..."
          :disabled="loading"
          @keydown.enter.prevent="handleSend"
        />
        <button class="chat-send-btn" :disabled="loading || !chatInput" @click="handleSend">
          {{ loading ? '发送中...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const props = defineProps<{
  messages: ChatMessage[]
  loading: boolean
}>()

const emit = defineEmits<{
  send: [text: string]
  clear: []
}>()

const chatInput = ref('')
const chatBodyRef = ref<HTMLElement | null>(null)

function handleSend() {
  const text = chatInput.value.trim()
  if (!text || props.loading) return
  emit('send', text)
  chatInput.value = ''
}

function handleClear() {
  emit('clear')
}

function scrollToBottom() {
  const el = chatBodyRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

watch(() => props.messages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

watch(() => props.loading, async (newVal, oldVal) => {
  if (oldVal && !newVal) {
    await nextTick()
    scrollToBottom()
  }
})
</script>

<style scoped>
.chat-window { display: flex; flex-direction: column; height: 100%; }

.chat-header {
  padding: 14px 16px;
  background: #80ab64;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  flex-shrink: 0;
}

.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8fcf8;
}

.chat-welcome {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.chat-bot-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e6f4ea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.chat-welcome p {
  margin: 0;
  background: #fff;
  padding: 10px 14px;
  border-radius: 0 12px 12px 12px;
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.chat-thread {
  display: grid;
  gap: 10px;
}

.chat-row {
  display: flex;
}

.chat-row.user {
  justify-content: flex-end;
}

.chat-row.assistant {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 78%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.chat-bubble.assistant {
  background: #fff;
  color: #374151;
  border-radius: 0 12px 12px 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.chat-bubble.user {
  background: #1f7a41;
  color: #fff;
  border-radius: 12px 0 12px 12px;
  box-shadow: 0 6px 16px rgba(31, 122, 65, 0.12);
}

.chat-footer {
  padding: 10px 12px;
  border-top: 1px solid #f0f0f0;
  display: grid;
  gap: 8px;
  flex-shrink: 0;
  background: #fff;
}

.chat-tools { display: flex; gap: 6px; }

.chat-tool-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.chat-tool-btn:hover { background: #e6f4ea; }

.chat-input-row { display: flex; gap: 8px; }

.chat-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d3d7de;
  font-size: 13px;
}

.chat-send-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #1f7a41;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

.chat-send-btn:hover { background: #276749; }
</style>
