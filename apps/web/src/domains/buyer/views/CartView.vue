<template>
  <AppLayout>
    <div class="cart-page" :class="{ 'has-multi-bar': multiMode }">
      <section class="cart-main page-lite">
        <div class="cart-header">
          <div>
            <h1>购物车</h1>
          </div>
          <div class="cart-header-actions">
            <button v-if="!cartStore.isEmpty" class="secondary-btn" @click="toggleMultiMode">
              {{ multiMode ? '退出多选' : '多选' }}
            </button>
            <button v-if="!cartStore.isEmpty" class="secondary-btn" @click="cartStore.clear()">清空购物车</button>
          </div>
        </div>

        <div class="cart-toolbar page-lite">
          <input v-model="keyword" type="text" placeholder="筛选商品名称、分类或描述" />
          <div v-if="multiMode" class="toolbar-actions">
            <button class="secondary-btn" @click="toggleSelectAll" :disabled="filteredItems.length === 0">
              {{ isAllFilteredSelected ? '取消全选' : '全选当前筛选结果' }}
            </button>
            <button class="danger-btn" @click="removeSelected" :disabled="selectedIds.size === 0">批量删除</button>
          </div>
        </div>

        <div v-if="cartStore.isEmpty" class="empty-state">
          <h3>购物车还是空的</h3>
          <p>去商品页挑选喜欢的种子和工具吧。</p>
          <button @click="goProducts">前往商品页</button>
        </div>

        <div v-else-if="filteredItems.length === 0" class="empty-state">
          <h3>没有匹配商品</h3>
          <p>当前筛选条件下没有结果，试试更换关键词。</p>
        </div>

        <div v-else class="cart-list">
          <CartItemRow
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
            :selected="selectedIds.has(item.id)"
            :is-multi-mode="multiMode"
            @toggle-select="toggleSelected"
            @decrease="cartStore.decrease"
            @increase="cartStore.increase"
            @update-quantity="cartStore.setQuantity"
            @remove="cartStore.removeItem"
            @go-detail="goDetail"
          />
        </div>

        <section class="cart-bottom page-lite">
          <div class="bottom-head">
            <h2>已加入商品列表</h2>
            <span>{{ cartStore.uniqueCount }} 种商品 · {{ cartStore.itemCount }} 件</span>
          </div>

          <div v-if="cartStore.isEmpty" class="bottom-empty">当前还没有已加购商品。</div>
          <div v-else class="bottom-grid">
            <div v-for="item in cartStore.items" :key="item.id" class="bottom-item">
              <span class="bottom-item-name">{{ item.name }}</span>
              <span class="bottom-item-meta">{{ item.quantity }} 件 · ￥{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
        </section>
      </section>

      <aside class="cart-summary page-lite">
        <h2>结算摘要</h2>

        <div class="summary-line">
          <span>商品种类</span>
          <strong>{{ cartStore.uniqueCount }}</strong>
        </div>

        <div class="summary-line">
          <span>商品件数</span>
          <strong>{{ cartStore.itemCount }}</strong>
        </div>

        <div class="summary-line total">
          <span>全车合计</span>
          <strong>￥{{ formatPrice(cartStore.totalAmount) }}</strong>
        </div>

        <button @click="submitAllOrder" :disabled="submitting || cartStore.isEmpty">
          {{ submitting ? '下单中...' : '全部付款' }}
        </button>
        <button class="secondary-btn" @click="goProducts">继续选购</button>

        <p v-if="message" class="cart-message">{{ message }}</p>
      </aside>

      <CartCheckoutBar
        :selected-count="selectedCount"
        :selected-total="selectedAmount"
        :is-multi-mode="multiMode"
        :selected-kind-count="selectedItems.length"
        :submitting="submitting"
        :has-selection="selectedIds.size > 0"
        @checkout="submitSelectedOrder"
        @remove-selected="removeSelected"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import CartItemRow from '../components/cart/CartItemRow.vue'
import CartCheckoutBar from '../components/cart/CartCheckoutBar.vue'
import { normalizeBuyerCategory } from '../categoryConfig'
import { useBuyerCartStore } from '../stores/useBuyerCartStore'
import { createOrder } from '../api'
import { formatPrice } from '../../../utils/format'

const router = useRouter()
const cartStore = useBuyerCartStore()

const submitting = ref(false)
const message = ref('')
const keyword = ref('')
const selectedIds = ref<Set<number>>(new Set())
const multiMode = ref(false)

const filteredItems = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  if (!value) return cartStore.items
  return cartStore.items.filter((item) =>
    [item.name, normalizeCategory(item.category), item.description]
      .some((text) => text.toLowerCase().includes(value))
  )
})

