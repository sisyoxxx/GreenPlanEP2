<template>
  <AppLayout>
    <div class="diary-shell">
      <!-- 左侧栏 -->
      <aside class="diary-sidebar page-lite">
        <h3 class="sidebar-title">日记分类</h3>
        <button
          v-for="cat in categories"
          :key="cat.key"
          :class="['cat-btn', { active: activeCategory === cat.key }]"
          @click="activeCategory = cat.key"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          {{ cat.label }}
        </button>

        <!-- 我的植物 -->
        <div class="plant-section">
          <button class="cat-btn" :class="{ active: showPlantList }" @click="showPlantList = !showPlantList">
            <span class="cat-icon">🌻</span>我的植物
            <span class="plant-arrow" :class="{ open: showPlantList }">▾</span>
          </button>
          <Transition name="slide">
            <div v-if="showPlantList" class="plant-dropdown">
              <button
                v-for="p in myPlants"
                :key="p.name"
                :class="['plant-item', { active: selectedPlant === p.name }]"
                @click="selectedPlant = selectedPlant === p.name ? '' : p.name"
              >
                <span>{{ p.icon }}</span> {{ p.name }}
                <span class="plant-status">{{ p.status }}</span>
              </button>
            </div>
          </Transition>
        </div>
      </aside>

      <!-- 右侧内容区 -->
      <main class="diary-main">
        <!-- 今日打卡 + 天气/公告并排 -->
        <div class="top-row">
          <div class="diary-header page-lite">
            <div>
              <h2 class="diary-title">今日打卡</h2>
              <p class="diary-subtitle">记录每一天的成长变化</p>
            </div>
            <button class="add-btn" @click="showAddForm = !showAddForm">+ 写日记</button>
          </div>

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
                <div class="notice-item" v-for="(a, i) in diaryNotices" :key="i">
                  <span class="notice-dot"></span>{{ a }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 新增日记表单 -->
        <div v-if="showAddForm" class="diary-form page-lite">
          <div class="form-layout">
            <div class="form-fields">
              <input v-model="newRecord.title" type="text" placeholder="日记标题" />
              <input v-model="newRecord.plantName" type="text" placeholder="作物名称" />
              <input v-model="newRecord.date" type="date" />
              <select v-model="newRecord.category">
                <option value="seedling">育苗期</option>
                <option value="growing">生长期</option>
                <option value="harvest">收获期</option>
                <option value="note">随记</option>
              </select>
              <textarea v-model="newRecord.note" placeholder="写下今天的观察..." rows="3"></textarea>
              <div class="form-actions">
                <button @click="addRecord">保存</button>
                <button class="secondary-btn" @click="showAddForm = false">取消</button>
              </div>
            </div>
            <div class="upload-area" @click="triggerUpload">
              <input ref="fileInput" type="file" accept="image/*" hidden @change="onFileChange" />
              <span v-if="!newRecord.imageName">📷 点击上传图片</span>
              <span v-else>🖼️ {{ newRecord.imageName }}</span>
            </div>
          </div>
        </div>

        <!-- 搜索 -->
        <div class="diary-search page-lite">
          <input v-model="searchKeyword" type="text" placeholder="搜索日记标题或作物名..." />
        </div>

        <!-- 日记卡片列表 -->
        <div v-if="filteredRecords.length === 0" class="empty-state page-lite">
          <p class="empty-hint">{{ searchKeyword ? '没有找到相关日记' : '还没有日记，快去记录吧' }}</p>
        </div>
        <div v-else class="diary-list">
          <article class="diary-card page-lite" v-for="item in filteredRecords" :key="item.id">
            <div class="diary-card-content">
              <div class="diary-card-header">
                <div class="diary-card-tag" :style="{ background: tagColorMap[item.category] }">{{ tagLabelMap[item.category] }}</div>
                <span class="diary-card-date">{{ item.date }}</span>
              </div>
              <h3 class="diary-card-title">{{ item.title }}</h3>
              <div class="diary-card-plant">
                <span class="plant-icon">🌱</span> {{ item.plantName }}
              </div>
              <p class="diary-card-note">{{ item.note }}</p>
            </div>
            <div v-if="item.imageName" class="diary-card-image">
              <span>🖼️ {{ item.imageName }}</span>
            </div>
          </article>
        </div>
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'

const diaryNotices = [
  '薄荷生长旺盛期，建议本周修剪顶部促进分枝',
  '气温适中，抓紧春播生菜、小白菜好时机',
  '新功能：支持上传种植照片，记录成长瞬间',
  '本周六社区直播：阳台番茄种植全流程分享'
]

const categories = [
  { key: 'all', icon: '📒', label: '全部日记' },
  { key: 'seedling', icon: '🌱', label: '育苗期' },
  { key: 'growing', icon: '🌿', label: '生长期' },
  { key: 'harvest', icon: '🍅', label: '收获期' },
  { key: 'note', icon: '📝', label: '随记' }
]

const tagLabelMap: Record<string, string> = { seedling: '育苗期', growing: '生长期', harvest: '收获期', note: '随记' }
const tagColorMap: Record<string, string> = { seedling: '#dff4e4', growing: '#dbeafe', harvest: '#fef3c7', note: '#f3f4f6' }

const activeCategory = ref('all')
const searchKeyword = ref('')
const showAddForm = ref(false)
const showPlantList = ref(false)
const selectedPlant = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const myPlants = [
  { name: '番茄', icon: '🍅', status: '育苗中' },
  { name: '薄荷', icon: '🌿', status: '生长旺盛' },
  { name: '草莓', icon: '🍓', status: '已结果' },
  { name: '月季', icon: '🌹', status: '等待发芽' },
  { name: '罗勒', icon: '🌱', status: '刚播种' }
]

const newRecord = reactive({ title: '', plantName: '', category: 'seedling', note: '', date: new Date().toISOString().slice(0, 10), imageName: '' })

function triggerUpload() { fileInput.value?.click() }
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) newRecord.imageName = file.name
}

