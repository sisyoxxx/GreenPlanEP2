<template>
  <AppLayout>
    <div v-if="loading" class="page-lite state-card">
      <h3>商品详情加载中...</h3>
    </div>

    <div v-else-if="error" class="page-lite state-card">
      <h3>商品详情加载失败</h3>
      <p class="muted">{{ error }}</p>
      <div class="detail-actions">
        <button @click="goProducts">返回商品页</button>
      </div>
    </div>

    <template v-else-if="product">
      <section class="product-detail-shell page-lite">
        <div class="detail-cover">
          <img v-if="hasDisplayImage(product.imageUrl)" class="product-image detail-image" :src="product.imageUrl" :alt="product.name" loading="lazy" />
          <div v-else class="product-thumb detail-thumb">{{ productThumbText }}</div>
        </div>

        <div class="detail-content">
          <div class="detail-tags">
            <span class="detail-tag">{{ displayCategory }}</span>
            <span class="detail-tag subtle">{{ product.plantingMonth || '全年可种' }}</span>
            <span class="detail-tag subtle">{{ product.suitableRegion || '通用地区' }}</span>
          </div>

          <h1>{{ product.name }}</h1>

          <div class="rating-row">
            <span class="rating-stars">{{ averageStars }}</span>
            <span class="rating-meta">{{ averageRatingText }} · {{ reviews.length }} 条评价</span>
          </div>

          <p class="detail-price">￥{{ formatPrice(product.price) }}</p>
          <p class="hero-subtitle">{{ product.description }}</p>

          <div class="product-extra-meta">
            <span>库存：{{ product.onlineStock }}</span>
            <span>销量：{{ product.sales ?? 0 }}</span>
            <span>SKU：{{ product.sku }}</span>
            <span>品种：{{ product.variety || '未设置' }}</span>
            <span>产地：{{ product.origin || '未设置' }}</span>
            <span>发芽率：{{ formatRate(product.germinationRate) }}</span>
          </div>

          <div class="purchase-panel">
            <label class="qty-field">
              <span>购买数量</span>
              <input v-model.number="quantity" type="number" min="1" :max="maxPurchase" />
            </label>

            <div class="detail-actions">
              <button @click="openPayDialog" :disabled="submitting || product.onlineStock <= 0">
                {{ submitting ? '下单中...' : product.onlineStock > 0 ? '立即购买' : '库存不足' }}
              </button>
              <button class="secondary-btn" @click="addToCart" :disabled="product.onlineStock <= 0">加入购物车</button>
              <button class="secondary-btn" @click="goCart">查看购物车</button>
              <button class="secondary-btn" @click="goProducts">返回商品页</button>
            </div>
          </div>

          <p v-if="message" class="message">{{ message }}</p>
        </div>
      </section>

      <ProductReviewList :reviews="reviews" />
    </template>

    <div v-else class="page-lite state-card">
      <h3>商品不存在</h3>
      <p class="muted">请返回商品页重新选择。</p>
      <div class="detail-actions">
        <button @click="goProducts">返回商品页</button>
      </div>
    </div>

    <ProductPayDialog
      :show="showPayDialog"
      :product="product"
      :quantity="quantity"
      :max-purchase="maxPurchase"
      :submitting="submitting"
      @close="closePayDialog"
      @confirm="confirmPay"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import AppLayout from '../../../layouts/AppLayout.vue'
import { normalizeBuyerCategory } from '../categoryConfig'
import { useBuyerCartStore } from '../stores/useBuyerCartStore'
import { createOrder, fetchProduct, fetchProductReviews, type Product, type ProductReview } from '../api'
import { formatDateTime, formatPrice, renderStars, hasDisplayImage } from '../../../utils/format'
import ProductReviewList from '../components/product/ProductReviewList.vue'
import ProductPayDialog from '../components/product/ProductPayDialog.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cartStore = useBuyerCartStore()

const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const message = ref('')
const product = ref<Product | null>(null)
const reviews = ref<ProductReview[]>([])
const quantity = ref(1)
const showPayDialog = ref(false)

const maxPurchase = computed(() => {
  if (!product.value?.onlineStock) return 1
  return Math.max(1, product.value.onlineStock)
})

const payQuantity = computed(() => Math.max(1, Math.min(maxPurchase.value, Number(quantity.value) || 1)))

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const total = reviews.value.reduce((sum, item) => sum + item.rating, 0)
  return total / reviews.value.length
})

