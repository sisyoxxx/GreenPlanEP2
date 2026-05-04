<template>
  <AppLayout>
    <div class="products-shell">
      <ProductFilterSidebar
        :selected-category="selectedCategory"
        :selected-month="selectedMonth"
        :selected-region="selectedRegion"
        :month-filters="monthFilters"
        :region-filters="regionFilters"
        @toggle-category="toggleCategory"
        @update:selected-month="selectedMonth = $event"
        @update:selected-region="selectedRegion = $event"
      />

      <section class="products-main">
        <ProductSwiper :slides="slides" />

        <div class="page-lite products-search-bar">
          <input v-model="keyword" type="text" placeholder="搜索商品名称、分类或描述" />
          <div class="search-toolbar">
            <span class="count-chip">共 {{ filteredProducts.length }} 件</span>
            <button class="secondary-btn" :disabled="loading" @click="reload">
              {{ loading ? '加载中...' : '刷新' }}
            </button>
          </div>
        </div>

        <ProductEmptyState
          :loading="loading"
          :error="error"
          :is-empty="filteredProducts.length === 0"
          :empty-state-text="emptyStateText"
        />

        <div v-if="!loading && !error && monthEmptyHint" class="page-lite month-tip">
          <h3>{{ monthTipTitle }}</h3>
          <p class="product-desc">{{ monthEmptyHint }}</p>
        </div>

        <div v-if="!loading && !error && filteredProducts.length > 0" class="products-card-grid">
          <ProductListCard
            v-for="item in filteredProducts"
            :key="item.id"
            :product="item"
            @buy="buyNow"
            @add-to-cart="addToCart"
            @go-detail="goDetail"
          />
        </div>

        <p v-if="message" class="home-message">{{ message }}</p>
      </section>
    </div>

    <FloatingBall icon="🛒" color="#80ab64" :popup-width="340" :popup-height="420" :badge-text="cartBadgeText">
      <CartPopup @checkout="goCheckout" />
    </FloatingBall>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import ProductSwiper from '../components/products/ProductSwiper.vue'
import ProductListCard from '../components/products/ProductListCard.vue'
import ProductFilterSidebar from '../components/products/ProductFilterSidebar.vue'
import ProductEmptyState from '../components/products/ProductEmptyState.vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import FloatingBall from '../../../shared/components/FloatingBall.vue'
import CartPopup from '../components/products/CartPopup.vue'
import { BUYER_CATEGORY_DEFINITIONS, findBuyerCategoryByLabel, normalizeBuyerCategory } from '../categoryConfig'
import { useBuyerCartStore } from '../stores/useBuyerCartStore'
import { createOrder, fetchProducts, fetchPromotions, type Product, type PromotionItem } from '../api'
import { formatPrice, hasDisplayImage } from '../../../utils/format'

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
      desc: item.description || '精选活动进行中',
      imageUrl: item.imageUrl
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

async function addToCart(item: Product) {
  if (!requireBuyerLogin('加入购物车')) return
  await cartStore.addItem(item, 1)
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

.products-main {
  display: grid;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.products-search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
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

.month-tip {
  display: grid;
  gap: 8px;
  border: 1px solid #d6eadb;
  background: linear-gradient(135deg, #f5fbf6, #ffffff);
}

.month-tip h3 {
  margin: 0;
}

.product-desc {
  margin: 0;
  color: #6b7280;
  line-height: 1.7;
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

.products-main::-webkit-scrollbar {
  width: 8px;
}

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

  .products-main {
    overflow: visible;
    padding-right: 0;
  }
}

@media (max-width: 760px) {
  .products-shell {
    grid-template-columns: 1fr;
  }

  .products-search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-toolbar {
    justify-content: space-between;
  }

  .products-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
