<template>
  <AppLayout>
    <div class="home-shell">
      <HomeCategorySidebar />

      <section class="home-center">
        <HomeHeroBanner
          :promotions="homePromotions"
          :top-product="topProducts[0] || null"
          :top-tutorial="topTutorials[0] || null"
          @go-products="goProducts"
          @go-community="goCommunity"
        />

        <HomeFeaturedGrid
          :products="topProducts"
          :tutorials="topTutorials"
          @add-to-cart="addToCart"
          @go-product-detail="goProductDetail"
          @go-tutorials="goTutorials"
        />

        <HomeTutorialsGrid
          :tutorials="homeTutorials"
          @go-tutorials="goTutorials"
          @go-tutorial-detail="goTutorialDetail"
        />

        <HomeCommunityGrid
          :posts="homePosts"
          @go-community="goCommunity"
          @go-post-detail="goPostDetail"
        />

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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import HomeCategorySidebar from '../components/HomeCategorySidebar.vue'
import HomeRecommendationRail from '../components/HomeRecommendationRail.vue'
import HomeHeroBanner from '../components/HomeHeroBanner.vue'
import HomeFeaturedGrid from '../components/HomeFeaturedGrid.vue'
import HomeTutorialsGrid from '../components/HomeTutorialsGrid.vue'
import HomeCommunityGrid from '../components/HomeCommunityGrid.vue'
import { useBuyerCartStore } from '../stores/useBuyerCartStore'
import { useBuyerCommunityStore } from '../stores/useBuyerCommunityStore'
import {
  fetchProducts,
  fetchPromotions,
  fetchTutorials,
  type Product,
  type PromotionItem,
  type TutorialItem
} from '../api'

const router = useRouter()
const auth = useAuthStore()
const cartStore = useBuyerCartStore()
const communityStore = useBuyerCommunityStore()

const products = ref<Product[]>([])
const tutorials = ref<TutorialItem[]>([])
const promotions = ref<PromotionItem[]>([])
const message = ref('')

const topProducts = computed(() => products.value.slice(0, 6))
const topTutorials = computed(() => tutorials.value.slice(0, 6))
const homeTutorials = computed(() => tutorials.value.slice(0, 4))
const homePosts = computed(() => communityStore.posts.slice(0, 4))
const homePromotions = computed(() => promotions.value.filter((item) => item.strategyType === 'home'))

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

function goTutorialDetail(id: number) {
  router.push(`/tutorial/${id}`)
}

function goPostDetail(id: number) {
  router.push(`/community/${id}`)
}

function goCart() {
  router.push('/cart')
}

async function addToCart(item: Product) {
  if (!auth.isLoggedIn) {
    message.value = '加入购物车前请先登录。'
    router.push('/login')
    return
  }
  try {
    await cartStore.addItem(item, 1)
    message.value = `${item.name} 已加入购物车。`
  } catch (err: any) {
    const msg = err?.response?.data?.message || '加入购物车失败，请检查网络或登录状态'
    message.value = msg
    alert(msg)
  }
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

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
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

  .home-center,
  :deep(.left-sidebar),
  :deep(.right-sidebar) {
    overflow: visible;
  }
}
</style>
