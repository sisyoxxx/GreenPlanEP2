<template>
  <AppLayout>
    <div class="products-shell">
      <aside class="products-sidebar page-lite">
        <section class="sidebar-section category-section">
          <h2 class="sidebar-title">商品分类</h2>
          <div class="filter-chip-group category-chip-group">
            <button
              v-for="item in categoryFilters"
              :key="item.label"
              class="filter-chip category-chip"
              :class="{ active: selectedCategory === item.label }"
              @click="selectedCategory = item.label"
            >
              <span class="category-chip-icon">{{ item.icon }}</span>
              <span class="category-chip-label">{{ item.label }}</span>
            </button>
          </div>
        </section>

        <section class="sidebar-section">
          <h2 class="sidebar-title">月份分类</h2>
          <div class="filter-chip-group">
            <button v-for="item in monthFilters" :key="item" class="filter-chip" :class="{ active: selectedMonth === item }" @click="selectedMonth = item">
              {{ item }}
            </button>
          </div>
        </section>

        <section class="sidebar-section">
          <h2 class="sidebar-title">地区分类</h2>
          <div class="filter-chip-group">
            <button v-for="item in regionFilters" :key="item" class="filter-chip" :class="{ active: selectedRegion === item }" @click="selectedRegion = item">
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
            :loop="true"
            :autoplay="{ delay: 3200 }"
            :pagination="{ clickable: true }"
            :coverflow-effect="{
              rotate: 0,
              stretch: 0,
              depth: 150,
              scale: 0.9,
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
          <input v-model="keyword" type="text" placeholder="搜索商品名称、分类、简介" />
        </div>

        <div v-if="filteredProducts.length === 0" class="page-lite no-products">
          <h3>暂无匹配商品</h3>
          <p class="product-desc">请尝试切换筛选条件，或先在数据库中补充带月份和地区字段的商品数据。</p>
        </div>

        <div v-else class="products-card-grid">
          <article class="product-list-card page-lite" v-for="item in filteredProducts" :key="item.id">
            <div class="product-cover clickable" @click="goDetail(item.id)">
              <div class="product-thumb">{{ item.imageUrl || (categoryLabelMap[item.category] ?? item.category) }}</div>
            </div>
            <div class="product-list-content">
              <div class="product-list-top">
                <h3 class="clickable product-title-link" @click="goDetail(item.id)">{{ item.name }}</h3>
                <span class="product-list-price">¥{{ item.price }}</span>
              </div>
              <p class="product-desc">{{ item.description }}</p>
              <div class="product-extra-meta">
                <span>月份：{{ item.plantingMonth || '未设置' }}</span>
                <span>地区：{{ item.suitableRegion || '未设置' }}</span>
                <span>库存：{{ item.onlineStock }}</span>
              </div>
              <div class="product-actions">
                <button @click="addToCart(item)">加入购物车</button>
              </div>
            </div>
          </article>
        </div>

        <p v-if="message" class="home-message">{{ message }}</p>
      </section>
    </div>

    <!-- 购物车悬浮球 -->
    <FloatingBall icon="🛒" color="#80ab64" :popup-width="340" :popup-height="420">
      <div class="cart-popup">
        <div class="cart-popup-header">
          <span>购物车</span>
          <span class="cart-popup-count">{{ cart.length }} 件</span>
        </div>
        <div class="cart-popup-body">
          <div v-if="cart.length === 0" class="cart-popup-empty">购物车是空的，去挑选商品吧</div>
          <div v-else class="cart-popup-list">
            <div class="cart-popup-item" v-for="item in cart" :key="item.id">
              <div class="cart-popup-thumb">{{ item.name?.charAt(0) || '商' }}</div>
              <div class="cart-popup-info">
                <span class="cart-popup-name">{{ item.name }}</span>
                <span class="cart-popup-qty">x{{ item.quantity }}</span>
              </div>
              <span class="cart-popup-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div v-if="cart.length > 0" class="cart-popup-footer">
          <span class="cart-popup-total">合计：<strong>¥{{ cartTotal }}</strong></span>
          <button class="cart-popup-checkout" @click="goCheckout">去结算</button>
        </div>
      </div>
    </FloatingBall>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import FloatingBall from '../../../shared/components/FloatingBall.vue'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import { fetchProducts, type Product } from '../api'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'

const router = useRouter()
const auth = useAuthStore()
const products = ref<Product[]>([])
const keyword = ref('')
const message = ref('')
const selectedCategory = ref('全部')
const selectedMonth = ref('全部')
const selectedRegion = ref('全部')
const cart = ref<Array<Product & { quantity: number }>>([])

const categoryFilters = [
  { label: '全部', icon: '🛍️' },
  { label: '蔬菜种子', icon: '🌱' },
  { label: '花卉种子', icon: '🌸' },
  { label: '香草种子', icon: '🌿' },
  { label: '营养肥料', icon: '🍀' },
  { label: '园艺工具', icon: '🧰' }
]
const monthFilters = ['全部', '春播', '夏播', '秋播', '冬季']
const regionFilters = ['全部', '华东', '华南', '华北', '华中', '西南', '西北', '东北']

