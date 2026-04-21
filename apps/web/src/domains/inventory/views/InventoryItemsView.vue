<template>
  <InventoryLayout title="商品库存" subtitle="查看商品名称、在线库存和预警阈值">
    <template #actions>
      <button class="secondary-btn" @click="reload" :disabled="loading">{{ loading ? '加载中...' : '刷新' }}</button>
      <RouterLink class="text-link" to="/inventory/inbound">去入库 →</RouterLink>
      <RouterLink class="text-link" to="/inventory/warnings">去预警设置 →</RouterLink>
    </template>

    <section class="page-lite">
      <div class="section-head">
        <div>
          <h2 class="section-title">库存列表</h2>
          <p class="section-subtitle">统一查看所有商品库存，并支持直接执行快速入库与预警调整。</p>
        </div>
        <span class="count-pill">共 {{ rows.length }} 个商品</span>
      </div>

      <div v-if="loading" class="empty">库存数据加载中...</div>
      <div v-else-if="rows.length === 0 && !error" class="empty">暂无库存数据</div>

      <div v-else-if="rows.length > 0" class="table">
        <div class="thead">
          <div>商品</div>
          <div class="right">在线库存</div>
          <div class="right">预警阈值</div>
          <div class="right">操作</div>
        </div>
        <div class="trow" v-for="row in rows" :key="row.productId">
          <div class="name">
            <div class="title">{{ row.name }}</div>
            <div class="sub">ID: {{ row.productId }} · SKU: {{ row.sku || '-' }}</div>
          </div>
          <div class="right">
            <strong :class="['stock-value', { low: row.onlineStock <= row.warningThreshold }]">
              {{ row.onlineStock }}
            </strong>
          </div>
          <div class="right">{{ row.warningThreshold }}</div>
          <div class="right actions">
            <button class="secondary-btn" @click="openInbound(row)">入库</button>
            <button class="secondary-btn" @click="openThreshold(row)">预警</button>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-card">
        <p class="error-title">库存列表加载失败</p>
        <p class="error-text">{{ error }}</p>
        <p v-if="showAuthHint" class="error-tip">登录状态可能已过期，请重新登录库存管理员账号 `stockadmin / 123456`。</p>
      </div>

      <p v-if="message" class="home-message">{{ message }}</p>
    </section>

    <section v-if="activeInbound" class="page-lite form-panel">
      <h2 class="section-title">快速入库 · {{ activeInbound.name }}</h2>
      <form class="form-shell" @submit.prevent="submitInbound">
        <div class="grid grid-2">
          <label class="field">
            <span class="field-label">商品 ID</span>
            <input :value="activeInbound.productId" disabled />
          </label>
          <label class="field">
            <span class="field-label">入库数量</span>
            <input v-model.number="inboundForm.quantity" type="number" min="1" required />
          </label>
        </div>
        <label class="field">
          <span class="field-label">备注</span>
          <input v-model="inboundForm.note" placeholder="例如: 采购入库 / 盘点调整" />
        </label>
        <div class="row-actions">
          <button type="button" class="secondary-btn" @click="closeInbound">取消</button>
          <button type="submit" :disabled="submitting">{{ submitting ? '提交中...' : '确认入库' }}</button>
        </div>
      </form>
    </section>

    <section v-if="activeThreshold" class="page-lite form-panel">
      <h2 class="section-title">设置预警 · {{ activeThreshold.name }}</h2>
      <form class="form-shell" @submit.prevent="submitThreshold">
        <div class="grid grid-2">
          <label class="field">
            <span class="field-label">商品 ID</span>
            <input :value="activeThreshold.productId" disabled />
          </label>
          <label class="field">
            <span class="field-label">预警阈值</span>
            <input v-model.number="thresholdForm.warningThreshold" type="number" min="0" required />
          </label>
        </div>
        <div class="row-actions">
          <button type="button" class="secondary-btn" @click="closeThreshold">取消</button>
          <button type="submit" :disabled="submitting">{{ submitting ? '提交中...' : '保存' }}</button>
        </div>
      </form>
    </section>
  </InventoryLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import InventoryLayout from '../components/InventoryLayout.vue'
import { fetchInventoryItems, inboundStock, updateWarningThreshold } from '../api'

