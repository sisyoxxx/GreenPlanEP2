<template>
  <aside class="home-sidebar right-sidebar page-lite">
    <section class="sidebar-section location-card">
      <div class="section-head">
        <div>
          <h3 class="sidebar-title">种植定位</h3>
          <p class="sidebar-item-desc">定位后可继续修改，后续推荐会基于你当前的地区偏好。</p>
        </div>
        <button class="secondary-btn" @click="locateUser" :disabled="status === 'loading'">
          {{ status === 'loading' ? '定位中...' : currentLocation ? '重新定位' : '定位' }}
        </button>
      </div>

      <div class="location-current">
        <span class="location-label">当前地区</span>
        <strong>{{ currentLocation || '尚未设置' }}</strong>
      </div>

      <label class="location-field">
        <span>手动修改地区</span>
        <select v-model="selectedLocation">
          <option value="">请选择地区</option>
          <option v-for="option in locationOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </label>

      <p v-if="hint" class="location-hint">{{ hint }}</p>
    </section>

    <section class="sidebar-section ai-card">
      <div class="ai-head">
        <div>
          <h3 class="sidebar-title">AI 智能模块</h3>
          <p class="sidebar-item-desc">这里先为你预留智能问答、个性化推荐和种植提醒入口。</p>
        </div>
        <span class="ai-badge">占位中</span>
      </div>

      <div class="ai-placeholder">
        <div class="ai-orb"></div>
        <div class="ai-copy">
          <strong>即将接入 AI 生长助手</strong>
          <p>后续会支持按定位、季节和已购商品生成专属种植建议。</p>
        </div>
      </div>

      <div class="ai-feature-list">
        <div class="ai-feature-item">智能播种提醒</div>
        <div class="ai-feature-item">土壤与浇水建议</div>
        <div class="ai-feature-item">问题诊断入口</div>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'gp2_buyer_location'
const locationOptions = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆']

const status = ref<'idle' | 'loading' | 'ok' | 'error'>('idle')
const hint = ref('')
const selectedLocation = ref(localStorage.getItem(STORAGE_KEY) || '')

const currentLocation = computed(() => selectedLocation.value)

watch(selectedLocation, (value) => {
  if (value) {
    localStorage.setItem(STORAGE_KEY, value)
    hint.value = `已切换为 ${value}，你可以随时再次修改。`
  } else {
    localStorage.removeItem(STORAGE_KEY)
    hint.value = ''
  }
})

function locateUser() {
  if (!navigator.geolocation) {
    hint.value = '当前浏览器不支持定位，请手动选择地区。'
    status.value = 'error'
    return
  }

  status.value = 'loading'
  hint.value = ''

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude
      selectedLocation.value = `已定位 (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
      hint.value = '定位成功，你也可以通过下拉框重新修改地区。'
      status.value = 'ok'
    },
    () => {
      hint.value = '定位失败，请检查浏览器权限或直接手动选择地区。'
      status.value = 'error'
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
  )
}
</script>

<style scoped>
.home-sidebar {
  display: grid;
  gap: 12px;
}

.sidebar-section {
  display: grid;
  gap: 12px;
}

.section-head,
.ai-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  color: #1f7a41;
}

.sidebar-item-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
}

.location-current,
.location-field {
  display: grid;
  gap: 6px;
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

.location-hint {
  margin: 0;
  color: #1f7a41;
  font-size: 12px;
  line-height: 1.6;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.secondary-btn:disabled {
  opacity: 0.6;
}

.ai-card {
  padding-top: 2px;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
}

.ai-placeholder {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid #e2efe5;
  background: linear-gradient(135deg, #f7fcf8, #eef8f0);
}

.ai-orb {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0) 40%),
    linear-gradient(135deg, #1f7a41, #8fd1a6);
  box-shadow: 0 14px 26px rgba(31, 122, 65, 0.18);
}

.ai-copy {
  display: grid;
  gap: 6px;
}

.ai-copy strong {
  color: #16351f;
}

.ai-copy p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
  font-size: 13px;
}

.ai-feature-list {
  display: grid;
  gap: 8px;
}

.ai-feature-item {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e4efe6;
  background: #f8fcf8;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 905px) {
  .right-sidebar {
    display: none;
  }
}
</style>
