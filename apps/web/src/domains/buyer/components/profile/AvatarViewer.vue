<template>
  <Teleport to="body">
    <div v-if="open" class="avatar-viewer" @click.self="emit('close')">
      <div class="avatar-viewer-card page-lite">
        <div class="viewer-head">
          <strong>头像预览</strong>
          <button type="button" class="secondary-btn" @click="emit('close')">关闭</button>
        </div>
        <div class="viewer-body">
          <img v-if="src" :src="src" alt="avatar large" />
          <div v-else class="viewer-placeholder">{{ (displayName.charAt(0) || 'U').toUpperCase() }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  src: string
  displayName: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
.avatar-viewer {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.58);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 60;
}

.avatar-viewer-card {
  width: min(560px, 100%);
  display: grid;
  gap: 12px;
  padding: 14px;
}

.viewer-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.viewer-body {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 16px;
  background: #f8fcf8;
  border: 1px solid #e4efe6;
}

.viewer-body img {
  width: 100%;
  max-height: 72vh;
  object-fit: contain;
  border-radius: 14px;
}

.viewer-placeholder {
  width: 240px;
  height: 240px;
  border-radius: 999px;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  border: 2px solid #cfe9d7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1f7a41;
  font-weight: 900;
  font-size: 84px;
}
</style>
