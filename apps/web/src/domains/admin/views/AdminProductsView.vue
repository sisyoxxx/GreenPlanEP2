<template>
  <AdminLayout>
    <div class="page-shell">
      <section class="page-head page-lite">
        <div>
          <h2 class="page-title">商品管理</h2>
          <p class="page-desc">维护商品信息并同步到前台商品页、首页与购物流程。</p>
        </div>
        <div class="head-actions">
          <button class="secondary-btn" :disabled="loading" @click="loadProducts">{{ loading ? '刷新中...' : '刷新' }}</button>
          <button @click="toggleForm">{{ showForm ? '收起表单' : '新增商品' }}</button>
        </div>
      </section>

      <section v-if="showForm" class="page-lite form-card">
        <h3>{{ editingId ? '编辑商品' : '新增商品' }}</h3>
        <div class="form-grid">
          <label>
            <span>商品名称</span>
            <input v-model.trim="form.name" type="text" placeholder="请输入商品名称" />
          </label>
          <label>
            <span>SKU</span>
            <input v-model.trim="form.sku" type="text" placeholder="如：GP-SEED-001" />
          </label>
          <label>
            <span>分类</span>
            <select v-model="form.category">
              <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>
          <label>
            <span>品种</span>
            <input v-model.trim="form.variety" type="text" placeholder="如：樱桃番茄" />
          </label>
          <label>
            <span>产地</span>
            <input v-model.trim="form.origin" type="text" placeholder="如：山东寿光" />
          </label>
          <label>
            <span>发芽率(%)</span>
            <input v-model.number="form.germinationRate" type="number" min="0" max="100" step="0.01" />
          </label>
          <label>
            <span>价格</span>
            <input v-model.number="form.price" type="number" min="0.01" step="0.01" />
          </label>
          <label>
            <span>库存</span>
            <input v-model.number="form.initialStock" type="number" min="0" />
          </label>
          <label>
            <span>种植月份</span>
            <input v-model.trim="form.plantingMonth" type="text" placeholder="如：3-6月" />
          </label>
          <label>
            <span>适宜地区</span>
            <input v-model.trim="form.suitableRegion" type="text" placeholder="如：华东/华南" />
          </label>
          <label class="full-span">
            <span>图片地址</span>
            <input v-model.trim="form.imageUrl" type="text" placeholder="https://..." />
          </label>
          <label class="full-span">
            <span>商品描述</span>
            <textarea v-model.trim="form.description" rows="4" placeholder="请输入商品描述"></textarea>
          </label>
        </div>

        <div class="form-actions">
          <button :disabled="submitting" @click="submitProduct">{{ submitting ? '保存中...' : editingId ? '保存修改' : '创建商品' }}</button>
          <button class="secondary-btn" :disabled="submitting" @click="cancelEdit">取消</button>
        </div>
      </section>

      <section class="page-lite table-card">
        <div class="table-tools">
          <input v-model.trim="keyword" type="text" placeholder="搜索商品名、SKU、分类、品种或产地" />
        </div>

        <p v-if="message" class="message">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>

        <div v-if="loading && products.length === 0" class="empty-state">商品加载中...</div>
        <div v-else-if="displayProducts.length === 0" class="empty-state">暂无匹配商品</div>

        <div v-else class="table-wrap">
          <table class="prod-table">
            <thead>
              <tr>
                <th>商品</th>
                <th>SKU</th>
                <th>分类</th>
                <th>品种</th>
                <th>产地</th>
                <th>发芽率</th>
                <th>价格</th>
                <th>库存</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in displayProducts" :key="item.id">
                <td>
                  <div class="name-cell">
                    <img v-if="item.imageUrl" :src="item.imageUrl" alt="product" />
                    <div>
                      <strong>{{ item.name }}</strong>
                      <p>{{ item.description || '暂无描述' }}</p>
                    </div>
                  </div>
                </td>
                <td>{{ item.sku }}</td>
                <td>{{ item.category || '-' }}</td>
                <td>{{ item.variety || '-' }}</td>
                <td>{{ item.origin || '-' }}</td>
                <td>{{ Number(item.germinationRate || 0).toFixed(2) }}%</td>
                <td>¥{{ Number(item.price).toFixed(2) }}</td>
                <td>{{ item.onlineStock }}</td>
                <td>
                  <span :class="['status-tag', item.status === 'PUBLISHED' ? 'on' : 'off']">
                    {{ item.status === 'PUBLISHED' ? '在售' : '下架' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="text-link" @click="startEdit(item)">编辑</button>
                    <button class="text-link" @click="toggleStatus(item)">{{ item.status === 'PUBLISHED' ? '下架' : '上架' }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import { createProduct, fetchAdminProducts, updateProduct, updateProductStatus, type AdminProduct } from '../api'

const route = useRoute()
const router = useRouter()

const categoryOptions = ['蔬菜种子', '花卉种子', '香草种子', '营养肥料', '园艺工具', '多肉植物', '其他']

const loading = ref(false)
const submitting = ref(false)
const showForm = ref(false)
const editingId = ref<number | null>(null)
const message = ref('')
const error = ref('')
const keyword = ref(String(route.query.keyword || ''))
const products = ref<AdminProduct[]>([])

const displayProducts = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return products.value
  return products.value.filter((item) =>
    [item.name, item.sku, item.category || '', item.variety || '', item.origin || '', item.description || '']
      .some((text) => String(text).toLowerCase().includes(kw))
  )
})

const form = reactive({
  sku: '',
  name: '',
  description: '',
  price: 0,
  category: categoryOptions[0],
  variety: '',
  plantingMonth: '全年',
  suitableRegion: '全国',
  origin: '',
  germinationRate: 85,
  imageUrl: '',
  initialStock: 0
})

onMounted(loadProducts)

watch(() => route.query.keyword, (value) => {
  keyword.value = String(value || '')
})

watch(keyword, (value) => {
  const query = { ...route.query }
  if (value.trim()) query.keyword = value.trim()
  else delete query.keyword
  router.replace({ query })
})

async function loadProducts() {
  loading.value = true
  error.value = ''
  try {
    const list = await fetchAdminProducts()
    products.value = [...list].sort((a, b) => b.id - a.id)
  } catch (err: any) {
    error.value = err?.response?.data?.message || '加载商品失败'
  } finally {
    loading.value = false
  }
}

function toggleForm() {
  if (showForm.value) {
    cancelEdit()
    return
  }
  resetForm()
  showForm.value = true
}

function startEdit(item: AdminProduct) {
  editingId.value = item.id
  showForm.value = true
  form.sku = item.sku || ''
  form.name = item.name || ''
  form.description = item.description || ''
  form.price = Number(item.price || 0)
  form.category = item.category || categoryOptions[0]
  form.variety = item.variety || ''
  form.plantingMonth = item.plantingMonth || '全年'
  form.suitableRegion = item.suitableRegion || '全国'
  form.origin = item.origin || ''
  form.germinationRate = Number(item.germinationRate || 85)
  form.imageUrl = item.imageUrl || ''
  form.initialStock = Number(item.onlineStock || 0)
}

function resetForm() {
  editingId.value = null
  form.sku = ''
  form.name = ''
  form.description = ''
  form.price = 0
  form.category = categoryOptions[0]
  form.variety = ''
  form.plantingMonth = '全年'
  form.suitableRegion = '全国'
  form.origin = ''
  form.germinationRate = 85
  form.imageUrl = ''
  form.initialStock = 0
}

function cancelEdit() {
  resetForm()
  showForm.value = false
}

async function submitProduct() {
  message.value = ''
  error.value = ''

  if (
    !form.name ||
    !form.sku ||
    !form.category ||
    !form.variety ||
    !form.plantingMonth ||
    !form.suitableRegion ||
    !form.origin ||
    form.price <= 0 ||
    Number(form.germinationRate) < 0 ||
    Number(form.germinationRate) > 100
  ) {
    error.value = '请完整填写必填项，并确保价格和发芽率范围正确。'
    return
  }

  submitting.value = true
  const payload = {
    sku: form.sku,
    name: form.name,
    description: form.description,
    price: form.price,
    category: form.category,
    variety: form.variety,
    plantingMonth: form.plantingMonth,
    suitableRegion: form.suitableRegion,
    origin: form.origin,
    germinationRate: Number(form.germinationRate),
    imageUrl: form.imageUrl,
    initialStock: Math.max(0, Number(form.initialStock || 0))
  }

  try {
    if (editingId.value) {
      await updateProduct(editingId.value, payload)
      message.value = '商品已更新'
    } else {
      await createProduct(payload)
      message.value = '商品已创建'
    }
    await loadProducts()
    cancelEdit()
  } catch (err: any) {
    error.value = err?.response?.data?.message || '保存商品失败'
  } finally {
    submitting.value = false
  }
}

async function toggleStatus(item: AdminProduct) {
  message.value = ''
  error.value = ''
  try {
    const next = item.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED'
    await updateProductStatus(item.id, next)
    item.status = next
    message.value = `商品已${next === 'PUBLISHED' ? '上架' : '下架'}`
  } catch (err: any) {
    error.value = err?.response?.data?.message || '更新商品状态失败'
  }
}
</script>

<style scoped>
.page-shell {
  display: grid;
  gap: 14px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
}

.page-title {
  margin: 0;
  color: #16351f;
}

.page-desc {
  margin: 6px 0 0;
  color: #6b7280;
}

.head-actions,
.form-actions,
.row-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.form-card {
  display: grid;
  gap: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

label {
  display: grid;
  gap: 6px;
}

label span {
  font-size: 12px;
  color: #4b5563;
  font-weight: 700;
}

.full-span {
  grid-column: 1 / -1;
}

.table-card {
  display: grid;
  gap: 10px;
}

.table-tools {
  display: flex;
}

.table-tools input {
  width: 100%;
}

.table-wrap {
  overflow-x: auto;
}

.prod-table {
  width: 100%;
  border-collapse: collapse;
}

.prod-table th,
.prod-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #edf1ee;
  text-align: left;
  vertical-align: top;
}

.prod-table th {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

.name-cell {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  gap: 10px;
}

.name-cell img {
  width: 54px;
  height: 54px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid #e3ece5;
}

.name-cell strong {
  color: #1f2937;
}

.name-cell p {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 12px;
}

.status-tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-tag.on {
  background: #e8f6eb;
  color: #1f7a41;
}

.status-tag.off {
  background: #f3f4f6;
  color: #6b7280;
}

.text-link {
  border: none;
  background: transparent;
  color: #1f7a41;
  padding: 0;
  font-size: 13px;
}

.message {
  margin: 0;
  color: #1f7a41;
  font-weight: 600;
}

.error {
  margin: 0;
  color: #dc2626;
  font-weight: 600;
}

.empty-state {
  color: #6b7280;
  text-align: center;
  padding: 24px 0;
}

@media (max-width: 1280px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>