const records = ref([
  { id: 1, title: '番茄育苗第7天', plantName: '番茄', category: 'seedling', date: '2026-04-10', note: '已出芽，保持通风和散射光。叶片颜色健康，根系开始扎稳。', imageName: '番茄芽苗.jpg' },
  { id: 2, title: '月季播种第3天', plantName: '月季', category: 'seedling', date: '2026-04-11', note: '土壤湿润度正常，等待发芽。覆膜保温效果不错。', imageName: '' },
  { id: 3, title: '薄荷长势旺盛', plantName: '薄荷', category: 'growing', date: '2026-04-08', note: '已经长到15cm，需要修剪顶部促进分枝。香味浓郁。', imageName: '薄荷近照.jpg' },
  { id: 4, title: '草莓第一次结果', plantName: '草莓', category: 'harvest', date: '2026-04-05', note: '阳台草莓终于红了！虽然个头不大但味道很甜，成就感满满。', imageName: '草莓成熟.jpg' },
  { id: 5, title: '今日浇水记录', plantName: '综合', category: 'note', date: '2026-04-11', note: '全部植物浇透水，检查了排水孔，薄荷盆底略有积水需注意。', imageName: '' }
])

let nextId = 6
function addRecord() {
  if (!newRecord.title || !newRecord.plantName) return
  records.value.unshift({
    id: nextId++,
    title: newRecord.title,
    plantName: newRecord.plantName,
    category: newRecord.category,
    date: newRecord.date,
    note: newRecord.note,
    imageName: newRecord.imageName
  })
  newRecord.title = ''; newRecord.plantName = ''; newRecord.note = ''; newRecord.category = 'seedling'
  newRecord.date = new Date().toISOString().slice(0, 10); newRecord.imageName = ''
  showAddForm.value = false
}

const filteredRecords = computed(() => {
  let list = records.value
  if (activeCategory.value !== 'all') list = list.filter(r => r.category === activeCategory.value)
  if (selectedPlant.value) list = list.filter(r => r.plantName === selectedPlant.value)
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(r => r.title.toLowerCase().includes(kw) || r.plantName.toLowerCase().includes(kw))
  }
  return list
})
</script>

