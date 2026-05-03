<template>
  <section class="page-lite inbox-panel">
    <h3>{{ inboxTitle }}</h3>
    <p class="muted">{{ inboxHint }}</p>

    <template v-if="activeInbox === 'message'">
      <div v-if="!activeConversation" class="conversation-list">
        <button
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          class="conversation-item"
          @click="$emit('openDirectChat', conversation.id)"
        >
          <div class="conversation-main">
            <strong>{{ conversation.partner }}</strong>
            <p>{{ conversation.preview || '暂无消息内容' }}</p>
          </div>
          <div class="conversation-meta">
            <span>{{ conversation.updatedAt }}</span>
            <span v-if="conversation.unread > 0" class="message-badge">{{ conversation.unread }}</span>
          </div>
        </button>
        <div v-if="filteredConversations.length === 0" class="muted">暂时没有私信消息</div>
      </div>

      <div v-else class="chat-panel">
        <div class="chat-head">
          <button class="secondary-btn" @click="$emit('backToInboxList')">返回消息列表</button>
          <strong>与 {{ activeConversation.partner }} 的聊天</strong>
        </div>

        <div class="chat-thread">
          <article
            v-for="msg in activeConversation.messages"
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
            @keydown.enter.prevent="$emit('sendDirectMessage')"
            @input="$emit('updateChatDraft', ($event.target as HTMLInputElement).value)"
          />
          <button class="secondary-btn" :disabled="!chatDraft" @click="$emit('sendDirectMessage')">发送</button>
        </div>
      </div>
    </template>

    <template v-else>
      <div v-if="activeInboxItems.length === 0" class="muted">暂时没有新消息</div>
      <article v-for="item in activeInboxItems" :key="item.id" class="inbox-item">
        <p>{{ item.text }}</p>
        <span class="muted">{{ item.time }}</span>
      </article>
    </template>
  </section>
</template>

<script setup lang="ts">
type InboxItem = { id: number; text: string; time: string }
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

defineProps<{
  activeInbox: string
  inboxTitle: string
  inboxHint: string
  activeConversation: DirectConversation | null
  filteredConversations: DirectConversation[]
  chatDraft: string
  activeInboxItems: InboxItem[]
}>()

defineEmits<{
  (e: 'openDirectChat', conversationId: number): void
  (e: 'backToInboxList'): void
  (e: 'sendDirectMessage'): void
  (e: 'updateChatDraft', value: string): void
}>()
</script>

<style scoped>
.inbox-panel {
  display: grid;
  gap: 10px;
}

.conversation-list {
  display: grid;
  gap: 10px;
}

.conversation-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e3ece5;
  background: #fff;
  text-align: left;
}

.conversation-main {
  min-width: 0;
}

.conversation-main p {
  margin: 4px 0 0;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-meta {
  display: grid;
  justify-items: end;
  gap: 6px;
  color: #9ca3af;
  font-size: 12px;
}

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
}

.inbox-item {
  border: 1px solid #e7efe8;
  border-radius: 10px;
  padding: 10px;
  display: grid;
  gap: 6px;
}

.muted {
  color: #6b7280;
}

.message-badge {
  border-radius: 999px;
  padding: 0 8px;
  background: #f4f8f4;
  color: #4b5563;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}
</style>
