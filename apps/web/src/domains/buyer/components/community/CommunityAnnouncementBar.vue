<template>
  <div v-if="effectiveAnnouncements.length > 0" class="page-lite announcement-bar">
    <div class="announcement-single">
      <span class="announcement-label">公告</span>
      <span class="announcement-text">
        <strong>{{ currentAnnouncement?.title }}</strong>：{{ currentAnnouncement?.content }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AnnouncementItem } from '../../api'

const props = defineProps<{
  announcements: AnnouncementItem[]
}>()

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  { id: 0, title: '本周主题：晒出你的阳台春播进度', content: '带图发帖更容易获得互动。', status: 'PUBLISHED', publishedAt: null, createdAt: null }
]

const currentAnnouncementIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const effectiveAnnouncements = computed(() =>
  props.announcements.length > 0 ? props.announcements : DEFAULT_ANNOUNCEMENTS
)

const currentAnnouncement = computed(
  () => effectiveAnnouncements.value[currentAnnouncementIndex.value] || effectiveAnnouncements.value[0]
)

watch(
  () => props.announcements,
  () => {
    currentAnnouncementIndex.value = 0
    startCarousel()
  },
  { immediate: true }
)

function startCarousel() {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (effectiveAnnouncements.value.length > 1) {
      currentAnnouncementIndex.value = (currentAnnouncementIndex.value + 1) % effectiveAnnouncements.value.length
    }
  }, 4000)
}

function stopCarousel() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

defineExpose({ stopCarousel })
</script>

<style scoped>
.announcement-bar {
  display: grid;
  gap: 10px;
}

.announcement-single {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.5;
}

.announcement-label {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  background: #edf9ef;
  color: #1f7a41;
  font-weight: 700;
  font-size: 12px;
}

.announcement-text {
  color: #374151;
}

.announcement-text strong {
  color: #1d5b36;
  font-weight: 700;
}
</style>
