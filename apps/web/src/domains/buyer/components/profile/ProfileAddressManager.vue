<template>
  <section class="page-lite content-card">
    <div class="content-head">
      <div>
        <h1>收货地址</h1>
        <p class="desc">支持多个地址，默认地址会在列表顶部展示。</p>
      </div>
      <div class="head-actions">
        <button type="button" class="secondary-btn" @click="loadAddresses" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新地址' }}
        </button>
      </div>
    </div>

    <div class="address-add">
      <label>新增地址</label>
      <textarea
        v-model="newAddressText"
        rows="3"
        placeholder="填写收货地址（可包含省市区、街道门牌等）"
      />
      <div class="address-add-actions">
        <label class="check">
          <input v-model="newAddressDefault" type="checkbox" />
          设为默认
        </label>
        <div class="btn-row">
          <button type="button" @click="addAddress" :disabled="adding || !newAddressText.trim()">
            {{ adding ? '新增中...' : '新增地址' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="addresses.length === 0" class="empty">
      暂无收货地址，先新增一个吧。
    </div>

    <div v-else class="address-list">
      <article v-for="addr in addresses" :key="addr.id" class="address-card">
        <div class="address-main">
          <div class="address-tags">
            <span v-if="addr.isDefault" class="tag">默认</span>
            <span class="sub">#{{ addr.id }}</span>
          </div>

          <div v-if="editingId !== addr.id" class="address-text">
            {{ addr.addressText }}
          </div>

          <div v-else class="address-edit">
            <textarea v-model="editAddressText" rows="3" />
            <label class="check">
              <input v-model="editAddressDefault" type="checkbox" />
              设为默认
            </label>
          </div>
        </div>

        <div class="address-actions">
          <template v-if="editingId !== addr.id">
            <button type="button" class="secondary-btn" @click="startEdit(addr)">编辑</button>
            <button
              type="button"
              class="danger-btn"
              @click="removeAddress(addr.id)"
              :disabled="deletingId === addr.id"
            >
              {{ deletingId === addr.id ? '删除中...' : '删除' }}
            </button>
          </template>
          <template v-else>
            <button type="button" @click="saveEdit(addr.id)" :disabled="savingEdit">
              {{ savingEdit ? '保存中...' : '保存' }}
            </button>
            <button type="button" class="secondary-btn" @click="cancelEdit">取消</button>
          </template>
        </div>
      </article>
    </div>

    <p v-if="tip" class="tip">{{ tip }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  createMyAddress,
  deleteMyAddress,
  fetchMyAddresses,
  updateMyAddress,
  type MyAddress
} from '../../api'

const addresses = ref<MyAddress[]>([])
const loading = ref(false)
const adding = ref(false)
const tip = ref('')

const newAddressText = ref('')
const newAddressDefault = ref(false)

const editingId = ref<number | null>(null)
const editAddressText = ref('')
const editAddressDefault = ref(false)
const savingEdit = ref(false)
const deletingId = ref<number | null>(null)

onMounted(loadAddresses)

async function loadAddresses() {
  if (loading.value) return
  loading.value = true
  tip.value = ''
  try {
    addresses.value = await fetchMyAddresses()
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 404) {
      tip.value = '后端未启动地址接口，请重启后端服务后再试'
    } else {
      tip.value = err?.response?.data?.message || '地址加载失败'
    }
  } finally {
    loading.value = false
  }
}

async function addAddress() {
  const text = newAddressText.value.trim()
  if (!text || adding.value) return
  adding.value = true
  tip.value = ''
  try {
    await createMyAddress({ addressText: text, isDefault: newAddressDefault.value })
    newAddressText.value = ''
    newAddressDefault.value = false
    await loadAddresses()
    tip.value = '已新增地址'
  } catch (err: any) {
    tip.value = err?.response?.data?.message || '新增失败'
  } finally {
    adding.value = false
  }
}

function startEdit(addr: MyAddress) {
  editingId.value = addr.id
  editAddressText.value = addr.addressText
  editAddressDefault.value = !!addr.isDefault
  tip.value = ''
}

function cancelEdit() {
  editingId.value = null
  editAddressText.value = ''
  editAddressDefault.value = false
}

async function saveEdit(id: number) {
  if (savingEdit.value) return
  const text = editAddressText.value.trim()
  if (!text) {
    tip.value = '地址内容不能为空'
    return
  }

  savingEdit.value = true
  tip.value = ''
  try {
    await updateMyAddress(id, { addressText: text, isDefault: editAddressDefault.value })
    await loadAddresses()
    cancelEdit()
    tip.value = '已保存'
  } catch (err: any) {
    tip.value = err?.response?.data?.message || '保存失败'
  } finally {
    savingEdit.value = false
  }
}

async function removeAddress(id: number) {
  if (deletingId.value) return
  deletingId.value = id
  tip.value = ''
  try {
    await deleteMyAddress(id)
    await loadAddresses()
    if (editingId.value === id) cancelEdit()
    tip.value = '已删除'
  } catch (err: any) {
    tip.value = err?.response?.data?.message || '删除失败'
  } finally {
    deletingId.value = null
  }
}

defineExpose({ loadAddresses, addresses })
</script>

<style scoped>
.content-card {
  display: grid;
  gap: 16px;
}
.content-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}
.head-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
.btn-row {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.empty {
  color: #6b7280;
  padding: 16px 0;
  text-align: center;
}
.tip {
  margin: 0;
  color: #1f7a41;
  font-weight: 700;
}
.address-add {
  display: grid;
  gap: 10px;
}
.address-add label {
  font-weight: 700;
  color: #374151;
}
.address-add-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #4b5563;
}
.address-list {
  display: grid;
  gap: 10px;
}
.address-card {
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e5efe7;
  background: #fff;
}
.address-main {
  display: grid;
  gap: 8px;
}
.address-tags {
  display: flex;
  gap: 8px;
  align-items: center;
}
.tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e8f6eb;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 800;
}
.sub {
  color: #9ca3af;
  font-size: 12px;
}
.address-text {
  color: #1f2937;
  line-height: 1.6;
  white-space: pre-wrap;
}
.address-edit {
  display: grid;
  gap: 8px;
}
.address-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}
.danger-btn {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}
</style>
