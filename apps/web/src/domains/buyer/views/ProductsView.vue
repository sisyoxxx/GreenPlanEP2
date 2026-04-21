<template>
  <AppLayout>
    <div class="products-shell">
      <aside class="products-sidebar page-lite">
        <section class="sidebar-section category-section">
          <div class="sidebar-title-row">
            <h2 class="sidebar-title">商品分类</h2>
            <span class="sidebar-tip">再次点击已选按钮可恢复全部</span>
          </div>
          <div class="filter-chip-group category-chip-group">
            <button
              v-for="item in BUYER_CATEGORY_DEFINITIONS"
              :key="item.label"
              type="button"
              class="filter-chip category-chip"
              :class="{ active: selectedCategory === item.label }"
              @click="toggleCategory(item.label)"
            >
              <span class="category-chip-icon">{{ item.icon }}</span>
              <span class="category-chip-label">{{ item.label }}</span>
            </button>
          </div>
        </section>

        <section class="sidebar-section">
          <h2 class="sidebar-title">播种时段</h2>
          <div class="filter-chip-group month-chip-group">
            <button
              v-for="item in monthFilters"
              :key="item"
              type="button"
              class="filter-chip month-chip"
              :class="{ active: selectedMonth === item }"
              @click="selectedMonth = item"
            >
              {{ item }}
            </button>
          </div>
        </section>

        <section class="sidebar-section">
          <h2 class="sidebar-title">适合地区</h2>
          <div class="filter-chip-group">
            <button
              v-for="item in regionFilters"
              :key="item"
              type="button"
              class="filter-chip"
              :class="{ active: selectedRegion === item }"
              @click="selectedRegion = item"
            >
              {{ item }}
            </button>
          </div>
        </section>
      </aside>

      <section class="products-main">
        <div class="page-lite products-swiper-wrap">
          <Swiper
            :modules="[Autoplay, Pagination, EffectCoverflow]"
            effect="coverflow"
            :slides-per-view="'auto'"
            :centered-slides="true"
            :loop="slides.length > 1"
            :autoplay="{ delay: 3200 }"
            :pagination="{ clickable: true }"
            :coverflow-effect="{
              rotate: 0,
              stretch: 0,
              depth: 150,
              scale: 0.92,
              modifier: 1,
              slideShadows: false
            }"
            class="products-swiper"
          >
            <SwiperSlide v-for="slide in slides" :key="slide.title" class="products-swiper-slide">
              <div class="products-banner">
                <div>
                  <p class="hero-tag">{{ slide.tag }}</p>
                  <h1>{{ slide.title }}</h1>
                  <p class="hero-subtitle">{{ slide.desc }}</p>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <div class="page-lite products-search-bar">
          <input v-model="keyword" type="text" placeholder="搜索商品名称、分类或描述" />
          <div class="search-toolbar">
            <span class="count-chip">共 {{ filteredProducts.length }} 件</span>
            <button class="secondary-btn" :disabled="loading" @click="reload">
              {{ loading ? '加载中...' : '刷新' }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="page-lite no-products">
          <h3>商品加载中...</h3>
        </div>

        <div v-else-if="error" class="page-lite no-products">
          <h3>商品加载失败</h3>
          <p class="product-desc">{{ error }}</p>
        </div>

        <template v-else>
          <div v-if="monthEmptyHint" class="page-lite month-tip">
            <h3>{{ monthTipTitle }}</h3>
            <p class="product-desc">{{ monthEmptyHint }}</p>
          </div>

          <div v-if="filteredProducts.length === 0" class="page-lite no-products">
            <h3>暂无匹配商品</h3>
            <p class="product-desc">{{ emptyStateText }}</p>
          </div>

          <div v-else class="products-card-grid">
            <article
              v-for="item in filteredProducts"
              :key="item.id"
              class="product-list-card page-lite"
              @click="goDetail(item.id)"
            >
              <div class="product-cover">
                <img
                  v-if="hasDisplayImage(item.imageUrl)"
                  class="product-image"
                  :src="item.imageUrl"
                  :alt="item.name"
                  loading="lazy"
                />
                <div v-else class="product-thumb">{{ productThumbText(item) }}</div>
              </div>
              <div class="product-list-content">
                <div class="product-list-top">
                  <div>
                    <span class="product-category-tag">{{ normalizeCategory(item.category) }}</span>
                    <h3 class="product-title-link">{{ item.name }}</h3>
                  </div>
                  <span class="product-list-price">¥{{ formatPrice(item.price) }}</span>
                </div>
                <p class="product-desc">{{ item.description }}</p>
                <div class="product-extra-meta">
                  <span>播种：{{ item.plantingMonth || '未设置' }}</span>
                  <span>地区：{{ normalizeRegion(item.suitableRegion) }}</span>
                  <span>库存：{{ item.onlineStock }}</span>
                </div>
                <div class="product-actions">
                  <button type="button" @click.stop="buyNow(item)">立即购买</button>
                  <button type="button" class="secondary-btn" @click.stop="addToCart(item)">加入购物车</button>
                </div>
              </div>
            </article>
          </div>
        </template>

        <p v-if="message" class="home-message">{{ message }}</p>
      </section>
    </div>

    <FloatingBall icon="🛒" color="#80ab64" :popup-width="340" :popup-height="420" :badge-text="cartBadgeText">
      <div class="cart-popup">
        <div class="cart-popup-header">
          <span>购物车</span>
          <span class="cart-popup-count">{{ cartStore.itemCount }} 件</span>
        </div>
        <div class="cart-popup-body">
          <div v-if="cartStore.isEmpty" class="cart-popup-empty">购物车还是空的，去挑选商品吧。</div>
          <div v-else class="cart-popup-list">
            <div v-for="item in cartStore.items" :key="item.id" class="cart-popup-item">
              <img
                v-if="hasDisplayImage(item.imageUrl)"
                class="cart-popup-thumb-image"
                :src="item.imageUrl"
                :alt="item.name"
                loading="lazy"
              />
              <div v-else class="cart-popup-thumb">{{ item.name.charAt(0) || '商品' }}</div>
              <div class="cart-popup-main">
                <div class="cart-popup-top">
                  <span class="cart-popup-name">{{ item.name }}</span>
                  <span class="cart-popup-price">¥{{ formatPrice(item.price * item.quantity) }}</span>
                </div>
                <div class="cart-popup-bottom">
                  <div class="cart-popup-stepper" @click.stop>
                    <button type="button" class="popup-step-btn" @click.stop="cartStore.decrease(item.id)">-</button>
                    <input
                      :value="item.quantity"
                      type="number"
                      min="1"
                      :max="Math.max(1, item.onlineStock)"
                      @input="updatePopupQuantity(item.id, $event)"
                    />
                    <button type="button" class="popup-step-btn" @click.stop="cartStore.increase(item.id)">+</button>
                  </div>
                  <button type="button" class="cart-popup-remove" @click.stop="cartStore.removeItem(item.id)">
                    移除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!cartStore.isEmpty" class="cart-popup-footer">
          <span class="cart-popup-total">合计：<strong>¥{{ formatPrice(cartStore.totalAmount) }}</strong></span>
          <button class="cart-popup-checkout" @click="goCheckout">查看购物车</button>
        </div>
      </div>
    </FloatingBall>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import AppLayout from '../../../layouts/AppLayout.vue'
import FloatingBall from '../../../shared/components/FloatingBall.vue'
import { BUYER_CATEGORY_DEFINITIONS, findBuyerCategoryByLabel, normalizeBuyerCategory } from '../categoryConfig'
import { useBuyerCartStore } from '../stores/useBuyerCartStore'
import { createOrder, fetchProducts, fetchPromotions, type Product, type PromotionItem } from '../api'

const DEFAULT_MONTH_OPTIONS = ['春播', '夏播', '秋播', '冬季', '全年']

const fallbackSlides = [
  {
    tag: '家庭园艺',
    title: '一站式挑选种子与工具',
    desc: '从蔬菜、花卉到草本植物，分类更清晰，查找更省心。'
  },
  {
    tag: '今日推荐',
    title: '按分类快速找到合适商品',
    desc: '点击左侧分类即可筛选，再次点击可恢复全部。'
  },
  {
    tag: '买家专区',
    title: '加入购物车后可统一结算',
    desc: '商品页、详情页与购物车共享同一份购物数据。'
  }
]

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const cartStore = useBuyerCartStore()

const cartBadgeText = computed(() => {
  const count = cartStore.itemCount
  if (!count) return null
  return count > 99 ? '...' : String(count)
})

const loading = ref(false)
const error = ref('')
const message = ref('')
const keyword = ref('')
const products = ref<Product[]>([])
const promotions = ref<PromotionItem[]>([])
const selectedCategory = ref<string | null>(null)
const selectedMonth = ref('全部')
const selectedRegion = ref('全部')

const slides = computed(() => {
  const backendSlides = promotions.value
    .filter((item) => item.strategyType === 'product')
    .map((item) => ({
      tag: '商品活动',
      title: item.title,
      desc: item.description || '精选活动进行中'
    }))
  return backendSlides.length > 0 ? backendSlides : fallbackSlides
})

const monthFilters = computed(() => {
  const monthSet = new Set(DEFAULT_MONTH_OPTIONS)
  products.value.forEach((item) => {
    if (item.plantingMonth) monthSet.add(item.plantingMonth)
  })
  return ['全部', ...Array.from(monthSet)]
})

const regionFilters = computed(() => {
  const seen = new Set<string>()
  const labels = products.value
    .map((item) => normalizeRegion(item.suitableRegion))
    .filter((label) => {
      if (label === '未设置') return false
      if (seen.has(label)) return false
      seen.add(label)
      return true
    })
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
  return ['全部', ...labels]
})

const filteredProducts = computed(() => {
  return products.value.filter((item) => {
    const categoryText = normalizeCategory(item.category)
    const monthText = item.plantingMonth || '未设置'
    const regionText = normalizeRegion(item.suitableRegion)
    const keywordValue = keyword.value.trim().toLowerCase()

    const matchKeyword =
      !keywordValue ||
      [item.name, categoryText, item.description, monthText, regionText].some((text) =>
        text.toLowerCase().includes(keywordValue)
      )
    const matchCategory = !selectedCategory.value || categoryText === selectedCategory.value
    const matchMonth = selectedMonth.value === '全部' || monthText === selectedMonth.value || monthText === '全年'
    const matchRegion = selectedRegion.value === '全部' || regionText === selectedRegion.value

    return matchKeyword && matchCategory && matchMonth && matchRegion
  })
})

const exactMonthProducts = computed(() => {
  if (selectedMonth.value === '全部') return filteredProducts.value
  return filteredProducts.value.filter((item) => (item.plantingMonth || '未设置') === selectedMonth.value)
})

const monthEmptyHint = computed(() => {
  if (selectedMonth.value === '全部' || exactMonthProducts.value.length > 0) return ''
  return `${selectedMonth.value} 当前没有对应商品，已为你保留其他筛选条件。`
})

const monthTipTitle = computed(() => {
  if (!monthEmptyHint.value) return ''
  return `${selectedMonth.value} 暂无商品`
})

const emptyStateText = computed(() => {
  if (selectedCategory.value) {
    return `当前“${selectedCategory.value}”下没有符合条件的商品，请切换其他分类试试。`
  }
  return '请尝试切换播种时段、地区或搜索关键词。'
})

onMounted(() => {
  syncCategoryFromRoute(route.query.category)
  reload()
})

watch(
  () => route.query.category,
  (value) => {
    syncCategoryFromRoute(value)
  }
)

watch(selectedCategory, (value) => {
  const currentQuery = typeof route.query.category === 'string' ? route.query.category : ''
  const nextQuery = value ?? ''
  if (currentQuery === nextQuery) return

  const query = { ...route.query }
  if (nextQuery) query.category = nextQuery
  else delete query.category
  router.replace({ query })
})

async function reload() {
  loading.value = true
  error.value = ''
  try {
    const [productList, promotionList] = await Promise.all([fetchProducts(), fetchPromotions()])
    products.value = productList
    promotions.value = promotionList
    productList.forEach((item) => cartStore.syncProduct(item))
  } catch (err: any) {
    error.value = err?.response?.data?.message || '商品数据加载失败'
  } finally {
    loading.value = false
  }
}

function syncCategoryFromRoute(value: unknown) {
  if (typeof value !== 'string' || !value) {
    selectedCategory.value = null
    return
  }
  selectedCategory.value = findBuyerCategoryByLabel(value)?.label ?? null
}

function toggleCategory(label: string) {
  selectedCategory.value = selectedCategory.value === label ? null : label
}

function normalizeCategory(category: string | null | undefined) {
  return normalizeBuyerCategory(category)
}

function normalizeRegion(region: string | null | undefined) {
  return region || '未设置'
}

function hasDisplayImage(url: string | null | undefined) {
  return Boolean(url && /^https?:\/\//i.test(url))
}

function productThumbText(item: Product) {
  if (hasDisplayImage(item.imageUrl)) return item.name
  return normalizeCategory(item.category)
}

function formatPrice(value: number) {
  return Number(value).toFixed(2)
}

function updatePopupQuantity(productId: number, event: Event) {
  const value = Number((event.target as HTMLInputElement | null)?.value ?? 1)
  cartStore.setQuantity(productId, value)
}

function goDetail(id: number) {
  router.push(`/products/${id}`)
}

function requireBuyerLogin(actionText: string) {
  if (!auth.isLoggedIn || auth.role !== 'BUYER') {
    message.value = `${actionText}前请先登录买家账号。`
    router.push('/login')
    return false
  }
  return true
}

function addToCart(item: Product) {
  if (!requireBuyerLogin('加入购物车')) return
  cartStore.addItem(item, 1)
  message.value = `${item.name} 已加入购物车。`
}

async function buyNow(item: Product) {
  if (!requireBuyerLogin('立即购买')) return
  const confirmed = window.confirm(`确认立即购买「${item.name}」吗？`)
  if (!confirmed) return

  try {
    const res = (await createOrder([{ productId: item.id, quantity: 1 }])) as { data: { id: number; orderNo: string } }
    message.value = `${item.name} 已下单，订单号：${res.data.orderNo}`
    await reload()
    router.push(`/orders?focus=${res.data.id}`)
  } catch (err: any) {
    message.value = err?.response?.data?.message || '下单失败'
  }
}

function goCheckout() {
  router.push('/cart')
}
</script>

<style scoped>
.products-shell {
  display: grid;
  grid-template-columns: 336px minmax(0, 1fr);
  gap: 18px;
  align-items: stretch;
  height: calc(100vh - 108px);
  overflow: hidden;
}

.products-sidebar {
  display: grid;
  gap: 18px;
  align-content: start;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.sidebar-section {
  display: grid;
  gap: 12px;
}

.sidebar-title-row {
  display: grid;
  gap: 4px;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  color: #1f7a41;
}

.sidebar-tip {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}

.filter-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-chip-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.month-chip-group {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.filter-chip {
  background: #f1f7f1;
  color: #386048;
  border: 1px solid #d7e8d9;
}

.month-chip {
  width: 100%;
  min-width: 0;
  justify-content: center;
}

.category-chip {
  min-height: 88px;
  border-radius: 12px;
  background: #f8fcf8;
  border: 1px solid #e4efe6;
  color: #1f2937;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
}

.category-chip-icon {
  font-size: 20px;
  line-height: 1;
}

.category-chip-label {
  font-size: 13px;
}

.filter-chip.active {
  background: #80ab64;
  color: #fff;
  border-color: #80ab64;
}

.products-main {
  display: grid;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.products-swiper-wrap {
  padding: 16px 20px 28px;
  overflow: hidden;
}

.products-swiper {
  width: 100%;
  overflow: hidden;
}

.products-swiper-slide {
  width: min(460px, 72%);
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.products-banner {
  min-height: 240px;
  display: flex;
  align-items: center;
  padding: 28px;
  background: linear-gradient(135deg, #ecf7ea, #f8fcf5);
  border-radius: 20px;
  box-shadow: 0 20px 38px rgba(31, 122, 65, 0.12);
}

.hero-tag {
  margin: 0 0 10px;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
}

.hero-subtitle {
  color: #4b5563;
  line-height: 1.7;
}

:deep(.products-swiper .swiper-slide) {
  opacity: 0.55;
}

:deep(.products-swiper .swiper-slide-active) {
  opacity: 1;
  z-index: 3;
}

:deep(.products-swiper .swiper-slide-prev),
:deep(.products-swiper .swiper-slide-next) {
  opacity: 0.78;
  z-index: 1;
}

.products-search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.products-search-bar input {
  flex: 1;
  width: 100%;
  font-size: 15px;
}

.search-toolbar {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.count-chip {
  font-size: 13px;
  font-weight: 700;
  color: #1f7a41;
  background: #edf9ef;
  border: 1px solid #d8f0de;
  padding: 6px 10px;
  border-radius: 999px;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.month-tip,
.no-products {
  display: grid;
  gap: 8px;
}

.month-tip {
  border: 1px solid #d6eadb;
  background: linear-gradient(135deg, #f5fbf6, #ffffff);
}

.month-tip h3,
.no-products h3 {
  margin: 0;
}

.product-list-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.product-list-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(31, 122, 65, 0.08);
}

.product-cover {
  width: 100%;
}

.product-thumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  color: #1f7a41;
  font-weight: 700;
  padding: 12px;
  text-align: center;
  font-size: 14px;
}

.product-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  object-fit: cover;
  display: block;
}

.product-list-content {
  display: grid;
  gap: 6px;
  width: 100%;
}

.product-list-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.product-category-tag {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}

.product-title-link {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
}

.product-list-price {
  margin: 0;
  color: #1f7a41;
  font-weight: 700;
  white-space: nowrap;
  font-size: 16px;
}

.product-desc {
  margin: 0;
  color: #6b7280;
  line-height: 1.65;
}

.product-extra-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #5f6d66;
}

.product-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.products-card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.home-message {
  margin: 0;
  color: #1f7a41;
  font-weight: 600;
}

.cart-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cart-popup-header {
  padding: 14px 16px;
  background: #80ab64;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.cart-popup-count {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.25);
  padding: 2px 10px;
  border-radius: 999px;
}

.cart-popup-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: #f8fafc;
}

.cart-popup-empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px 16px;
  font-size: 14px;
}

.cart-popup-list {
  display: grid;
  gap: 8px;
}

.cart-popup-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.cart-popup-thumb {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  color: #1f7a41;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cart-popup-thumb-image {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
  flex-shrink: 0;
}

.cart-popup-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.cart-popup-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: start;
}

.cart-popup-name {
  font-size: 13px;
  color: #1f2937;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-popup-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.cart-popup-price {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  white-space: nowrap;
}

.cart-popup-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid #dfe8e1;
  border-radius: 999px;
  overflow: hidden;
  background: #fff;
}

.cart-popup-stepper input {
  width: 54px;
  border: none;
  text-align: center;
  background: transparent;
  font-size: 12px;
  padding: 0;
  appearance: textfield;
  -moz-appearance: textfield;
}

.cart-popup-stepper input::-webkit-outer-spin-button,
.cart-popup-stepper input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.popup-step-btn {
  border: none;
  background: #f4f8f4;
  color: #1f7a41;
  width: 32px;
  height: 32px;
  font-size: 16px;
  cursor: pointer;
}

.popup-step-btn:hover {
  background: #eaf3ec;
}

.cart-popup-remove {
  border: none;
  background: transparent;
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.cart-popup-remove:hover {
  color: #b91c1c;
}

.cart-popup-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  background: #fff;
}

.cart-popup-total {
  font-size: 14px;
  color: #6b7280;
}

.cart-popup-total strong {
  color: #1f2937;
  font-size: 16px;
}

.cart-popup-checkout {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: #1f7a41;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.cart-popup-checkout:hover {
  background: #276749;
}

.products-sidebar::-webkit-scrollbar,
.products-main::-webkit-scrollbar {
  width: 8px;
}

.products-sidebar::-webkit-scrollbar-thumb,
.products-main::-webkit-scrollbar-thumb {
  background: #d2e3d6;
  border-radius: 999px;
}

@media (max-width: 1500px) {
  .products-shell {
    grid-template-columns: 312px minmax(0, 1fr);
    gap: 16px;
  }
}

@media (max-width: 1280px) {
  .products-shell {
    grid-template-columns: 288px minmax(0, 1fr);
    gap: 14px;
  }

  .products-swiper-slide {
    width: min(420px, 78%);
  }

  .products-card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .products-shell {
    grid-template-columns: 260px minmax(0, 1fr);
    gap: 12px;
  }

  .products-card-grid {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
}

@media (max-width: 980px) {
  .products-shell {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }

  .products-sidebar,
  .products-main {
    overflow: visible;
    padding-right: 0;
  }
}

@media (max-width: 760px) {
  .products-shell {
    grid-template-columns: 1fr;
  }

  .products-swiper-slide {
    width: 88%;
  }

  .products-search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-toolbar {
    justify-content: space-between;
  }

  .products-card-grid,
  .category-chip-group {
    grid-template-columns: 1fr;
  }
}
</style>
