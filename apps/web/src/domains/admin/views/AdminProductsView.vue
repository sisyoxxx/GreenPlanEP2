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

        <ProductTable
          :items="displayProducts"
          :loading="loading"
          @edit="startEdit"
          @toggle-status="toggleStatus"
        />
      </section>
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

async function submitProduct(overrideForm?: typeof form) {
  message.value = ''
  error.value = ''

  // 如果 ProductForm 直接传了表单数据，先同步到 form（避免 watch 异步延迟）
  if (overrideForm) {
    Object.assign(form, overrideForm)
  }

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

@media (max-width: 760px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
