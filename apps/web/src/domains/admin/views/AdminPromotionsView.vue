<template>
  <AdminLayout>
    <section class="page-head">
      <div>
        <h2 class="page-title">促销位管理</h2>
        <p class="page-desc">当前页面已接到后端促销位表，支持按首页位和商品页位分别查看。</p>
      </div>
      <div class="head-actions">
        <span class="type-chip">{{ currentTypeLabel }}</span>
        <button class="secondary-btn" @click="loadPromotions" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新列表' }}
        </button>
      </div>
    </section>

    <section class="page-lite editor-card">
      <h3>新增促销位</h3>
      <input v-model.trim="form.title" placeholder="请输入促销标题" />
      <input v-model.trim="form.imageUrl" placeholder="图片地址，可选" />
      <textarea v-model.trim="form.description" rows="4" placeholder="请输入促销说明"></textarea>
      <div class="form-actions">
        <button @click="submitPromotion" :disabled="submitting">
          {{ submitting ? '提交中...' : '新增促销位' }}
        </button>
        <button class="secondary-btn" @click="resetForm" :disabled="submitting">清空</button>
      </div>
      <p v-if="message" class="message">{{ message }}</p>
    </section>

    <section class="page-lite table-card">
      <div class="table-head">
        <h3>{{ currentTypeLabel }}</h3>
        <span class="count-chip">{{ filteredPromotions.length }} 条</span>
      </div>

      <div v-if="loading && promotions.length === 0" class="empty-state">促销数据加载中...</div>
      <div v-else-if="error" class="empty-state error">{{ error }}</div>
      <div v-else-if="filteredPromotions.length === 0" class="empty-state">当前分类还没有促销位数据</div>

      <div v-else class="table-wrap">
        <table class="promo-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>说明</th>
              <th>图片地址</th>
              <th>状态</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredPromotions" :key="item.id">
              <td class="cell-title">{{ item.title }}</td>
              <td class="cell-desc">{{ item.description }}</td>
              <td class="cell-image">{{ item.imageUrl || '未配置' }}</td>
              <td>
                <span class="status-badge">{{ item.status }}</span>
              </td>
              <td class="cell-time">{{ formatDateTime(item.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import { createPromotion, fetchPromotions, type AdminPromotion } from '../api'

const route = useRoute()

const promotions = ref<AdminPromotion[]>([])
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const message = ref('')

const form = reactive({
  title: '',
  imageUrl: '',
  description: ''
})

const currentType = computed(() => (route.query.type as string) || 'home')
const currentTypeLabel = computed(() => (currentType.value === 'product' ? '商品页促销位' : '首页促销位'))
const filteredPromotions = computed(() =>
  promotions.value.filter((item) => item.strategyType === currentType.value)
)

onMounted(() => {
  loadPromotions()
})

async function loadPromotions() {
  loading.value = true
  error.value = ''

  try {
    promotions.value = await fetchPromotions()
  } catch (err: any) {
    error.value = err?.response?.data?.message || '促销数据加载失败'
  } finally {
    loading.value = false
  }
}

async function submitPromotion() {
  message.value = ''
  if (!form.title || !form.description) {
    message.value = '请先填写促销标题和说明'
    return
  }

  submitting.value = true
  try {
    await createPromotion({
      title: form.title,
      strategyType: currentType.value,
      description: form.description,
      imageUrl: form.imageUrl
    })
    resetForm()
    message.value = '促销位已创建'
    await loadPromotions()
  } catch (err: any) {
    message.value = err?.response?.data?.message || '促销位创建失败'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  form.title = ''
  form.imageUrl = ''
  form.description = ''
}

function formatDateTime(value: string | null) {
  if (!value) return '未记录'
  return value.replace('T', ' ').slice(0, 16)
}
</script>

<style scoped>
.page-head,
.editor-card,
.table-card {
  display: grid;
  gap: 14px;
}

.page-head {
  grid-template-columns: 1fr auto;
  align-items: start;
  margin-bottom: 14px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  color: #1f2937;
}

.page-desc {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.head-actions,
.table-head,
.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.type-chip,
.count-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
}

.table-wrap {
  overflow-x: auto;
}

.promo-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.promo-table th,
.promo-table td {
  padding: 12px;
  border-bottom: 1px solid #eef2ef;
  text-align: left;
  vertical-align: top;
}

.promo-table th {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

.cell-title {
  min-width: 180px;
  font-weight: 700;
  color: #1f2937;
}

.cell-desc {
  min-width: 300px;
  color: #4b5563;
  line-height: 1.7;
}

.cell-image,
.cell-time {
  color: #6b7280;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dff5e4;
  color: #166534;
  font-size: 12px;
  font-weight: 700;
}

.empty-state {
  padding: 28px 10px;
  text-align: center;
  color: #6b7280;
}

.error {
  color: #dc2626;
}

.message {
  margin: 0;
  color: #1f7a41;
  font-weight: 600;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}
</style>
