<template>
  <AdminLayout>
    <h2 class="page-title">推广文章管理</h2>

    <!-- 发布表单 -->
    <div v-if="showForm" class="post-form page-lite">
      <div class="form-layout">
        <div class="form-left">
          <input v-model="form.title" placeholder="文章标题" />
          <textarea v-model="form.content" placeholder="文章内容..." rows="4"></textarea>
          <div class="form-actions">
            <button @click="publishPost">{{ editingId ? '保存修改' : '发布' }}</button>
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
    <button v-else class="add-btn" @click="showForm = true">+ 发布推广文章</button>

    <!-- 文章列表 -->
    <div v-if="posts.length === 0" class="empty-state page-lite">
      <p class="empty-hint">暂无推广文章</p>
    </div>
    <div v-else class="post-list">
      <div class="post-card page-lite" v-for="item in posts" :key="item.id">
        <div class="post-main">
          <div class="post-header">
            <div>
              <h3 class="post-title">{{ item.title }}</h3>
              <span class="official-badge">官方</span>
            </div>
            <span class="post-date">{{ item.date }}</span>
          </div>
          <p class="post-content">{{ item.content }}</p>
          <div class="post-actions">
            <button class="text-link" @click="editPost(item)">编辑</button>
            <button class="text-link del" @click="deletePost(item)">删除</button>
          </div>
        </div>
        <div v-if="item.imageUrl" class="post-image">{{ item.imageUrl }}</div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'

const showForm = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({ title: '', content: '', imageUrl: '', imagePreview: '' })

const posts = ref([
  { id: 1, title: '春季种植指南', content: '春季是种植的黄金季节，选择合适的种子和工具能事半功倍。我们为您精选了最适合春季种植的产品组合。', imageUrl: 'spring-guide.jpg', date: '2026-04-10' },
  { id: 2, title: '阳台种菜新手入门', content: '没有花园也能种菜！阳台种菜只需要简单的工具和正确的方法。本文详细介绍了如何在阳台上成功种植蔬菜。', imageUrl: 'balcony-veg.jpg', date: '2026-04-08' }
])

let nextId = 3

function publishPost() {
  if (!form.title || !form.content) return
  if (editingId.value) {
    const item = posts.value.find(x => x.id === editingId.value)
    if (item) { item.title = form.title; item.content = form.content; item.imageUrl = form.imageUrl }
  } else {
    posts.value.unshift({ id: nextId++, title: form.title, content: form.content, imageUrl: form.imageUrl, date: new Date().toISOString().slice(0, 10) })
  }
  cancelForm()
}

function editPost(item: any) {
  editingId.value = item.id; form.title = item.title; form.content = item.content; form.imageUrl = item.imageUrl; showForm.value = true
}

function cancelForm() {
  showForm.value = false; editingId.value = null; form.title = ''; form.content = ''; form.imageUrl = ''; form.imagePreview = ''
}

function deletePost(item: any) { posts.value = posts.value.filter(x => x.id !== item.id) }

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
</script>

<style scoped>
.page-title { margin: 0 0 14px; font-size: 22px; color: #1f2937; }
.add-btn { padding: 8px 18px; border-radius: 8px; border: none; background: #80ab64; color: #fff; font-size: 14px; cursor: pointer; margin-bottom: 14px; }
.add-btn:hover { background: #6e9a55; }

.post-form { display: grid; gap: 10px; margin-bottom: 14px; }
.post-form textarea { resize: vertical; }
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

.post-list { display: grid; gap: 12px; }
.post-card { display: grid; grid-template-columns: 1fr 120px; gap: 16px; align-items: stretch; }

.post-main { display: grid; gap: 10px; }

.post-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.post-header > div { display: flex; align-items: center; gap: 8px; }
.post-title { margin: 0; font-size: 16px; color: #1f2937; }
.official-badge { display: inline-block; padding: 2px 8px; background: #fef3c7; color: #92400e; border-radius: 4px; font-size: 11px; font-weight: 600; }
.post-date { font-size: 12px; color: #9ca3af; }

.post-content { margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6; }

.post-image { width: 120px; height: 100%; min-height: 100px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #9ca3af; text-align: center; padding: 8px; word-break: break-word; }

.post-actions { display: flex; gap: 8px; }
.text-link { background: transparent; color: #1f7a41; border: none; padding: 2px 6px; font-size: 13px; cursor: pointer; }
.text-link:hover { text-decoration: underline; }
.text-link.del { color: #dc2626; }

.empty-state { text-align: center; padding: 30px; }
.empty-hint { color: #9ca3af; margin: 0; }
</style>
