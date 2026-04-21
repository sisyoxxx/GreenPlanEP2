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
            <span>SKU：{{ product.sku }}</span>
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

      <section class="reviews-shell">
        <div class="page-lite review-summary-card">
          <div>
            <h2>买家评价</h2>
            <p class="muted">以下内容全部来自数据库中的真实评价记录。</p>
          </div>
          <div class="summary-score">
            <strong>{{ averageRatingText }}</strong>
            <span>{{ reviews.length }} 条评价</span>
          </div>
        </div>

        <div v-if="reviews.length === 0" class="page-lite state-card">
          <h3>还没有评价</h3>
          <p class="muted">当前商品还没有买家留下评价，完成购买后即可在订单页提交。</p>
        </div>

        <div v-else class="review-list">
          <article v-for="review in reviews" :key="review.id" class="page-lite review-card">
            <div class="review-head">
              <div>
                <strong>{{ review.buyerUsername }}</strong>
                <span class="review-time">{{ formatDateTime(review.createdAt) }}</span>
              </div>
              <span class="review-stars">{{ renderStars(review.rating) }}</span>
            </div>
            <p class="review-content">{{ review.content }}</p>
          </article>
        </div>
      </section>
    </template>

    <div v-else class="page-lite state-card">
      <h3>商品不存在</h3>
      <p class="muted">请返回商品页重新选择。</p>
      <div class="detail-actions">
        <button @click="goProducts">返回商品页</button>
      </div>
    </div>

    <div v-if="showPayDialog && product" class="pay-dialog-mask" @click.self="closePayDialog">
      <div class="pay-dialog page-lite">
        <div class="pay-dialog-head">
          <div>
            <h3>支付确认</h3>
            <p>这里仅做流程演示，不会接入真实支付。</p>
          </div>
          <button class="close-btn" @click="closePayDialog">×</button>
        </div>

        <div class="pay-dialog-body">
          <div class="pay-line">
            <span>商品</span>
            <strong>{{ product.name }}</strong>
          </div>
          <div class="pay-line">
            <span>数量</span>
            <strong>{{ payQuantity }}</strong>
          </div>
          <div class="pay-line">
            <span>应付金额</span>
            <strong class="pay-amount">￥{{ formatPrice(product.price * payQuantity) }}</strong>
          </div>
          <div class="pay-note">点击“确认支付”后将直接生成订单并跳转到订单页。</div>
        </div>

        <div class="pay-dialog-actions">
          <button class="secondary-btn" @click="closePayDialog">取消</button>
          <button @click="confirmPay" :disabled="submitting">{{ submitting ? '处理中...' : '确认支付' }}</button>
        </div>
      </div>
    </div>
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

function hasDisplayImage(url: string | null | undefined) {
  if (!url) return false
  return /^https?:\/\//i.test(url)
}

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
  if (!auth.isLoggedIn || auth.role !== 'BUYER') {
    message.value = `${actionText}前请先登录买家账户。`
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

function addToCart() {
  if (!product.value) return
  if (!ensureBuyer('加入购物车')) return
  cartStore.addItem(product.value, payQuantity.value)
  message.value = `${product.value.name} 已加入购物车。`
}

function renderStars(rating: number) {
  const safe = Math.max(0, Math.min(5, rating))
  return `${'★'.repeat(safe)}${'☆'.repeat(5 - safe)}`
}

function formatPrice(price: number) {
  return Number(price).toFixed(2)
}

function formatDateTime(value: string | null) {
  if (!value) return '刚刚'
  return value.replace('T', ' ').slice(0, 16)
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
  min-height: 320px;
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
  min-height: 320px;
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

.rating-stars,
.review-stars {
  color: #f59e0b;
  font-size: 16px;
  letter-spacing: 0.08em;
}

.rating-meta,
.review-time,
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

.hero-subtitle,
.review-content {
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

.reviews-shell {
  display: grid;
  gap: 14px;
  margin-top: 14px;
}

.review-summary-card {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
}

.review-summary-card h2 {
  margin: 0;
  color: #16351f;
}

.summary-score {
  display: grid;
  gap: 4px;
  justify-items: end;
  text-align: right;
}

.summary-score strong {
  font-size: 30px;
  color: #1f7a41;
}

.summary-score span {
  color: #6b7280;
  font-size: 13px;
}

.review-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.review-card {
  display: grid;
  gap: 10px;
}

.review-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: start;
}

.review-head strong {
  display: block;
  color: #1f2937;
}

.state-card {
  display: grid;
  gap: 10px;
  padding: 18px;
}

.pay-dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 60;
}

.pay-dialog {
  width: min(440px, 100%);
  display: grid;
  gap: 16px;
}

.pay-dialog-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.pay-dialog-head h3 {
  margin: 0;
  color: #16351f;
}

.pay-dialog-head p {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f4f7f4;
  color: #374151;
  font-size: 20px;
  line-height: 1;
}

.pay-dialog-body {
  display: grid;
  gap: 10px;
}

.pay-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #4b5563;
}

.pay-amount {
  color: #1f7a41;
  font-size: 20px;
}

.pay-note {
  padding: 12px;
  border-radius: 12px;
  background: #f8fcf8;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.pay-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .product-detail-shell,
  .review-list {
    grid-template-columns: 1fr;
  }

  .review-summary-card {
    flex-direction: column;
  }

  .summary-score {
    justify-items: start;
    text-align: left;
  }
}
</style>