type InventoryRow = {
  productId: number
  sku?: string
  name: string
  onlineStock: number
  warningThreshold: number
}

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const message = ref('')

const rows = ref<InventoryRow[]>([])
const activeInbound = ref<InventoryRow | null>(null)
const activeThreshold = ref<InventoryRow | null>(null)

const inboundForm = reactive({ quantity: 10, note: '' })
const thresholdForm = reactive({ warningThreshold: 5 })

const showAuthHint = computed(() => /401|403|unauthorized|forbidden|登录|过期/i.test(error.value))

function buildErrorMessage(errorLike: any, fallback: string) {
  const status = errorLike?.response?.status
  const apiMessage = errorLike?.response?.data?.message
  const genericMessage = errorLike?.message

  if (status === 401 || status === 403) {
    return '当前登录状态已失效，请重新登录库存管理员账号'
  }

  return apiMessage || genericMessage || fallback
}

async function reload() {
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    rows.value = (await fetchInventoryItems()) || []
  } catch (e: any) {
    error.value = buildErrorMessage(e, '加载失败')
  } finally {
    loading.value = false
  }
}

function openInbound(row: InventoryRow) {
  activeThreshold.value = null
  activeInbound.value = row
  inboundForm.quantity = 10
  inboundForm.note = ''
}

function closeInbound() {
  activeInbound.value = null
}

function openThreshold(row: InventoryRow) {
  activeInbound.value = null
  activeThreshold.value = row
  thresholdForm.warningThreshold = Number(row.warningThreshold ?? 5)
}

function closeThreshold() {
  activeThreshold.value = null
}

async function submitInbound() {
  if (!activeInbound.value) return
  submitting.value = true
  error.value = ''
  message.value = ''
  try {
    await inboundStock({
      productId: activeInbound.value.productId,
      quantity: Number(inboundForm.quantity),
      note: inboundForm.note || ''
    })
    message.value = '入库成功'
    await reload()
    closeInbound()
  } catch (e: any) {
    error.value = buildErrorMessage(e, '入库失败')
  } finally {
    submitting.value = false
  }
}

async function submitThreshold() {
  if (!activeThreshold.value) return
  submitting.value = true
  error.value = ''
  message.value = ''
  try {
    await updateWarningThreshold(activeThreshold.value.productId, Number(thresholdForm.warningThreshold))
    message.value = '预警阈值已更新'
    await reload()
    closeThreshold()
  } catch (e: any) {
    error.value = buildErrorMessage(e, '更新失败')
  } finally {
    submitting.value = false
  }
}

onMounted(reload)
</script>

<style scoped>
.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  color: #16351f;
}

.section-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
}

.count-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: #edf9ef;
  border: 1px solid #d8f0de;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
}

.table {
  display: grid;
  gap: 8px;
}

.thead,
.trow {
  display: grid;
  grid-template-columns: 1.5fr 0.6fr 0.7fr 0.8fr;
  gap: 10px;
  align-items: center;
}

.thead {
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
  padding: 0 10px;
}

.trow {
  border: 1px solid #e4efe6;
  background: #f8fcf8;
  border-radius: 12px;
  padding: 12px;
}

.right {
  text-align: right;
}

.actions {
  display: inline-flex;
  gap: 8px;
  justify-content: flex-end;
}

.title {
  font-weight: 800;
  color: #1f2937;
}

.sub {
  font-size: 12px;
  color: #6b7280;
}

.stock-value {
  color: #16351f;
}

.stock-value.low {
  color: #dc2626;
}

.empty {
  color: #6b7280;
  font-size: 13px;
}

.error-card {
  margin-top: 12px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #f3d4d4;
  background: #fff7f7;
}

.error-title {
  margin: 0 0 6px;
  color: #b91c1c;
  font-weight: 700;
}

.error-text,
.error-tip {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #7f1d1d;
}

.error-tip {
  margin-top: 6px;
}

.form-panel {
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  color: #4b5563;
}

.row-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .section-head,
  .thead,
  .trow {
    grid-template-columns: 1fr;
  }

  .right {
    text-align: left;
  }

  .actions {
    justify-content: flex-start;
  }
}
</style>
