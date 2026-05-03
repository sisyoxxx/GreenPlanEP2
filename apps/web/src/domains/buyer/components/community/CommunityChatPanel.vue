<template>
  <div v-if="conversation" class="chat-panel">
    <div class="chat-head">
      <button class="secondary-btn" @click="emit('back')">返回消息列表</button>
      <strong>与 {{ conversation.partner }} 的聊天</strong>
    </div>

    <div class="chat-thread">
      <article
        v-for="msg in conversation.messages"
        :key="msg.id"
        class="chat-row"
        :class="{ mine: msg.sender === 'me' }"
      >
        <p class="chat-bubble">{{ msg.text }}</p>
        <span class="muted">{{ msg.time }}</span>
      </article>
    </div>

    <div class="chat-compose">
      <input
        :value="chatDraft"
        type="text"
        placeholder="输入消息并回车发送"
        @input="onInput"
        @keydown.enter.prevent="sendMessage"
      />
      <button class="secondary-btn" :disabled="!chatDraft" @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
type ChatSender = 'me' | 'other'
type DirectChatMessage = { id: number; sender: ChatSender; text: string; time: string }
type DirectConversation = {
  id: number
  partner: string
  preview: string
  updatedAt: string
  unread: number
  messages: DirectChatMessage[]
}

const props = defineProps<{
  conversation: DirectConversation | null
  chatDraft: string
}>()

const emit = defineEmits<{
  send: [text: string]
  back: []
  'update:chatDraft': [value: string]
}>()

function onInput(e: Event) {
  emit('update:chatDraft', (e.target as HTMLInputElement).value)
}

function sendMessage() {
  const text = props.chatDraft.trim()
  if (!text) return
  emit('send', text)
}
</script>

<style scoped>
.chat-panel {
  display: grid;
  gap: 10px;
}

.chat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.chat-thread {
  display: grid;
  gap: 8px;
  max-height: 340px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid #e6eee8;
  background: #fbfefc;
}

.chat-row {
  display: grid;
  gap: 2px;
  justify-items: start;
}

.chat-row.mine {
  justify-items: end;
}

.chat-bubble {
  margin: 0;
  max-width: min(460px, 90%);
  border-radius: 10px;
  padding: 8px 10px;
  background: #f3f7f4;
  color: #1f2937;
}

.chat-row.mine .chat-bubble {
  background: #e8f6eb;
  color: #1d5b36;
}

.chat-compose {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chat-compose input {
  flex: 1;
  width: 100%;
}

.muted {
  color: #6b7280;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

@media (max-width: 900px) {
  .chat-thread {
    max-height: 260px;
  }
}

@media (max-width: 760px) {
  .chat-compose {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
