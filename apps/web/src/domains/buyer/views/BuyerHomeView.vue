<template>
  <AppLayout>
    <div class="home-shell">
      <HomeCategorySidebar />

      <section class="home-center">
        <div class="hero-banner page-lite">
          <div class="hero-content">
            <p class="hero-tag">{{ heroTag }}</p>
            <h1>{{ heroTitle }}</h1>
            <p class="hero-subtitle">{{ heroSubtitle }}</p>
            <div class="hero-actions">
              <button @click="goProducts">立即选购</button>
              <button class="secondary-btn" @click="goCommunity">逛逛社区</button>
            </div>
          </div>
          <div class="hero-highlight">
            <div v-if="hasHomePromotions" class="promo-carousel">
              <div class="promo-slides">
                <div
                  v-for="(promo, idx) in homePromotions"
                  :key="promo.id"
                  class="promo-slide"
                  :class="{ active: idx === currentPromoIndex }"
                >
                  <div class="highlight-card" :class="{ 'has-image': hasDisplayImage(promo.imageUrl) }">
                    <img
                      v-if="hasDisplayImage(promo.imageUrl)"
                      class="promo-image"
                      :src="promo.imageUrl || ''"
                      :alt="promo.title"
                      loading="lazy"
                    />
                    <div class="highlight-overlay">
                      <div class="highlight-label">首页促销位 {{ idx + 1 }} / {{ homePromotions.length }}</div>
                      <div class="highlight-title">{{ promo.title }}</div>
                      <div class="highlight-desc">{{ promo.description }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                v-if="homePromotions.length > 1"
                class="carousel-arrow carousel-prev"
                type="button"
                aria-label="上一个"
                @click="prevPromotion"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button
                v-if="homePromotions.length > 1"
                class="carousel-arrow carousel-next"
                type="button"
                aria-label="下一个"
                @click="nextPromotion"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M9 18l6-6-6-6"/></svg>
              </button>

              <div v-if="homePromotions.length > 1" class="carousel-dots">
                <button
                  v-for="(_, idx) in homePromotions"
                  :key="idx"
                  type="button"
                  class="carousel-dot"
                  :class="{ active: idx === currentPromoIndex }"
                  :aria-label="`切换到第 ${idx + 1} 个促销`"
                  @click="goToPromotion(idx)"
                />
              </div>
            </div>

            <div v-else class="highlight-card" :class="{ 'has-image': topProducts.length > 0 && hasDisplayImage(topProducts[0]?.imageUrl) }">
              <img
                v-if="topProducts.length > 0 && hasDisplayImage(topProducts[0]?.imageUrl)"
                class="promo-image"
                :src="topProducts[0].imageUrl || ''"
                :alt="topProducts[0].name"
                loading="lazy"
              />
              <div class="highlight-overlay">
                <div class="highlight-label">{{ topProducts.length > 0 ? '本周热销' : '本周精选教程' }}</div>
                <div class="highlight-title">{{ topProducts.length > 0 ? (topProducts[0]?.name || '家庭种植推荐') : (topTutorials[0]?.title || '阳台种植入门教程') }}</div>
                <div class="highlight-desc">{{ topProducts.length > 0 ? (topProducts[0]?.description || '从分类筛选到购物车下单，流程更顺手。') : (topTutorials[0]?.description || '先看教程再上手，适合新手快速入门。') }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section-head">
          <h2>{{ topProducts.length > 0 ? '精选商品' : '教程卡片' }}</h2>
          <button class="secondary-btn" @click="topProducts.length > 0 ? goProducts() : goTutorials()">
            {{ topProducts.length > 0 ? '查看全部商品' : '查看全部教程' }}
          </button>
        </div>

        <div v-if="topProducts.length > 0" class="featured-grid">
          <article
            v-for="item in topProducts"
            :key="item.id"
            class="featured-product page-lite"
            @click="goProductDetail(item.id)"
          >
            <img v-if="hasDisplayImage(item.imageUrl)" class="product-image product-cover-media" :src="item.imageUrl" :alt="item.name" loading="lazy" />
            <div v-else class="product-thumb product-cover-media">{{ normalizeBuyerCategory(item.category) }}</div>
            <h3 class="product-title">{{ item.name }}</h3>
            <p class="product-desc">{{ item.description }}</p>
            <div class="product-meta">
              <span>￥{{ formatPrice(item.price) }}</span>
              <span>销量 {{ item.sales ?? 0 }}</span>
            </div>
            <div class="product-actions">
              <button @click.stop="addToCart(item)">加入购物车</button>
              <button class="secondary-btn" @click.stop="goProductDetail(item.id)">查看详情</button>
            </div>
          </article>
        </div>

        <div v-else class="featured-grid">
          <article v-for="item in topTutorials" :key="item.id" class="featured-product page-lite tutorial-card">
            <div class="product-thumb" :style="{ background: item.backgroundStyle }">{{ item.tag }}</div>
            <h3 class="product-title">{{ item.title }}</h3>
            <p class="product-desc">{{ item.description }}</p>
            <div class="product-meta">
              <span>{{ item.difficulty || '精选' }}</span>
              <span>{{ formatDuration(item.durationMinutes) }}</span>
            </div>
            <div class="product-actions">
              <button @click="goTutorials">进入教程页</button>
            </div>
          </article>
        </div>

        <div v-if="!cartStore.isEmpty" class="cart-strip page-lite">
          <div>
            <strong>已选商品 {{ cartStore.uniqueCount }} 项</strong>
            <p class="sidebar-item-desc">首页、商品页和购物车页共用同一份购物车数据。</p>
          </div>
          <div class="cart-strip-actions">
            <button class="secondary-btn" @click="cartStore.clear()">清空</button>
            <button @click="goCart">查看购物车</button>
          </div>
        </div>

        <p v-if="message" class="home-message">{{ message }}</p>
      </section>

      <HomeRecommendationRail />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import HomeCategorySidebar from '../components/HomeCategorySidebar.vue'
import HomeRecommendationRail from '../components/HomeRecommendationRail.vue'
import { normalizeBuyerCategory } from '../categoryConfig'
import { useBuyerCartStore } from '../stores/useBuyerCartStore'
import {
  fetchProducts,
  fetchPromotions,
  fetchTutorials,
  type Product,
  type PromotionItem,
  type TutorialItem
} from '../api'
import { formatPrice, hasDisplayImage } from '../../../utils/format'

const router = useRouter()
const auth = useAuthStore()
const cartStore = useBuyerCartStore()

const products = ref<Product[]>([])
const tutorials = ref<TutorialItem[]>([])
const promotions = ref<PromotionItem[]>([])
const message = ref('')

const topProducts = computed(() => products.value.slice(0, 6))
const topTutorials = computed(() => tutorials.value.slice(0, 6))
const homePromotions = computed(() => promotions.value.filter((item) => item.strategyType === 'home'))
const currentPromoIndex = ref(0)
const promoTimer = ref<ReturnType<typeof setInterval> | null>(null)

const hasHomePromotions = computed(() => homePromotions.value.length > 0)
const currentPromotion = computed(() => homePromotions.value[currentPromoIndex.value] || null)

const heroTag = computed(() => {
  if (currentPromotion.value) return currentPromotion.value.title
  return '新人推荐 · 春播季'
})

const heroTitle = computed(() => '家庭种植商品与园艺灵感一站式选购')

const heroSubtitle = computed(() => {
  if (currentPromotion.value?.description) return currentPromotion.value.description
  return '点击左侧分类可快速筛选商品，加入购物车后可在购物车页统一下单。'
})

function nextPromotion() {
  if (homePromotions.value.length === 0) return
  currentPromoIndex.value = (currentPromoIndex.value + 1) % homePromotions.value.length
}

function prevPromotion() {
  if (homePromotions.value.length === 0) return
  currentPromoIndex.value = (currentPromoIndex.value - 1 + homePromotions.value.length) % homePromotions.value.length
}

function goToPromotion(idx: number) {
  currentPromoIndex.value = idx
  resetPromoTimer()
}

function resetPromoTimer() {
  if (promoTimer.value) {
    clearInterval(promoTimer.value)
  }
  if (homePromotions.value.length > 1) {
    promoTimer.value = setInterval(nextPromotion, 4000)
  }
}

onMounted(async () => {
  await Promise.all([reloadProducts(), reloadTutorials(), reloadPromotions()])
  resetPromoTimer()
})

onUnmounted(() => {
  if (promoTimer.value) clearInterval(promoTimer.value)
})

function formatDuration(durationMinutes: number | null) {
  return durationMinutes ? `${durationMinutes} 分钟` : '图文教程'
}

onMounted(async () => {
  await Promise.all([reloadProducts(), reloadTutorials(), reloadPromotions()])
})

async function reloadProducts() {
  try {
    products.value = (await fetchProducts()) || []
    products.value.forEach((item) => cartStore.syncProduct(item))
  } catch (err: any) {
    message.value = err?.response?.data?.message || '加载商品失败'
  }
}

async function reloadTutorials() {
  try {
    const res = await fetchTutorials()
    tutorials.value = res.tutorials || []
  } catch (err: any) {
    if (!message.value) {
      message.value = err?.response?.data?.message || '加载教程失败'
    }
  }
}

async function reloadPromotions() {
  try {
    promotions.value = await fetchPromotions()
    currentPromoIndex.value = 0
  } catch (err: any) {
    if (!message.value) {
      message.value = err?.response?.data?.message || '加载促销位失败'
    }
  }
}

function goProducts() {
  router.push('/products')
}

function goCommunity() {
  router.push('/community')
}

function goTutorials() {
  router.push('/tutorial')
}

function goProductDetail(id: number) {
  router.push(`/products/${id}`)
}

function goCart() {
  router.push('/cart')
}

function addToCart(item: Product) {
  if (!auth.isLoggedIn || auth.role !== 'BUYER') {
    message.value = '加入购物车前请先登录买家账户。'
    router.push('/login')
    return
  }
  cartStore.addItem(item, 1)
  message.value = `${item.name} 已加入购物车。`
}
</script>

<style scoped>
.home-shell {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 290px;
  gap: 12px;
  align-items: stretch;
  height: calc(100vh - 108px);
  overflow: hidden;
}

.home-center {
  display: grid;
  gap: 18px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.home-center::-webkit-scrollbar,
:deep(.left-sidebar)::-webkit-scrollbar {
  width: 8px;
}

.home-center::-webkit-scrollbar-thumb,
:deep(.left-sidebar)::-webkit-scrollbar-thumb {
  background: #d2e3d6;
  border-radius: 999px;
}

.hero-banner {
  min-height: 300px;
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 16px;
  background: linear-gradient(135deg, #edf9ef, #f7fbf7);
}

.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.hero-tag {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: #1f7a41;
}

.hero-content h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  color: #16351f;
}

.hero-subtitle {
  margin: 0;
  color: #4b5563;
  line-height: 1.7;
}

.hero-actions,
.cart-strip-actions,
.product-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-head h2 {
  margin: 0;
  font-size: 20px;
  color: #16351f;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.hero-highlight {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 260px;
  min-height: 0;
}

.highlight-card {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 260px;
  border-radius: 18px;
  background: rgba(31, 122, 65, 0.95);
  color: #fff;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 0;
}

.promo-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 260px;
  object-fit: cover;
  display: block;
  border-radius: 18px;
}

.highlight-overlay {
  position: relative;
  z-index: 1;
  padding: 16px 18px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.35) 55%, transparent 100%);
  border-radius: 0 0 18px 18px;
}