const selectedItems = computed(() => cartStore.items.filter((item) => selectedIds.value.has(item.id)))
const selectedCount = computed(() => selectedItems.value.reduce((sum, item) => sum + item.quantity, 0))
const selectedAmount = computed(() => selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
const isAllFilteredSelected = computed(() => filteredItems.value.length > 0 && filteredItems.value.every((item) => selectedIds.value.has(item.id)))

watch(
  () => cartStore.items.map((item) => item.id),
  (ids) => {
    const next = new Set<number>()
    ids.forEach((id) => {
      if (selectedIds.value.has(id)) next.add(id)
    })
    selectedIds.value = next
  },
  { immediate: true }
)

watch(multiMode, (enabled) => {
  if (!enabled) selectedIds.value = new Set()
})

function toggleMultiMode() {
  multiMode.value = !multiMode.value
}

function toggleSelected(id: number) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function toggleSelectAll() {
  const next = new Set(selectedIds.value)
  if (isAllFilteredSelected.value) {
    filteredItems.value.forEach((item) => next.delete(item.id))
  } else {
    filteredItems.value.forEach((item) => next.add(item.id))
  }
  selectedIds.value = next
}

async function submitAllOrder() {
  await submitOrder(cartStore.buildOrderPayload(), cartStore.items.map((item) => item.id))
}

async function submitSelectedOrder() {
  await submitOrder(
    selectedItems.value.map((item) => ({ productId: item.id, quantity: item.quantity })),
    selectedItems.value.map((item) => item.id)
  )
}

async function submitOrder(payload: Array<{ productId: number; quantity: number }>, removeIds: number[]) {
  if (payload.length === 0 || submitting.value) return

  submitting.value = true
  message.value = ''

  try {
    const res = await createOrder(payload) as { data: { id: number; orderNo: string } }
    removeIds.forEach((id) => cartStore.removeItem(id))
    selectedIds.value = new Set()
    message.value = `订单提交成功，订单号 ${res.data.orderNo}`
    router.push(`/orders?focus=${res.data.id}`)
  } catch (err: any) {
    message.value = err?.response?.data?.message || '下单失败'
  } finally {
    submitting.value = false
  }
}

function removeSelected() {
  if (selectedIds.value.size === 0) return
  Array.from(selectedIds.value).forEach((id) => cartStore.removeItem(id))
  selectedIds.value = new Set()
  message.value = '已删除选中的商品。'
}

function normalizeCategory(category: string | null | undefined) {
  return normalizeBuyerCategory(category)
}

function goProducts() {
  router.push('/products')
}

function goDetail(id: number) {
  router.push(`/products/${id}`)
}
</script>

<style scoped>
.cart-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  align-items: start;
}

.cart-page.has-multi-bar {
  padding-bottom: 96px;
}

.cart-main,
.cart-summary {
  display: grid;
  gap: 16px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.cart-header-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

h1,
h2,
h3 {
  margin: 0;
}

.desc {
  margin: 6px 0 0;
  color: #6b7280;
  line-height: 1.7;
}

.cart-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.cart-toolbar input {
  flex: 1;
  min-width: 240px;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.empty-state {
  display: grid;
  gap: 10px;
  padding: 18px 0 6px;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
}

.cart-list {
  display: grid;
  gap: 14px;
}

.cart-bottom {
  display: grid;
  gap: 12px;
}

.bottom-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.bottom-head span {
  color: #6b7280;
  font-size: 13px;
}

.bottom-empty {
  color: #9ca3af;
}

.bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.bottom-item {
  display: grid;
  gap: 4px;
  padding: 12px;
  border-radius: 12px;
  background: #f8fcf8;
  border: 1px solid #e4efe6;
}

.bottom-item-name {
  color: #1f2937;
  font-weight: 600;
}

.bottom-item-meta {
  color: #6b7280;
  font-size: 12px;
}

.cart-summary {
  position: sticky;
  top: 16px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #4b5563;
}

.summary-line.total {
  padding-top: 12px;
  border-top: 1px solid #e7eee8;
  color: #1f2937;
}

.summary-line.total strong {
  color: #1f7a41;
  font-size: 22px;
}

.cart-message {
  margin: 0;
  color: #1f7a41;
  font-weight: 600;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.danger-btn {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #be123c;
}

@media (max-width: 1100px) {
  .cart-page {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 760px) {
  .cart-toolbar,
  .cart-header,
  .bottom-head {
    flex-direction: column;
    align-items: stretch;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }
}
</style>
