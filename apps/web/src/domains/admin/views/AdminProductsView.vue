<template>
  <AdminLayout>
    <div class="prod-header">
      <h2 class="page-title">商品管理</h2>
      <button class="add-btn" @click="showForm = !showForm">+ 新增商品</button>
    </div>

    <!-- 新增/编辑表单 -->
    <div v-if="showForm" class="prod-form page-lite">
      <div class="form-grid">
        <input v-model="form.name" placeholder="商品名称" />
        <input v-model="form.sku" placeholder="SKU" />
        <select v-model="form.category">
          <option value="">选择分类</option>
          <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
        </select>
        <input v-model.number="form.price" type="number" placeholder="价格" />
        <input v-model.number="form.stock" type="number" placeholder="库存" />
        <input v-model="form.imageUrl" placeholder="图片URL" />
      </div>
      <textarea v-model="form.description" placeholder="商品描述" rows="2"></textarea>
      <div class="form-actions">
        <button @click="saveProduct">{{ editingId ? '保存修改' : '添加商品' }}</button>
        <button class="secondary-btn" @click="cancelForm">取消</button>
      </div>
    </div>

    <!-- 商品表格 -->
    <div class="prod-table-wrap page-lite">
      <table class="prod-table">
        <thead>
          <tr><th>商品名称</th><th>SKU</th><th>分类</th><th>价格</th><th>库存</th><th>状态</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td class="cell-name">{{ p.name }}</td>
            <td>{{ p.sku }}</td>
            <td>{{ p.category }}</td>
            <td class="cell-price">¥{{ p.price }}</td>
            <td>{{ p.stock }}</td>
            <td><span :class="['shelf-tag', p.onShelf ? 'on' : 'off']">{{ p.onShelf ? '在售' : '已下架' }}</span></td>
            <td class="cell-actions">
              <button class="text-link" @click="editProduct(p)">编辑</button>
              <button class="text-link" @click="toggleShelf(p)">{{ p.onShelf ? '下架' : '上架' }}</button>
              <button class="text-link del" @click="deleteProduct(p)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'

const categoryOptions = ['蔬菜种子', '花卉种子', '香草种子', '营养肥料', '园艺工具']
const showForm = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({ name: '', sku: '', category: '', price: 0, stock: 0, imageUrl: '', description: '' })

const products = ref([
  { id: 1, name: '家庭番茄种植套装', sku: 'VEG-001', category: '蔬菜种子', price: 39, stock: 120, onShelf: true },
  { id: 2, name: '有机薄荷种子', sku: 'HRB-001', category: '香草种子', price: 15, stock: 200, onShelf: true },
  { id: 3, name: '阳台草莓种植全套', sku: 'VEG-002', category: '蔬菜种子', price: 139, stock: 45, onShelf: true },
  { id: 4, name: '迷你园艺工具三件套', sku: 'TL-001', category: '园艺工具', price: 30, stock: 80, onShelf: true },
  { id: 5, name: '有机营养土 5L', sku: 'FT-001', category: '营养肥料', price: 50, stock: 150, onShelf: true },
  { id: 6, name: '向日葵种子', sku: 'FLW-001', category: '花卉种子', price: 12, stock: 300, onShelf: true },
  { id: 7, name: '冬季耐寒花卉种子', sku: 'FLW-002', category: '花卉种子', price: 18, stock: 60, onShelf: false },
  { id: 8, name: '自动浇水器', sku: 'TL-002', category: '园艺工具', price: 71, stock: 35, onShelf: true }
])

let nextId = 9
function saveProduct() {
  if (!form.name || !form.sku) return
  if (editingId.value) {
    const p = products.value.find(x => x.id === editingId.value)
    if (p) { Object.assign(p, { name: form.name, sku: form.sku, category: form.category, price: form.price, stock: form.stock }) }
  } else {
    products.value.unshift({ id: nextId++, name: form.name, sku: form.sku, category: form.category, price: form.price, stock: form.stock, onShelf: true })
  }
  cancelForm()
}

function editProduct(p: any) {
  editingId.value = p.id
  Object.assign(form, { name: p.name, sku: p.sku, category: p.category, price: p.price, stock: p.stock })
  showForm.value = true
}

function cancelForm() {
  showForm.value = false; editingId.value = null
  Object.assign(form, { name: '', sku: '', category: '', price: 0, stock: 0, imageUrl: '', description: '' })
}

function toggleShelf(p: any) { p.onShelf = !p.onShelf }
function deleteProduct(p: any) { products.value = products.value.filter(x => x.id !== p.id) }
</script>

<style scoped>
.page-title { margin: 0; font-size: 22px; color: #1f2937; }
.prod-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.add-btn { padding: 8px 18px; border-radius: 8px; border: none; background: #80ab64; color: #fff; font-size: 14px; cursor: pointer; }
.add-btn:hover { background: #6e9a55; }

.prod-form { display: grid; gap: 10px; margin-bottom: 14px; }
.form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.prod-form textarea { resize: vertical; }
.form-actions { display: flex; gap: 8px; }

.prod-table-wrap { overflow-x: auto; }
.prod-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.prod-table th { text-align: left; padding: 10px 12px; color: #9ca3af; font-size: 12px; font-weight: 600; border-bottom: 1px solid #f0f0f0; }
.prod-table td { padding: 10px 12px; border-bottom: 1px solid #f8f8f8; }
.prod-table tr:hover td { background: #fafdfb; }

.cell-name { font-weight: 600; color: #1f2937; }
.cell-price { font-weight: 600; }
.cell-actions { display: flex; gap: 4px; }

.shelf-tag { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.shelf-tag.on { background: #d1fae5; color: #065f46; }
.shelf-tag.off { background: #fee2e2; color: #991b1b; }

.text-link { background: transparent; color: #1f7a41; border: none; padding: 2px 6px; font-size: 13px; cursor: pointer; }
.text-link:hover { text-decoration: underline; }
.text-link.del { color: #dc2626; }
.text-link.del:hover { color: #991b1b; }
</style>
