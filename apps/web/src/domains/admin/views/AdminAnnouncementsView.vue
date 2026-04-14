<template>
  <AdminLayout>
    <h2 class="page-title">公告管理</h2>

    <!-- 发布表单 -->
    <div v-if="showForm" class="ann-form page-lite">
      <input v-model="form.title" placeholder="公告标题" />
      <textarea v-model="form.content" placeholder="公告内容..." rows="3"></textarea>
      <div class="time-range">
        <div class="time-input-group">
          <label>开始时间</label>
          <input v-model="form.startDate" type="date" />
          <input v-model="form.startTime" type="time" />
        </div>
        <div class="time-input-group">
          <label>结束时间</label>
          <input v-model="form.endDate" type="date" />
          <input v-model="form.endTime" type="time" />
        </div>
      </div>
      <div class="form-actions">
        <button @click="publishAnnouncement">{{ editingId ? '保存修改' : '发布' }}</button>
        <button class="secondary-btn" @click="cancelForm">取消</button>
      </div>
    </div>
    <button v-else class="add-btn" @click="showForm = true">+ 发布公告</button>

    <!-- 公告信息表 -->
    <div class="table-wrap page-lite">
      <table class="ann-table">
        <thead>
          <tr>
            <th>公告标题</th>
            <th>内容</th>
            <th>开始时间</th>
            <th>结束时间</th>
            <th>状态</th>
            <th>点击量</th>
            <th>置顶</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td class="cell-title">{{ item.title }}</td>
            <td class="cell-content">{{ item.content }}</td>
            <td class="cell-time">{{ item.startDate }} {{ item.startTime }}</td>
            <td class="cell-time">{{ item.endDate }} {{ item.endTime }}</td>
            <td><span :class="['ann-status', item.published ? 'on' : 'off']">{{ item.published ? '已发布' : '草稿' }}</span></td>
            <td class="cell-clicks">{{ item.clicks }}</td>
            <td class="cell-pinned">
              <span v-if="item.pinned" class="pin-badge">📌</span>
              <span v-else class="pin-empty">-</span>
            </td>
            <td class="cell-actions">
              <button class="text-link" @click="editAnnouncement(item)">编辑</button>
              <button class="text-link" @click="pinAnnouncement(item)">{{ item.pinned ? '取消置顶' : '置顶' }}</button>
              <button class="text-link del" @click="deleteAnnouncement(item)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="list.length === 0" class="empty-state">
        <p class="empty-hint">暂无公告</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'

const showForm = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({ title: '', content: '', startDate: '', startTime: '', endDate: '', endTime: '' })

const list = ref([
  { id: 1, title: '社区公约更新通知', content: '为营造良好社区氛围，社区公约已更新，请所有用户遵守文明交流准则。', startDate: '2026-04-12', startTime: '09:00', endDate: '2026-04-30', endTime: '23:59', published: true, pinned: true, clicks: 3240 },
  { id: 2, title: '春季种子交换活动', content: '春季种子交换活动火热进行中，快来分享你的多余种子吧！活动截止至4月30日。', startDate: '2026-04-10', startTime: '08:00', endDate: '2026-04-30', endTime: '18:00', published: true, pinned: false, clicks: 2890 },
  { id: 3, title: '新增晒图分享话题', content: '社区新增"晒图分享"话题分类，上传你的种植美图赢积分奖励。', startDate: '2026-04-08', startTime: '10:00', endDate: '2026-05-08', endTime: '23:59', published: true, pinned: false, clicks: 1560 },
  { id: 4, title: '本周六社区直播预告', content: '本周六晚8点社区直播：家庭阳台番茄种植全流程分享，欢迎预约观看。', startDate: '2026-04-06', startTime: '20:00', endDate: '2026-04-06', endTime: '21:30', published: true, pinned: false, clicks: 4120 },
  { id: 5, title: '积分商城即将上线', content: '社区积分商城即将上线，参与互动可提前积累积分，敬请期待！', startDate: '2026-04-03', startTime: '00:00', endDate: '2026-04-20', endTime: '23:59', published: false, pinned: false, clicks: 890 },
  { id: 6, title: '园艺工具团购第二期', content: '园艺工具团购第二期开启，满50人成团享8折优惠，截止4月20日。', startDate: '2026-04-01', startTime: '09:00', endDate: '2026-04-20', endTime: '18:00', published: true, pinned: false, clicks: 2150 }
])

