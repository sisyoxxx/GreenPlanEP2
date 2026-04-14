<template>
  <Teleport to="body">
    <div class="floating-ball-wrap" :style="ballStyle">
      <!-- 悬浮球 -->
      <div
        class="floating-ball"
        :style="{ background: color }"
        @mousedown.prevent="onDragStart"
        @touchstart.prevent="onDragStart"
        @click="onClick"
      >
        <span class="ball-icon">{{ icon }}</span>
      </div>

      <!-- 弹窗 -->
      <Transition name="popup-anim">
        <div v-if="isOpen" class="floating-popup" :style="popupPositionStyle">
          <slot />
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  icon?: string
  color?: string
  popupWidth?: number
  popupHeight?: number
}>(), {
  icon: '💬',
  color: 'linear-gradient(135deg, #1f7a41, #34d399)',
  popupWidth: 360,
  popupHeight: 480
})

const isOpen = ref(false)
const x = ref(0)
const y = ref(0)
const isDragging = ref(false)
const dragStartPos = { x: 0, y: 0 }
const dragMoved = ref(false)

onMounted(() => {
  x.value = window.innerWidth - 80
  y.value = window.innerHeight - 100
})

const ballStyle = computed(() => ({
  position: 'fixed' as const,
  left: `${x.value}px`,
  top: `${y.value}px`,
  zIndex: 9999
}))

const popupPositionStyle = computed(() => {
  const pw = props.popupWidth
  const ph = props.popupHeight
  let px = -pw - 16
  let py = -ph + 56
  if (x.value - pw - 16 < 0) px = 64
  if (y.value + py < 8) py = 0
  if (y.value + py + ph > window.innerHeight - 8) py = -ph + 56
  return { left: `${px}px`, top: `${py}px`, width: `${pw}px`, height: `${ph}px` }
})

function getEventPos(e: MouseEvent | TouchEvent) {
  if ('touches' in e) return { ex: e.touches[0].clientX, ey: e.touches[0].clientY }
  return { ex: e.clientX, ey: e.clientY }
}

function onDragStart(e: MouseEvent | TouchEvent) {
  const { ex, ey } = getEventPos(e)
  dragStartPos.x = ex - x.value
  dragStartPos.y = ey - y.value
  dragMoved.value = false
  isDragging.value = true
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  document.addEventListener('touchmove', onDragMove, { passive: false })
  document.addEventListener('touchend', onDragEnd)
}

function onDragMove(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  e.preventDefault()
  const { ex, ey } = getEventPos(e)
  const nx = ex - dragStartPos.x
  const ny = ey - dragStartPos.y
  if (Math.abs(nx - x.value) > 3 || Math.abs(ny - y.value) > 3) dragMoved.value = true
  x.value = Math.max(0, Math.min(window.innerWidth - 56, nx))
  y.value = Math.max(0, Math.min(window.innerHeight - 56, ny))
}

function onDragEnd() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)
}

function onClick() {
  if (!dragMoved.value) isOpen.value = !isOpen.value
}

onUnmounted(() => { onDragEnd() })
</script>

<style scoped>
.floating-ball-wrap { position: relative; }

.floating-ball {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
  user-select: none;
  transition: box-shadow 0.2s;
}

.floating-ball:hover {
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.25);
}

.floating-ball:active { cursor: grabbing; }

.ball-icon { font-size: 24px; pointer-events: none; }

.floating-popup {
  position: absolute;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform-origin: bottom right;
}

.popup-anim-enter-active {
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}

.popup-anim-leave-active {
  transition: transform 0.2s ease, opacity 0.15s ease;
}

.popup-anim-enter-from {
  transform: scale(0.3);
  opacity: 0;
}

.popup-anim-leave-to {
  transform: scale(0.3);
  opacity: 0;
}
</style>