<style scoped>
.diary-shell {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 14px;
  align-items: stretch;
  max-width: 100%;
  width: calc(100vw - 24px);
  margin-left: calc((100% - (100vw - 24px)) / 2);
  padding: 0 12px;
  height: calc(100vh - 108px);
  overflow: hidden;
}

.diary-sidebar {
  display: grid;
  gap: 4px;
  align-content: start;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.sidebar-title {
  margin: 0 0 8px;
  font-size: 13px;
  color: #9ca3af;
  letter-spacing: 0.5px;
  padding: 0 10px;
}

.cat-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.cat-btn:hover { background: #f0f7f1; }
.cat-btn.active { background: #e6f4ea; color: #1f7a41; font-weight: 600; }
.cat-icon { font-size: 16px; width: 22px; text-align: center; }

.plant-section { margin-top: 10px; display: grid; gap: 0; }

.plant-arrow {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.2s;
}

.plant-arrow.open { transform: rotate(180deg); }

.plant-dropdown {
  padding: 4px 0 4px 30px;
  display: grid;
  gap: 2px;
}

.slide-enter-active { transition: all 0.25s ease; }
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; overflow: hidden; }
.slide-enter-to, .slide-leave-from { opacity: 1; max-height: 300px; }

.plant-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.plant-item:hover { background: #f0f7f1; color: #374151; }
.plant-item.active { color: #1f7a41; font-weight: 600; }

.plant-status {
  margin-left: auto;
  font-size: 11px;
  color: #9ca3af;
}

.upload-area {
  min-width: 180px;
  min-height: 160px;
  border: 2px dashed #d3d7de;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #80ab64;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-area:hover { border-color: #80ab64; }

.diary-card-image {
  width: 160px;
  min-height: 100px;
  background: linear-gradient(135deg, #e6f4ea, #f0f7f1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #80ab64;
  font-size: 13px;
  border-radius: 10px;
  flex-shrink: 0;
}

.diary-main {
  display: grid;
  gap: 14px;
  padding: 0 80px;
  min-height: 0;
  overflow-y: auto;
  padding-right: calc(80px + 6px);
}

.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

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

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
}

.diary-title { margin: 0; font-size: 20px; color: #1f2937; }
.diary-subtitle { margin: 4px 0 0; font-size: 13px; color: #9ca3af; }

.add-btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: #1f7a41;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.add-btn:hover { background: #276749; }

.diary-form {
  padding: 20px 24px;
}

.form-layout {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 16px;
  align-items: start;
}

.form-fields {
  display: grid;
  gap: 10px;
}

.diary-form textarea { resize: vertical; }
.form-actions { display: flex; gap: 8px; }

.diary-search {
  padding: 0;
}

.diary-search input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #d3d7de;
  background: #f8fcf8;
  font-size: 14px;
}

.diary-list { display: grid; gap: 12px; }

.diary-card {
  display: flex;
  gap: 14px;
  align-items: stretch;
  padding: 18px 24px;
}

.diary-card-content { flex: 1; display: grid; gap: 8px; align-content: start; }

.diary-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diary-card-tag {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #1f7a41;
}

.diary-card-date { font-size: 12px; color: #9ca3af; }
.diary-card-title { margin: 0; font-size: 16px; color: #1f2937; }

.diary-card-plant {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.plant-icon { font-size: 14px; }

.diary-card-note {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.7;
}

.empty-state { text-align: center; padding: 40px 16px; }
.empty-hint { color: #9ca3af; margin: 0; }

.diary-sidebar::-webkit-scrollbar,
.diary-main::-webkit-scrollbar {
  width: 8px;
}

.diary-sidebar::-webkit-scrollbar-thumb,
.diary-main::-webkit-scrollbar-thumb {
  background: #d2e3d6;
  border-radius: 999px;
}

@media (max-width: 760px) {
  .diary-shell {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }
  .diary-sidebar {
    height: auto;
    overflow: visible;
    padding-right: 0;
  }
  .diary-main {
    padding: 0;
    overflow: visible;
  }
  .top-row { grid-template-columns: 1fr; }
  .form-layout { grid-template-columns: 1fr; }
  .diary-card { flex-direction: column; }
  .diary-card-image { width: 100%; min-height: 80px; }
}
</style>