let nextId = 7

function publishAnnouncement() {
  if (!form.title || !form.content) return
  if (editingId.value) {
    const item = list.value.find(x => x.id === editingId.value)
    if (item) { item.title = form.title; item.content = form.content; item.startDate = form.startDate; item.startTime = form.startTime; item.endDate = form.endDate; item.endTime = form.endTime }
  } else {
    list.value.unshift({ id: nextId++, title: form.title, content: form.content, startDate: form.startDate, startTime: form.startTime, endDate: form.endDate, endTime: form.endTime, published: true, pinned: false, clicks: 0 })
  }
  cancelForm()
}

function editAnnouncement(item: any) {
  editingId.value = item.id; form.title = item.title; form.content = item.content; form.startDate = item.startDate; form.startTime = item.startTime; form.endDate = item.endDate; form.endTime = item.endTime; showForm.value = true
}

function cancelForm() {
  showForm.value = false; editingId.value = null; form.title = ''; form.content = ''; form.startDate = ''; form.startTime = ''; form.endDate = ''; form.endTime = ''
}

function pinAnnouncement(item: any) { item.pinned = !item.pinned }
function deleteAnnouncement(item: any) { list.value = list.value.filter(x => x.id !== item.id) }
</script>

<style scoped>
.page-title { margin: 0 0 14px; font-size: 22px; color: #1f2937; }

.add-btn { padding: 8px 18px; border-radius: 8px; border: none; background: #80ab64; color: #fff; font-size: 14px; cursor: pointer; margin-bottom: 14px; }
.add-btn:hover { background: #6e9a55; }

.ann-form { display: grid; gap: 10px; margin-bottom: 14px; }
.ann-form textarea { resize: vertical; }
.time-range { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.time-input-group { display: grid; gap: 6px; }
.time-input-group label { font-size: 12px; color: #6b7280; font-weight: 600; }
.time-input-group input { padding: 8px 12px; border-radius: 8px; border: 1px solid #d3d7de; font-size: 13px; }
.form-actions { display: flex; gap: 8px; }

.table-wrap { overflow-x: auto; }
.ann-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.ann-table th { text-align: left; padding: 10px 12px; color: #9ca3af; font-size: 12px; font-weight: 600; border-bottom: 1px solid #f0f0f0; }
.ann-table td { padding: 10px 12px; border-bottom: 1px solid #f8f8f8; }
.ann-table tr:hover td { background: #fafdfb; }

.cell-title { font-weight: 600; color: #1f2937; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-content { font-size: 13px; color: #6b7280; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-time { font-size: 12px; color: #9ca3af; }
.cell-clicks { font-weight: 600; color: #1f7a41; }
.cell-pinned { text-align: center; }
.pin-badge { font-size: 14px; }
.pin-empty { color: #d1d5db; }
.cell-actions { display: flex; gap: 4px; }

.ann-status { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.ann-status.on { background: #d1fae5; color: #065f46; }
.ann-status.off { background: #f3f4f6; color: #6b7280; }

.text-link { background: transparent; color: #1f7a41; border: none; padding: 2px 6px; font-size: 13px; cursor: pointer; }
.text-link:hover { text-decoration: underline; }
.text-link.del { color: #dc2626; }

.empty-state { text-align: center; padding: 30px; }
.empty-hint { color: #9ca3af; margin: 0; font-size: 13px; }
</style>