const slides = [
  { tag: '春播推荐', title: '新手阳台蔬菜专区', desc: '从番茄、生菜到香草，适合家庭园艺快速入门。' },
  { tag: '花园灵感', title: '打造清新田园花境', desc: '花卉、香草与观叶植物组合，提升庭院与阳台氛围。' },
  { tag: '家庭种植', title: '一站式选购种子与工具', desc: '种子、喷壶、营养肥料搭配选购更方便。' },
  { tag: '限时特惠', title: '有机肥料满减专场', desc: '精选有机营养土与复合肥，满 99 减 20，囤货好时机。' },
  { tag: '夏日清凉', title: '香草植物消暑指南', desc: '薄荷、罗勒、柠檬草，阳台种一盆清凉一夏。' }
]

const categoryLabelMap: Record<string, string> = {
  VEGETABLE: '蔬菜种子',
  FLOWER: '花卉种子',
  HERB: '香草种子',
  FRUIT: '营养肥料',
  TOOL: '园艺工具'
}

onMounted(async () => {
  products.value = await fetchProducts()
})

function goDetail(id: number) {
  router.push(`/products/${id}`)
}

function requireBuyerLogin(actionText: string): boolean {
  if (!auth.isLoggedIn || auth.role !== 'BUYER') {
    message.value = `${actionText}前请先登录买家账号`
    router.push('/login')
    return false
  }
  return true
}

function addToCart(item: Product) {
  if (!requireBuyerLogin('加入购物车')) return
  const existed = cart.value.find((c) => c.id === item.id)
  if (existed) existed.quantity += 1
  else cart.value.push({ ...item, quantity: 1 })
  message.value = `${item.name} 已加入购物车`
}

const filteredProducts = computed(() => {
  return products.value.filter((item) => {
    const categoryText = categoryLabelMap[item.category] ?? item.category
    const monthText = item.plantingMonth || '未设置'
    const regionText = item.suitableRegion || '未设置'
    const matchKeyword = !keyword.value || [item.name, categoryText, item.description, monthText, regionText].some((text) => text.toLowerCase().includes(keyword.value.toLowerCase()))
    const matchCategory = selectedCategory.value === '全部' || categoryText === selectedCategory.value
    const matchMonth = selectedMonth.value === '全部' || monthText === selectedMonth.value
    const matchRegion = selectedRegion.value === '全部' || regionText === selectedRegion.value
    return matchKeyword && matchCategory && matchMonth && matchRegion
  })
})

const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2))

function goCheckout() { router.push('/cart') }
</script>

<style scoped>
.products-shell {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.products-sidebar {
  display: grid;
  gap: 18px;
}

.sidebar-section {
  display: grid;
  gap: 12px;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  color: #1f7a41;
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

.filter-chip {
  background: #f1f7f1;
  color: #386048;
  border: 1px solid #d7e8d9;
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

.products-search-bar input {
  width: 100%;
  font-size: 15px;
}

.no-products {
  display: grid;
  gap: 8px;
}

.no-products h3 {
  margin: 0;
}

.clickable {
  cursor: pointer;
}

.product-title-link {
  color: #1f2937;
}

.product-title-link:hover {
  color: #1f7a41;
}

.product-list-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
  padding: 10px;
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
  padding: 8px;
  text-align: center;
  font-size: 14px;
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

.product-list-content h3 {
  margin: 0;
  font-size: 14px;
}

.product-list-price {
  margin: 0;
  color: #1f7a41;
  font-weight: 700;
  white-space: nowrap;
  font-size: 14px;
}

.product-extra-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #5f6d66;
}

.products-card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 1500px) {
  .products-shell {
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 16px;
  }

  .products-card-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1280px) {
  .products-shell {
    grid-template-columns: 220px minmax(0, 1fr);
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
    grid-template-columns: 1fr;
  }

  .products-card-grid {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
}

@media (max-width: 760px) {
  .products-shell {
    grid-template-columns: 1fr;
  }

  .products-swiper-slide {
    width: 88%;
  }

  .products-card-grid,
  .category-chip-group {
    grid-template-columns: 1fr;
  }
}

.cart-popup { display: flex; flex-direction: column; height: 100%; }

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
  background: rgba(255,255,255,0.25);
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

.cart-popup-list { display: grid; gap: 8px; }

.cart-popup-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
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

.cart-popup-info { flex: 1; display: flex; justify-content: space-between; }
.cart-popup-name { font-size: 13px; color: #1f2937; }
.cart-popup-qty { font-size: 12px; color: #9ca3af; }
.cart-popup-price { font-weight: 600; font-size: 14px; color: #1f2937; white-space: nowrap; }

.cart-popup-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  background: #fff;
}

.cart-popup-total { font-size: 14px; color: #6b7280; }
.cart-popup-total strong { color: #1f2937; font-size: 16px; }

.cart-popup-checkout {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: #1f7a41;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.cart-popup-checkout:hover { background: #276749; }
</style>
