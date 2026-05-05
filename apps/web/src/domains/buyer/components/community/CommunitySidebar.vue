<template>
  <aside class="community-sidebar page-lite">
    <button class="post-btn" @click="$emit('toggleComposeMode')">{{ isComposeMode ? '返回社区' : '+ 发帖' }}</button>

    <div class="topic-nav-wrap">
      <button class="nav-item topic-nav-trigger" :class="{ active: activeTab === 'all' }" @click="$emit('toggleTopicDropdown')">
        话题分类
        <span class="topic-arrow" :class="{ open: isTopicDropdownOpen }">⌄</span>
      </button>
      <div v-if="isTopicDropdownOpen" class="topic-dropdown">
        <button
          v-for="topic in topicOptions"
          :key="topic"
          class="topic-option"
          :class="{ active: selectedTopic === topic }"
          @click="$emit('selectTopic', topic)"
        >
          {{ topic }}
        </button>
      </div>
    </div>

    <button class="nav-item" :class="{ active: activeTab === 'my' }" @click="$emit('setTab', 'my')">我的帖子</button>
    <button class="nav-item" :class="{ active: activeTab === 'favorites' }" @click="$emit('setTab', 'favorites')">我的收藏</button>
    <button class="nav-item" :class="{ active: activeTab === 'inbox' }" @click="$emit('setTab', 'inbox')">私信中心</button>

    <div class="sidebar-messages">
      <button class="message-item" :class="{ active: activeInbox === 'message' && activeTab === 'inbox' }" @click="$emit('openInbox', 'message')">
        <span>私信消息</span><span class="message-badge">{{ directConversationCount }}</span>
      </button>
      <button class="message-item" :class="{ active: activeInbox === 'reply' && activeTab === 'inbox' }" @click="$emit('openInbox', 'reply')">
        <span>评论回复</span><span class="message-badge">{{ replyCount }}</span>
      </button>
      <button class="message-item" :class="{ active: activeInbox === 'like' && activeTab === 'inbox' }" @click="$emit('openInbox', 'like')">
        <span>点赞消息</span><span class="message-badge">{{ likeCount }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { TopicCategory } from '../../stores/useBuyerCommunityStore'

defineProps<{
  activeTab: string
  isComposeMode: boolean
  isTopicDropdownOpen: boolean
  selectedTopic: TopicCategory | null
  topicOptions: TopicCategory[]
  activeInbox: string
  directConversationCount: number
  replyCount: number
  likeCount: number
}>()

defineEmits<{
  (e: 'toggleComposeMode'): void
  (e: 'setTab', tab: string): void
  (e: 'toggleTopicDropdown'): void
  (e: 'selectTopic', topic: TopicCategory): void
  (e: 'openInbox', type: string): void
}>()

// No additional logic needed
</script>

<style scoped>
.community-sidebar {
  display: grid;
  gap: 10px;
  min-height: 0;
  overflow-y: auto;
}

.post-btn,
.nav-item,
.message-item,
.topic-option {
  width: 100%;
}

.topic-nav-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topic-arrow.open {
  transform: rotate(180deg);
}

.topic-dropdown {
  display: grid;
  gap: 6px;
}

.post-btn {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #1f7a41;
  background: #1f7a41;
  color: #ffffff;
  font-weight: 700;
}

.message-item,
.nav-item,
.topic-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e2ece3;
  background: #ffffff;
  color: #1f2937;
  font-weight: 600;
  text-align: left;
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.message-item:hover,
.nav-item:hover,
.topic-option:hover {
  transform: translateY(-1px);
  border-color: #cfe2d3;
  box-shadow: 0 6px 14px rgba(31, 122, 65, 0.08);
}

.message-item.active,
.nav-item.active,
.topic-option.active {
  border-color: #9ad3aa;
  box-shadow: 0 0 0 1px rgba(31, 122, 65, 0.12);
  color: #1d5b36;
  background: #ffffff;
}

.message-badge {
  border-radius: 999px;
  padding: 0 8px;
  background: #f4f8f4;
  color: #4b5563;
}

.message-item.active .message-badge {
  background: #e8f6eb;
  color: #1d5b36;
}

.sidebar-messages {
  display: grid;
  gap: 10px;
}

@media (max-width: 900px) {
  .community-sidebar {
    overflow: visible;
  }
}
</style>