.highlight-card:not(.has-image) .highlight-overlay {
  background: transparent;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.highlight-label {
  font-size: 12px;
  opacity: 0.85;
  margin-bottom: 10px;
}

.highlight-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
  word-break: break-word;
}

.highlight-desc {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.92;
  margin: 0;
}

.promo-carousel {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.promo-slides {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.promo-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
  pointer-events: none;
  display: flex;
  flex-direction: column;
}

.promo-slide.active {
  opacity: 1;
  transform: translateX(0);
  position: relative;
  pointer-events: auto;
  flex: 1;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s ease;
}

.carousel-arrow:hover {
  background: rgba(255, 255, 255, 0.35);
}

.carousel-prev {
  left: 8px;
}

.carousel-next {
  right: 8px;
}

.carousel-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding-top: 10px;
}

.carousel-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.carousel-dot.active {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.25);
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.featured-product {
  display: grid;
  gap: 10px;
  cursor: pointer;
}

.tutorial-card {
  background: #fcfffc;
}

.product-cover-media {
  width: 100%;
  aspect-ratio: 4 / 3;
  min-height: 0;
  border-radius: 12px;
}

.product-thumb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  border-radius: 12px;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  color: #1f7a41;
  font-weight: 700;
}

.product-thumb.product-cover-media {
  min-height: 0;
  padding: 12px;
  text-align: center;
}

.product-image {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  display: block;
}

.product-title {
  margin: 0;
}

.product-desc {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: #1f2937;
}

.cart-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.home-message {
  margin: 0;
  color: #1f7a41;
  font-weight: 600;
}

.sidebar-item-desc {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 13px;
}

:deep(.left-sidebar),
:deep(.right-sidebar) {
  min-height: 0;
  overflow-y: auto;
}

@media (max-width: 950px) {
  .home-shell {
    grid-template-columns: 220px minmax(0, 1fr) 240px;
    gap: 10px;
    height: calc(100vh - 100px);
  }

  .hero-banner {
    grid-template-columns: 1fr;
  }

  .featured-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cart-strip {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 905px) {
  .home-shell {
    grid-template-columns: 220px minmax(0, 1fr);
  }
}

@media (max-width: 485px) {
  .home-shell {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .home-center,
  :deep(.left-sidebar),
  :deep(.right-sidebar) {
    overflow: visible;
  }
}
</style>
