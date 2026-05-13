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
          <button @click="openCreate">新增商品</button>
        </div>
      </section>

      <BaseModal
        :open="showForm"
        :title="editingId ? '编辑商品' : '新增商品'"
        size="lg"
        @close="cancelEdit"
      >
        <ProductForm
          :form="form"
          :is-edit="!!editingId"
          :submitting="submitting"
          @update:form="Object.assign(form, $event)"
          @submit="submitProduct"
          @cancel="cancelEdit"
        />
        <template #footer>
          <button class="secondary-btn" :disabled="submitting" @click="cancelEdit">取消</button>
          <button :disabled="submitting" @click="submitProduct()">{{ submitting ? '保存中...' : (editingId ? '保存修改' : '创建商品') }}</button>
        </template>
      </BaseModal>

      <section class="page-lite table-card">
        <div class="table-tools">
          <input v-model.trim="keyword" type="text" placeholder="搜索商品名、SKU、分类、品种或产地" />
        </div>

        <p v-if="message" class="message">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>

        <div class="batch-bar" v-if="selectedIds.length > 0">
          <span>已选择 {{ selectedIds.length }} 项</span>
          <button class="danger-btn" @click="openBatchDelete">批量删除</button>
        </div>

        <ProductTable
          :items="displayProducts"
          :loading="loading"
          :selected-ids="selectedIds"
          :is-all-selected="isAllSelected"
          @edit="startEdit"
          @toggle-status="toggleStatus"
          @delete="openSingleDelete"
          @toggle-select="toggleSelect"
          @toggle-select-all="toggleSelectAll"
        />
      </section>

      <BaseModal
        :open="showDeleteConfirm"
        :title="deleteMode === 'single' ? '确认删除' : '确认批量删除'"
        size="sm"
        @close="cancelDelete"
      >
        <p v-if="deleteMode === 'single'">
          确定要删除商品 <strong>{{ deleteTargetName }}</strong> 吗？<br />
          删除后该商品将不再展示，已有的订单和评价数据会被保留，但用户无法继续购买。
        </p>
        <p v-else>
          确定要删除选中的 <strong>{{ selectedIds.length }}</strong> 个商品吗？<br />
          删除后这些商品将不再展示，已有的订单和评价数据会被保留，但用户无法继续购买。
        </p>
        <template #footer>
          <button class="secondary-btn" @click="cancelDelete">取消</button>
          <button class="danger-btn" @click="confirmDelete">确认删除</button>
        </template>
      </BaseModal>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import BaseModal from '../../../shared/components/BaseModal.vue'
import ProductForm from '../components/ProductForm.vue'
import ProductTable from '../components/ProductTable.vue'
import { createProduct, fetchAdminProducts, updateProduct, updateProductStatus, deleteProduct, batchDeleteProducts, type AdminProduct } from '../api'

const route = useRoute()
const router = useRouter()

const categoryOptions = [
  { value: 'VEGETABLE', label: '蔬菜种子' },
  { value: 'FLOWER', label: '花卉种子' },
  { value: 'HERB', label: '草本植物' },
  { value: 'SUCCULENT', label: '多肉植物' },
  { value: 'TOOL', label: '种植工具' },
  { value: 'FERTILIZER', label: '营养肥料' },
]

const loading = ref(false)
const submitting = ref(false)
const showForm = ref(false)
const editingId = ref<number | null>(null)
const message = ref('')
const error = ref('')
const keyword = ref(String(route.query.keyword || ''))
const products = ref<AdminProduct[]>([])
const selectedIds = ref<number[]>([])
const showDeleteConfirm = ref(false)
const deleteMode = ref<'single' | 'batch'>('single')
const deleteTargetName = ref('')

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
  category: categoryOptions[0].value,
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

function openCreate() {
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
  form.category = item.category || categoryOptions[0].value
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
  form.category = categoryOptions[0].value
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

async function submitProduct(overrideForm?: typeof form) {
  message.value = ''
  error.value = ''

  // 如果 ProductForm 直接传了表单数据，先同步到 form（避免 watch 异步延迟）
  if (overrideForm) {
    Object.assign(form, overrideForm)
  }

  if (
    !form.name ||
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
  const payload: any = {
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
  if (editingId.value) {
    payload.sku = form.sku
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

const isAllSelected = computed(() => {
  return displayProducts.value.length > 0 && displayProducts.value.every((item) => selectedIds.value.includes(item.id))
})

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = displayProducts.value.map((item) => item.id)
  }
}

function openSingleDelete(item: AdminProduct) {
  deleteMode.value = 'single'
  deleteTargetName.value = item.name
  showDeleteConfirm.value = true
}

function openBatchDelete() {
  deleteMode.value = 'batch'
  deleteTargetName.value = ''
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
}

async function confirmDelete() {
  message.value = ''
  error.value = ''
  try {
    if (deleteMode.value === 'single') {
      await deleteProduct(selectedIds.value[0])
      message.value = '商品已删除'
    } else {
      await batchDeleteProducts([...selectedIds.value])
      message.value = `已删除 ${selectedIds.value.length} 个商品`
    }
    selectedIds.value = []
    showDeleteConfirm.value = false
    await loadProducts()
  } catch (err: any) {
    error.value = err?.response?.data?.message || '删除失败'
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

.head-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #7f1d1d;
  font-size: 14px;
}

.danger-btn {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.danger-btn:hover {
  background: #b91c1c;
}

@media (max-width: 760px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
