<template>
  <div class="weather-panel page-lite">
    <div class="weather-info">
      <span class="weather-icon">🌤️</span>
      <div>
        <strong>晴转多云 22°C ~ 28°C</strong>
        <span class="weather-humidity">湿度 65% · 微风</span>
      </div>
    </div>
    <div class="weather-tips">
      <span class="tip-item">🌱 适宜播种：生菜、小白菜</span>
      <span class="tip-item">💧 傍晚浇水为佳</span>
      <span class="tip-item">🪴 适宜移栽修剪</span>
    </div>
    <div class="weather-divider"></div>
    <div class="weather-notices">
      <div class="notice-title">📢 公告提醒</div>
      <div class="notice-list">
        <div class="notice-item" v-for="(a, i) in notices" :key="i">
          <span class="notice-dot"></span>{{ a }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  notices: string[]
}>()
</script>

<style scoped>
.weather-panel {
  display: grid;
  gap: 10px;
  align-content: start;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.weather-icon { font-size: 24px; }
.weather-info strong { font-size: 14px; color: #1f2937; }

.weather-humidity {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.weather-tips {
  display: grid;
  gap: 3px;
  font-size: 13px;
  color: #4b5563;
}

.weather-divider {
  height: 1px;
  background: #e6ece7;
  margin: 2px 0;
}

.weather-notices { display: grid; gap: 6px; }

.notice-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f7a41;
}

.notice-list { display: grid; gap: 4px; }

.notice-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.notice-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #80ab64;
  flex-shrink: 0;
}
</style>
