<template>
  <AppLayout>
    <div class="cart-page" :class="{ 'has-multi-bar': multiMode }">
      <section class="cart-main page-lite">
        <div class="cart-header">
          <div>
            <h1>购物车</h1>
            <p class="desc">支持按关键词筛选、批量勾选付款或删除，底部会汇总当前已加入的商品。</p>
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
          <article v-for="item in filteredItems" :key="item.id" class="cart-item-card" :class="{ multi: multiMode }">
            <label v-if="multiMode" class="select-box">
              <input :checked="selectedIds.has(item.id)" type="checkbox" @change="toggleSelected(item.id)" />
            </label>

            <div class="cart-item-cover" @click="goDetail(item.id)">
              <img v-if="hasDisplayImage(item.imageUrl)" :src="item.imageUrl" :alt="item.name" loading="lazy" />
              <span v-else>{{ item.name }}</span>
            </div>

            <div class="cart-item-info">
              <div class="cart-item-top">
                <div>
                  <span class="cart-item-tag">{{ normalizeCategory(item.category) }}</span>
                  <h3 class="cart-item-title" @click="goDetail(item.id)">{{ item.name }}</h3>
                </div>
                <strong class="cart-item-price">￥{{ formatPrice(item.price) }}</strong>
              </div>

              <p class="cart-item-desc">{{ item.description }}</p>

              <div class="cart-item-meta">
                <span>播种：{{ item.plantingMonth || '未设置' }}</span>
                <span>地区：{{ item.suitableRegion || '未设置' }}</span>
                <span>库存：{{ item.onlineStock }}</span>
              </div>

              <div class="cart-item-actions">
                <div class="qty-stepper">
                  <button type="button" class="step-btn" @click="cartStore.decrease(item.id)">-</button>
                  <input
                    :value="item.quantity"
                    type="number"
                    min="1"
                    :max="Math.max(1, item.onlineStock)"
                    @input="updateQuantity(item.id, $event)"
                  />
                  <button type="button" class="step-btn" @click="cartStore.increase(item.id)">+</button>
                </div>

                <div class="cart-item-side-actions">
                  <span class="line-total">小计：￥{{ formatPrice(item.price * item.quantity) }}</span>
                  <button type="button" class="text-btn" @click="cartStore.removeItem(item.id)">移除</button>
                </div>
              </div>
            </div>
          </article>
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

      <div v-if="multiMode" class="multi-bar">
        <div class="multi-bar-left">
          <strong>已选 {{ selectedItems.length }} 种 · {{ selectedCount }} 件</strong>
          <span>合计：￥{{ formatPrice(selectedAmount) }}</span>
        </div>
        <div class="multi-bar-actions">
          <button class="danger-btn" @click="removeSelected" :disabled="selectedIds.size === 0">删除</button>
          <button @click="submitSelectedOrder" :disabled="submitting || selectedIds.size === 0">
            {{ submitting ? '下单中...' : '购买' }}
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import { normalizeBuyerCategory } from '../categoryConfig'
import { useBuyerCartStore } from '../stores/useBuyerCartStore'
import { createOrder } from '../api'

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

function updateQuantity(productId: number, event: Event) {
  const target = event.target as HTMLInputElement
  cartStore.setQuantity(productId, Number(target.value) || 1)
}

function normalizeCategory(category: string | null | undefined) {
  return normalizeBuyerCategory(category)
}

function hasDisplayImage(url: string | null | undefined) {
  if (!url) return false
  return /^https?:\/\//i.test(url)
}

function formatPrice(value: number) {
  return Number(value).toFixed(2)
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

.cart-item-card {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 16px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid #e5efe7;
  background: #fbfefb;
}

.cart-item-card.multi {
  grid-template-columns: 24px 180px minmax(0, 1fr);
}

.select-box {
  display: flex;
  align-items: start;
  justify-content: center;
  padding-top: 6px;
}

.cart-item-cover {
  min-height: 180px;
  border-radius: 14px;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1f7a41;
  font-weight: 700;
  text-align: center;
  padding: 16px;
  cursor: pointer;
}

.cart-item-cover img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

.cart-item-cover span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.cart-item-info {
  display: grid;
  gap: 10px;
}

.cart-item-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.cart-item-tag {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}

.cart-item-title {
  cursor: pointer;
  color: #1f2937;
}

.cart-item-price {
  color: #1f7a41;
  font-size: 20px;
}

.cart-item-desc {
  margin: 0;
  color: #6b7280;
  line-height: 1.7;
}

.cart-item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #5f6d66;
  font-size: 12px;
}

.cart-item-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.qty-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid #dfe8e1;
  border-radius: 999px;
  overflow: hidden;
  background: #fff;
}

.qty-stepper input {
  width: 64px;
  border: none;
  text-align: center;
  background: transparent;
  appearance: textfield;
  -moz-appearance: textfield;
}

.qty-stepper input::-webkit-outer-spin-button,
.qty-stepper input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.step-btn {
  border: none;
  background: #f4f8f4;
  color: #1f7a41;
  width: 36px;
  height: 36px;
  font-size: 18px;
}

.cart-item-side-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.line-total {
  color: #1f2937;
  font-weight: 700;
}

.text-btn {
  border: none;
  background: transparent;
  color: #dc2626;
  padding: 0;
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

.multi-bar {
  position: fixed;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  width: min(980px, calc(100% - 24px));
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(31, 122, 65, 0.22);
  box-shadow: 0 18px 40px rgba(31, 122, 65, 0.14);
  backdrop-filter: blur(10px);
  z-index: 30;
}

.multi-bar-left {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.multi-bar-left strong {
  color: #16351f;
}

.multi-bar-left span {
  color: #1f7a41;
  font-weight: 800;
}

.multi-bar-actions {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
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
  .cart-item-top,
  .bottom-head {
    flex-direction: column;
    align-items: stretch;
  }

  .cart-item-card {
    grid-template-columns: 1fr;
  }

  .cart-item-card.multi {
    grid-template-columns: 1fr;
  }

  .select-box {
    justify-content: flex-start;
    padding-top: 0;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }
}
</style>
