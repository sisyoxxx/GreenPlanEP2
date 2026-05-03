<template>
  <AppLayout>
    <div class="diary-shell">
      <DiarySidebar
        :active-category="activeCategory"
        :show-plant-list="showPlantList"
        :selected-plant="selectedPlant"
        @update:active-category="activeCategory = $event"
        @toggle-plant-list="showPlantList = !showPlantList"
        @toggle-plant="selectedPlant = selectedPlant === $event ? '' : $event"
      />

      <main class="diary-main">
        <div class="top-row">
          <div class="diary-header page-lite">
            <div>
              <h2 class="diary-title">今日打卡</h2>
              <p class="diary-subtitle">记录每一天的成长变化</p>
            </div>
            <button class="add-btn" @click="showAddForm = !showAddForm">+ 写日记</button>
          </div>

          <WeatherPanel :notices="diaryNotices" />
        </div>

        <DiaryForm
          :show="showAddForm"
          :editing-id="editingId"
          v-model="newRecord"
          @submit="addRecord"
          @cancel="cancelForm"
        />

        <div class="diary-search page-lite">
          <input v-model="searchKeyword" type="text" placeholder="搜索日记标题或作物名..." />
        </div>

        <DiaryTimeline
          :diaries="filteredRecords"
          :emptyText="searchKeyword ? '没有找到相关日记' : '还没有日记，快去记录吧'"
          @edit="onEdit"
          @delete="onDelete"
          @addDiary="onAddDiary"
        />
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import DiarySidebar from '../components/planting/DiarySidebar.vue'
import DiaryForm from '../components/planting/DiaryForm.vue'
import WeatherPanel from '../components/planting/WeatherPanel.vue'
import DiaryTimeline from '../components/planting/DiaryTimeline.vue'
import type { PlantRecord } from '../components/planting/types'

const diaryNotices = [
  '薄荷生长旺盛期，建议本周修剪顶部促进分枝',
  '气温适中，抓紧春播生菜、小白菜好时机',
  '新功能：支持上传种植照片，记录成长瞬间',
  '本周六社区直播：阳台番茄种植全流程分享'
]

const activeCategory = ref('all')
const searchKeyword = ref('')
const showAddForm = ref(false)
const showPlantList = ref(false)
const selectedPlant = ref('')
const editingId = ref<number | null>(null)

const newRecord = reactive({ title: '', plantName: '', category: 'seedling', note: '', date: new Date().toISOString().slice(0, 10), imageName: '' })

const records = ref<PlantRecord[]>([
  { id: 1, title: '番茄育苗第7天', plantName: '番茄', category: 'seedling', date: '2026-04-10', note: '已出芽，保持通风和散射光。叶片颜色健康，根系开始扎稳。', imageName: '番茄芽苗.jpg' },
  { id: 2, title: '月季播种第3天', plantName: '月季', category: 'seedling', date: '2026-04-11', note: '土壤湿润度正常，等待发芽。覆膜保温效果不错。', imageName: '' },
  { id: 3, title: '薄荷长势旺盛', plantName: '薄荷', category: 'growing', date: '2026-04-08', note: '已经长到15cm，需要修剪顶部促进分枝。香味浓郁。', imageName: '薄荷近照.jpg' },
  { id: 4, title: '草莓第一次结果', plantName: '草莓', category: 'harvest', date: '2026-04-05', note: '阳台草莓终于红了！虽然个头不大但味道很甜，成就感满满。', imageName: '草莓成熟.jpg' },
  { id: 5, title: '今日浇水记录', plantName: '综合', category: 'note', date: '2026-04-11', note: '全部植物浇透水，检查了排水孔，薄荷盆底略有积水需注意。', imageName: '' }
])

let nextId = 6
function addRecord() {
  if (!newRecord.title || !newRecord.plantName) return
  if (editingId.value) {
    const target = records.value.find(r => r.id === editingId.value)
    if (target) {
      target.title = newRecord.title
      target.plantName = newRecord.plantName
      target.category = newRecord.category
      target.date = newRecord.date
      target.note = newRecord.note
      target.imageName = newRecord.imageName
    }
    editingId.value = null
  } else {
    records.value.unshift({
      id: nextId++,
      title: newRecord.title,
      plantName: newRecord.plantName,
      category: newRecord.category,
      date: newRecord.date,
      note: newRecord.note,
      imageName: newRecord.imageName
    })
  }
  newRecord.title = ''; newRecord.plantName = ''; newRecord.note = ''; newRecord.category = 'seedling'
  newRecord.date = new Date().toISOString().slice(0, 10); newRecord.imageName = ''
  showAddForm.value = false
}

function onEdit(record: PlantRecord) {
  editingId.value = record.id
  newRecord.title = record.title
  newRecord.plantName = record.plantName
  newRecord.category = record.category
  newRecord.date = record.date
  newRecord.note = record.note
  newRecord.imageName = record.imageName
  showAddForm.value = true
}

function cancelForm() {
  editingId.value = null
  newRecord.title = ''; newRecord.plantName = ''; newRecord.note = ''; newRecord.category = 'seedling'
  newRecord.date = new Date().toISOString().slice(0, 10); newRecord.imageName = ''
  showAddForm.value = false
}

function onDelete(id: number) {
  records.value = records.value.filter(r => r.id !== id)
}

function onAddDiary(id: number) {
  const record = records.value.find(r => r.id === id)
  if (record) {
    newRecord.plantName = record.plantName
    showAddForm.value = true
  }
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

.diary-main::-webkit-scrollbar {
  width: 8px;
}

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
  .diary-main {
    padding: 0;
    overflow: visible;
  }
  .top-row { grid-template-columns: 1fr; }
}
</style>
