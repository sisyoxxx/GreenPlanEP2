<template>
  <aside class="home-sidebar left-sidebar page-lite">
    <section class="sidebar-section">
      <h3 class="sidebar-title">商品分类</h3>

      <div class="sidebar-list sidebar-grid-list">
        <button
          v-for="item in BUYER_CATEGORY_DEFINITIONS"
          :key="item.label"
          type="button"
          class="sidebar-list-item sidebar-grid-item sidebar-grid-button"
          @click="goCategory(item.label)"
        >
          <span class="sidebar-icon" aria-hidden="true">{{ item.icon }}</span>
          <div class="sidebar-grid-text">
            <div class="sidebar-item-title">{{ item.label }}</div>
            <div class="sidebar-item-desc">{{ item.desc }}</div>
          </div>
        </button>
      </div>
    </section>

    <section class="sidebar-section location-section">
      <div class="location-head">
        <div>
          <h3 class="sidebar-title">城市定位</h3>
          <p class="sidebar-item-desc">定位或手动设置后，推荐内容会更贴合你的地区环境。</p>
        </div>
        <button
          type="button"
          class="location-btn"
          :class="{ active: Boolean(selectedLocation) }"
          @click="locateUser"
          :disabled="status === 'loading'"
        >
          {{ locationButtonText }}
        </button>
      </div>

      <div class="location-current">
        <span class="location-label">当前城市</span>
        <strong>{{ selectedLocation || '未设置' }}</strong>
      </div>

      <label class="location-field">
        <span>手动修改城市</span>
        <select v-model="selectedLocation">
          <option value="">请选择城市</option>
          <option v-for="option in locationOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </label>

      <div class="quick-city-row">
        <button
          v-for="option in locationOptions.slice(0, 6)"
          :key="option"
          type="button"
          class="quick-city-btn"
          :class="{ active: selectedLocation === option }"
          @click="selectedLocation = option"
        >
          {{ option }}
        </button>
      </div>

      <p v-if="hint" class="location-hint">{{ hint }}</p>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BUYER_CATEGORY_DEFINITIONS } from '../categoryConfig'

const router = useRouter()

const STORAGE_KEY = 'gp2_buyer_location'
const locationOptions = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆']

const status = ref<'idle' | 'loading' | 'ok' | 'error'>('idle')
const hint = ref('')
const selectedLocation = ref(localStorage.getItem(STORAGE_KEY) || '')

const locationButtonText = computed(() => {
  if (status.value === 'loading') return '定位中...'
  return selectedLocation.value ? `📍 ${selectedLocation.value}` : '定位城市'
})

watch(selectedLocation, (value) => {
  if (value) {
    localStorage.setItem(STORAGE_KEY, value)
    window.dispatchEvent(new CustomEvent('gp2-location-change', { detail: value }))
    hint.value = `已切换到 ${value}，你可以继续修改。`
  } else {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('gp2-location-change', { detail: '' }))
    hint.value = ''
  }
})

function goCategory(category: string) {
  router.push({
    path: '/products',
    query: { category }
  })
}

function locateUser() {
  if (!navigator.geolocation) {
    hint.value = '当前浏览器不支持定位，请手动选择城市。'
    status.value = 'error'
    return
  }

  status.value = 'loading'
  hint.value = ''

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const city = findNearestCity(position.coords.latitude, position.coords.longitude)
      selectedLocation.value = city
      hint.value = city ? `定位成功，已设置为 ${city}。` : '定位成功，请手动选择更精确的城市。'
      status.value = 'ok'
    },
    () => {
      hint.value = '定位失败，请检查权限后重试，或手动选择城市。'
      status.value = 'error'
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
  )
}

function findNearestCity(latitude: number, longitude: number) {
  const cityCoords: Record<string, [number, number]> = {
    北京: [39.9042, 116.4074],
    上海: [31.2304, 121.4737],
    广州: [23.1291, 113.2644],
    深圳: [22.5431, 114.0579],
    杭州: [30.2741, 120.1551],
    成都: [30.5728, 104.0668],
    武汉: [30.5928, 114.3055],
    南京: [32.0603, 118.7969],
    西安: [34.3416, 108.9398],
    重庆: [29.563, 106.5516]
  }

  let closestCity = ''
  let minDistance = Number.POSITIVE_INFINITY

  for (const [city, [lat, lon]] of Object.entries(cityCoords)) {
    const distance = (latitude - lat) ** 2 + (longitude - lon) ** 2
    if (distance < minDistance) {
      minDistance = distance
      closestCity = city
    }
  }

  return closestCity
}
</script>

<style scoped>
.home-sidebar {
  display: grid;
  gap: 12px;
}

.sidebar-section {
  display: grid;
  gap: 10px;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  color: #1f7a41;
}

.sidebar-list {
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.sidebar-grid-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sidebar-list-item,
.location-current,
.location-field {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px;
  border-radius: 12px;
  background: #f8fcf8;
  border: 1px solid #e4efe6;
}

.location-current,
.location-field {
  display: grid;
  gap: 6px;
}

.location-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.location-btn {
  border: 1px solid #cfe4d3;
  background: #edf9ef;
  color: #1f7a41;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 10px;
  white-space: nowrap;
  cursor: pointer;
}

.location-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.location-btn.active {
  background: #1f7a41;
  border-color: #1f7a41;
  color: #fff;
}

.location-label,
.location-field span {
  font-size: 12px;
  font-weight: 700;
  color: #4b5563;
}

.location-current strong {
  color: #1f2937;
}

.quick-city-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.quick-city-btn {
  border: 1px solid #dbe9de;
  background: #f8fcf8;
  color: #335a43;
  border-radius: 10px;
  padding: 8px 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.quick-city-btn.active {
  border-color: #1f7a41;
  background: #edf9ef;
  color: #1f7a41;
}

.location-hint {
  margin: 0;
  color: #1f7a41;
  font-size: 12px;
  line-height: 1.6;
}

.sidebar-grid-button {
  width: 100%;
  cursor: pointer;
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.sidebar-grid-button:hover {
  transform: translateY(-1px);
  border-color: #bfdcc7;
  box-shadow: 0 8px 18px rgba(31, 122, 65, 0.08);
}

.sidebar-grid-item {
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 96px;
}

.sidebar-grid-text {
  display: grid;
  gap: 2px;
}

.sidebar-icon {
  font-size: 20px;
}

.sidebar-item-title {
  font-weight: 600;
  color: #1f2937;
}

.sidebar-item-desc {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.55;
}

@media (max-width: 1280px) {
  .left-sidebar .sidebar-item-desc {
    display: none;
  }

  .left-sidebar .location-head .sidebar-item-desc,
  .left-sidebar .location-hint {
    display: block;
  }
}

@media (max-width: 950px) {
  .left-sidebar {
    gap: 10px;
  }

  .left-sidebar .sidebar-section {
    gap: 6px;
  }

  .left-sidebar .sidebar-title {
    font-size: 16px;
  }

  .left-sidebar .sidebar-grid-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .left-sidebar .sidebar-grid-item {
    min-height: 78px;
    padding: 8px 6px;
  }

  .left-sidebar .sidebar-item-title {
    font-size: 13px;
  }

  .left-sidebar .quick-city-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 485px) {
  .left-sidebar {
    display: none;
  }
}
</style>
