<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-overlay" @click.self="onOverlayClick">
        <div class="modal-card" :class="{ 'modal-lg': size === 'lg', 'modal-sm': size === 'sm' }">
          <header v-if="title || $slots.header" class="modal-header">
            <slot name="header">
              <h3 class="modal-title">{{ title }}</h3>
            </slot>
            <button
              v-if="closable"
              type="button"
              class="modal-close"
              aria-label="关闭"
              @click="emit('close')"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </header>

          <div class="modal-body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean
  title?: string
  closable?: boolean
  size?: 'sm' | 'md' | 'lg'
  closeOnOverlay?: boolean
}>(), {
  closable: true,
  size: 'md',
  closeOnOverlay: true
})

const emit = defineEmits<{
  close: []
}>()

function onOverlayClick() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(22, 53, 31, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.modal-card {
  width: min(560px, 100%);
  max-height: calc(100vh - 40px);
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(207, 233, 215, 0.6);
  box-shadow:
    0 24px 60px rgba(22, 53, 31, 0.14),
    0 8px 20px rgba(22, 53, 31, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow: hidden;
}

.modal-lg {
  width: min(840px, 100%);
}

.modal-sm {
  width: min(380px, 100%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 22px 14px;
  border-bottom: 1px solid #eef5f0;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #16351f;
  letter-spacing: -0.01em;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid #e3ece5;
  background: #f8fcf8;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.18s ease;
}

.modal-close:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.modal-body {
  padding: 18px 22px;
  overflow-y: auto;
  min-height: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 22px 18px;
  border-top: 1px solid #eef5f0;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: scale(0.92) translateY(12px);
  opacity: 0;
}

.modal-enter-to .modal-card,
.modal-leave-from .modal-card {
  transform: scale(1) translateY(0);
  opacity: 1;
}
</style>