const averageRatingText = computed(() => (averageRating.value > 0 ? averageRating.value.toFixed(1) : '暂无评分'))
const averageStars = computed(() => renderStars(Math.round(averageRating.value || 0)))
const displayCategory = computed(() => normalizeBuyerCategory(product.value?.category))
const productThumbText = computed(() => product.value?.name || '商品')

onMounted(async () => {
  const id = Number(route.params.id)
  if (!Number.isFinite(id)) {
    loading.value = false
    error.value = '无效的商品 ID'
    return
  }

  try {
    const [productDetail, productReviews] = await Promise.all([fetchProduct(id), fetchProductReviews(id)])
    product.value = productDetail
    reviews.value = productReviews
    quantity.value = 1
    cartStore.syncProduct(productDetail)
  } catch (err: any) {
    error.value = err?.response?.data?.message || '加载商品失败'
  } finally {
    loading.value = false
  }
})

function ensureBuyer(actionText: string) {
  if (!auth.isLoggedIn) {
    message.value = `${actionText}前请先登录。`
    router.push('/login')
    return false
  }
  return true
}

function openPayDialog() {
  if (!product.value) return
  if (!ensureBuyer('购买')) return
  showPayDialog.value = true
}

function closePayDialog() {
  showPayDialog.value = false
}

async function confirmPay() {
  if (!product.value) return

  submitting.value = true
  message.value = ''

  try {
    const res = await createOrder([{ productId: product.value.id, quantity: payQuantity.value }]) as {
      data: { id: number; orderNo: string }
    }
    message.value = `订单已生成：${res.data.orderNo}`
    product.value = await fetchProduct(product.value.id)
    if (product.value) cartStore.syncProduct(product.value)
    closePayDialog()
    router.push(`/orders?focus=${res.data.id}`)
  } catch (err: any) {
    message.value = err?.response?.data?.message || '下单失败'
  } finally {
    submitting.value = false
  }
}

async function addToCart() {
  if (!product.value) return
  if (!ensureBuyer('加入购物车')) return
  try {
    await cartStore.addItem(product.value, payQuantity.value)
    message.value = `${product.value.name} 已加入购物车。`
  } catch (err: any) {
    const msg = err?.response?.data?.message || '加入购物车失败，请检查网络或登录状态'
    message.value = msg
    alert(msg)
  }
}

function formatRate(rate: number | null | undefined) {
  if (rate === null || rate === undefined || Number.isNaN(Number(rate))) return '未设置'
  return `${Number(rate).toFixed(2)}%`
}

function goProducts() {
  router.push('/products')
}

function goCart() {
  router.push('/cart')
}
</script>

<style scoped>
.product-detail-shell {
  display: grid;
  grid-template-columns: 380px minmax(0, 1fr);
  gap: 20px;
  padding: 20px;
}

.detail-cover {
  display: flex;
  align-items: stretch;
}

.product-thumb {
  width: 100%;
  height: 260px;
  border-radius: 20px;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #1f7a41;
  text-align: center;
  padding: 24px;
}

.product-image {
  width: 100%;
  height: 260px;
  border-radius: 20px;
  object-fit: cover;
  display: block;
}

.detail-content {
  display: grid;
  gap: 12px;
  align-content: start;
}

.detail-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-tag {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
}

.detail-tag.subtle {
  background: #f4f7f4;
  color: #4b5563;
}

h1 {
  margin: 0;
  color: #16351f;
  font-size: 32px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.rating-stars {
  color: #f59e0b;
  font-size: 16px;
  letter-spacing: 0.08em;
}

.rating-meta,
.muted {
  color: #6b7280;
  line-height: 1.7;
}

.detail-price {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
}

.hero-subtitle {
  margin: 0;
  color: #4b5563;
  line-height: 1.8;
}

.product-extra-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #6b7280;
  font-size: 13px;
}

.purchase-panel {
  display: grid;
  gap: 12px;
  margin-top: 6px;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8fcf8, #ffffff);
  border: 1px solid #e3eee4;
}

.qty-field {
  display: grid;
  gap: 6px;
  max-width: 160px;
}

.qty-field span {
  font-size: 13px;
  color: #4b5563;
  font-weight: 600;
}

.detail-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.message {
  margin: 0;
  color: #1f7a41;
  font-weight: 700;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.state-card {
  display: grid;
  gap: 10px;
  padding: 18px;
}

@media (max-width: 900px) {
  .product-detail-shell {
    grid-template-columns: 1fr;
  }
}
</style>
