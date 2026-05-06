<template>
  <AppLayout>
    <div class="diary-shell">
      <DiarySidebar
        :active-category="activeCategory"
        :show-plant-list="showPlantList"
        :selected-plant="selectedPlant"
        :my-plants="myPlants"
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
            <button class="add-btn" @click="toggleAddForm">+ 写日记</button>
          </div>

          <WeatherPanel :notices="diaryNotices" />
        </div>

        <BaseModal :open="showAddForm" :title="editingId ? '编辑日记' : '新增日记'" @close="cancelForm">
          <DiaryForm
            :show="true"
            :editing-id="editingId"
            v-model="newRecord"
            @submit="addRecord"
            @cancel="cancelForm"
          />
        </BaseModal>

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
import { computed, ref, reactive, onMounted } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import DiarySidebar from '../components/planting/DiarySidebar.vue'
import DiaryForm from '../components/planting/DiaryForm.vue'
import WeatherPanel from '../components/planting/WeatherPanel.vue'
import DiaryTimeline from '../components/planting/DiaryTimeline.vue'
import BaseModal from '../../../shared/components/BaseModal.vue'
import type { PlantRecord } from '../components/planting/types'
import { fetchPlantingDiaries, createPlantingDiary, updatePlantingDiary, deletePlantingDiary } from '../api'

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

const records = ref<PlantRecord[]>([])

onMounted(async () => {
  try {
    const data = await fetchPlantingDiaries()
    records.value = data as PlantRecord[]
  } catch (e) {
    console.error('加载种植日记失败', e)
  }
})

async function addRecord() {
  if (!newRecord.title || !newRecord.plantName) return
  try {
    if (editingId.value) {
      await updatePlantingDiary(editingId.value, {
        title: newRecord.title,
        plantName: newRecord.plantName,
        category: newRecord.category,
        diaryDate: newRecord.date,
        note: newRecord.note,
        imageName: newRecord.imageName || null
      })
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
      const created = await createPlantingDiary({
        title: newRecord.title,
        plantName: newRecord.plantName,
        category: newRecord.category,
        diaryDate: newRecord.date,
        note: newRecord.note,
        imageName: newRecord.imageName || null
      })
      records.value.unshift({
        id: created.id,
        title: created.title,
        plantName: created.plantName,
        category: created.category,
        date: created.diaryDate,
        note: created.note ?? '',
        imageName: created.imageName ?? ''
      })
    }
    newRecord.title = ''; newRecord.plantName = ''; newRecord.note = ''; newRecord.category = 'seedling'
    newRecord.date = new Date().toISOString().slice(0, 10); newRecord.imageName = ''
    showAddForm.value = false
  } catch (e) {
    console.error('保存日记失败', e)
    alert('保存失败，请检查内容后重试')
  }
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

async function onDelete(id: number) {
  try {
    await deletePlantingDiary(id)
    records.value = records.value.filter(r => r.id !== id)
  } catch (e) {
    console.error('删除日记失败', e)
    alert('删除失败')
  }
}

function toggleAddForm() {
  showAddForm.value = !showAddForm.value
  if (showAddForm.value) {
    editingId.value = null
    newRecord.title = ''
    newRecord.plantName = ''
    newRecord.note = ''
    newRecord.category = 'seedling'
    newRecord.date = new Date().toISOString().slice(0, 10)
    newRecord.imageName = ''
  }
}

function onAddDiary(id: number) {
  const record = records.value.find(r => r.id === id)
  if (record) {
    newRecord.plantName = record.plantName
    showAddForm.value = true
  }
}

const myPlants = computed(() => {
  const map = new Map<string, { name: string; icon: string; status: string }>()
  for (const r of records.value) {
    if (!map.has(r.plantName)) {
      map.set(r.plantName, { name: r.plantName, icon: '🌱', status: '种植中' })
    }
  }
  return Array.from(map.values())
})

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
