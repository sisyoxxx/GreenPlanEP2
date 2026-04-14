<template>
  <AdminLayout>
    <h2 class="page-title">促销管理</h2>

    <!-- 当前分类显示 + 新增按钮 -->
    <div class="filter-header page-lite">
      <div class="filter-info">
        <span class="filter-label">当前分类：</span>
        <span class="filter-value">{{ currentTypeLabel }}</span>
      </div>
      <button class="add-btn" @click="showForm = !showForm">{{ showForm ? '✕ 收起' : '+ 新增促销' }}</button>
    </div>

    <!-- 新增表单 -->
    <div v-if="showForm" class="promo-form page-lite">
      <div class="form-layout">
        <div class="form-left">
          <input v-model="form.title" placeholder="促销标题" />
          <textarea v-model="form.description" placeholder="促销描述..." rows="3"></textarea>
          <div class="form-actions">
            <button @click="savePromo">{{ editingId ? '保存修改' : '添加' }}</button>
            <button class="secondary-btn" @click="cancelForm">取消</button>
          </div>
        </div>
        <div class="form-right">
          <label class="image-upload-label">
            <input type="file" accept="image/*" @change="handleImageUpload" />
            <div class="image-upload-box">
              <div v-if="form.imagePreview" class="image-preview">{{ form.imagePreview }}</div>
              <div v-else class="image-placeholder">
                <span class="upload-icon">📷</span>
                <span class="upload-text">上传图片</span>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- 促销信息表 -->
    <div class="table-wrap page-lite">
      <table class="promo-table">
        <thead>
          <tr>
            <th>促销标题</th>
            <th>分类</th>
            <th>描述</th>
            <th>点击量</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredPromos" :key="item.id">
            <td class="cell-title">{{ item.title }}</td>
            <td class="cell-type">{{ item.type === 'home' ? '首页轮播' : '商品页轮播' }}</td>
            <td class="cell-desc">{{ item.description }}</td>
            <td class="cell-clicks">{{ item.clicks }}</td>
            <td class="cell-date">{{ item.createdAt }}</td>
            <td class="cell-actions">
              <button class="text-link" @click="editPromo(item)">编辑</button>
              <button class="text-link del" @click="deletePromo(item)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredPromos.length === 0" class="empty-state">
        <p class="empty-hint">暂无促销信息</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '../../../layouts/AdminLayout.vue'

const route = useRoute()
const showForm = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({ title: '', imageUrl: '', imagePreview: '', description: '' })

const promos = ref([
  { id: 1, title: '春季种子大促', type: 'home', imageUrl: 'spring-seeds.jpg', description: '春季种子全场8折，限时3天', clicks: 1250, createdAt: '2026-04-10' },
  { id: 2, title: '新品上市', type: 'home', imageUrl: 'new-products.jpg', description: '新品园艺工具套装首发', clicks: 890, createdAt: '2026-04-08' },
  { id: 3, title: '满减活动', type: 'product', imageUrl: 'discount.jpg', description: '满99元减10元', clicks: 2150, createdAt: '2026-04-05' },
  { id: 4, title: '买赠活动', type: 'product', imageUrl: 'gift.jpg', description: '购买种子套装送肥料', clicks: 1680, createdAt: '2026-04-03' },
  { id: 5, title: '会员专享', type: 'home', imageUrl: 'member.jpg', description: '会员享受额外9折优惠', clicks: 3420, createdAt: '2026-04-01' },
  { id: 6, title: '限时秒杀', type: 'product', imageUrl: 'flash.jpg', description: '每日限时秒杀商品', clicks: 4560, createdAt: '2026-03-30' }
])

let nextId = 7

const currentType = computed(() => route.query.type as string || 'home')
const currentTypeLabel = computed(() => currentType.value === 'home' ? '首页轮播' : '商品页轮播')

const filteredPromos = computed(() => {
  return promos.value.filter(p => p.type === currentType.value)
})

function savePromo() {
  if (!form.title) return
  if (editingId.value) {
    const item = promos.value.find(x => x.id === editingId.value)
    if (item) { item.title = form.title; item.imageUrl = form.imageUrl; item.description = form.description }
  } else {
    promos.value.push({ id: nextId++, title: form.title, type: currentType.value, imageUrl: form.imageUrl, description: form.description, clicks: 0, createdAt: new Date().toISOString().slice(0, 10) })
  }
  cancelForm()
}

function editPromo(item: any) {
  editingId.value = item.id; form.title = item.title; form.imageUrl = item.imageUrl; form.description = item.description; showForm.value = true
}

function cancelForm() {
  showForm.value = false; editingId.value = null; form.title = ''; form.imageUrl = ''; form.imagePreview = ''; form.description = ''
}

function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      form.imagePreview = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function deletePromo(item: any) { promos.value = promos.value.filter(x => x.id !== item.id) }
</script>

<style scoped>
.page-title { margin: 0 0 14px; font-size: 22px; color: #1f2937; }

.filter-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; margin-bottom: 14px; background: #f0f7f1; border-radius: 8px; }
.filter-info { display: flex; align-items: center; gap: 10px; }
.filter-label { font-size: 14px; color: #6b7280; font-weight: 600; }
.filter-value { font-size: 14px; color: #1f7a41; font-weight: 600; }

.add-btn { padding: 8px 18px; border-radius: 8px; border: none; background: #80ab64; color: #fff; font-size: 14px; cursor: pointer; }
.add-btn:hover { background: #6e9a55; }

.promo-form { display: grid; gap: 10px; margin-bottom: 14px; }
.promo-form textarea { resize: vertical; }
.form-layout { display: grid; grid-template-columns: 1fr 180px; gap: 16px; }
.form-left { display: grid; gap: 10px; }
.form-right { display: flex; justify-content: center; }
.form-actions { display: flex; gap: 8px; }

.image-upload-label { cursor: pointer; }
.image-upload-label input { display: none; }
.image-upload-box { width: 180px; height: 180px; border: 2px dashed #d3d7de; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.image-upload-box:hover { border-color: #80ab64; background: #f9fdfb; }
.image-placeholder { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.upload-icon { font-size: 32px; }
.upload-text { font-size: 12px; color: #9ca3af; }
.image-preview { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; background-size: cover; background-position: center; }

.table-wrap { overflow-x: auto; }
.promo-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.promo-table th { text-align: left; padding: 10px 12px; color: #9ca3af; font-size: 12px; font-weight: 600; border-bottom: 1px solid #f0f0f0; }
.promo-table td { padding: 10px 12px; border-bottom: 1px solid #f8f8f8; }
.promo-table tr:hover td { background: #fafdfb; }

.cell-title { font-weight: 600; color: #1f2937; }
.cell-type { font-size: 13px; color: #6b7280; }
.cell-desc { font-size: 13px; color: #6b7280; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-clicks { font-weight: 600; color: #1f7a41; }
.cell-date { font-size: 12px; color: #9ca3af; }
.cell-actions { display: flex; gap: 4px; }

.text-link { background: transparent; color: #1f7a41; border: none; padding: 2px 6px; font-size: 13px; cursor: pointer; }
.text-link:hover { text-decoration: underline; }
.text-link.del { color: #dc2626; }

.empty-state { text-align: center; padding: 30px; }
.empty-hint { color: #9ca3af; margin: 0; font-size: 13px; }
</style>
