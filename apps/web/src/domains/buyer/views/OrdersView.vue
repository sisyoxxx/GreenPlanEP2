<template>
  <AppLayout>
    <div class="orders-shell">
      <OrderSidebar
        v-model:keyword="keyword"
        v-model:active-tab="activeTab"
        :tabs="tabs"
        :orders-count="orders.length"
        :reviews-count="reviews.length"
      />

      <main class="orders-main">
        <section class="page-lite toolbar-card">
          <div>
            <h1>{{ activeTitle }}</h1>
          </div>
          <div class="toolbar-actions">
            <select v-model="sortBy">
              <option value="newest">最新下单</option>
              <option value="oldest">最早下单</option>
              <option value="amount">金额排序</option>
            </select>
            <button class="secondary-btn" :disabled="loading" @click="loadData">
              {{ loading ? '刷新中...' : '刷新' }}
            </button>
          </div>
        </section>

        <section v-if="activeTab === 'reviews'" class="page-lite reviews-panel">
          <div v-if="loading && reviews.length === 0" class="empty-state">评价加载中...</div>
          <div v-else-if="reviews.length === 0" class="empty-state">你还没有提交过评价。</div>
          <div v-else class="review-list">
            <article v-for="review in reviews" :key="review.id" class="review-card">
              <div class="review-head">
                <div>
                  <strong>{{ review.productName }}</strong>
                  <span class="muted">{{ formatDateTime(review.createdAt) }}</span>
                </div>
                <span class="review-stars">{{ renderStars(review.rating) }}</span>
              </div>
              <p class="review-content">{{ review.content }}</p>
              <button
                v-if="review.productStatus === 'PUBLISHED'"
                class="text-link"
                @click="goProduct(review.productId)"
              >查看商品</button>
              <span v-else class="review-unavailable">商品已下架</span>
            </article>
          </div>
        </section>

        <template v-else>
          <section v-if="loading && filteredOrders.length === 0" class="page-lite empty-state">
            订单加载中...
          </section>
          <section v-else-if="filteredOrders.length === 0" class="page-lite empty-state">
            {{ keyword ? '没有找到匹配的订单' : '当前没有符合条件的订单' }}
          </section>

          <section v-else class="order-list">
            <OrderCard
              v-for="order in sortedOrders"
              :key="order.id"
              :order="order"
              :focused="focusOrderId === order.id"
              :confirming="confirmingOrderId === order.id"
              :reviewed-product-ids="reviews.filter((r) => r.orderId === order.id).map((r) => r.productId)"
              @confirm-receive="confirmReceived(order)"
              @go-product="goProduct"
              @open-review="(productId: number, productName: string) => openReview(order, productId, productName)"
            />
          </section>
        </template>

        <OrderReviewEditor
          v-if="reviewDraft"
          :product-name="reviewDraft.productName"
          :order-no="reviewDraft.orderNo"
          v-model:rating="reviewForm.rating"
          v-model:content="reviewForm.content"
          :submitting="submittingReview"
          @submit="submitReview"
          @cancel="closeReview"
        />

        <p v-if="message" class="message">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import OrderCard from '../components/orders/OrderCard.vue'
import OrderReviewEditor from '../components/orders/OrderReviewEditor.vue'
import OrderSidebar from '../components/orders/OrderSidebar.vue'
import { useOrderCenter } from '../composables/useOrderCenter'
import { formatDateTime, renderStars } from '../../../utils/format'

const {
  loading,
  submittingReview,
  error,
  message,
  orders,
  reviews,
  keyword,
  sortBy,
  activeTab,
  focusOrderId,
  confirmingOrderId,
  reviewDraft,
  reviewForm,
  tabs,
  activeTitle,
  filteredOrders,
  sortedOrders,
  init,
  loadData,
  confirmReceived,
  openReview,
  closeReview,
  submitReview,
  goProduct
} = useOrderCenter()

onMounted(init)
</script>

<style scoped>
.orders-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
  height: calc(100vh - 108px);
  overflow: hidden;
}

.toolbar-card {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 14px;
}

.orders-main {
  display: grid;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.review-head {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.review-list {
  display: grid;
  gap: 10px;
}

.review-card {
  display: grid;
  gap: 14px;
}

.review-stars {
  color: #f59e0b;
  letter-spacing: 0.08em;
}

.review-content {
  margin: 0;
  color: #4b5563;
  line-height: 1.75;
}

.review-unavailable {
  color: #9ca3af;
  font-size: 13px;
}

.order-list {
  display: grid;
  gap: 10px;
}

.message {
  margin: 0;
  color: #1f7a41;
  font-weight: 700;
}

.error {
  margin: 0;
  color: #dc2626;
  font-weight: 700;
}

.empty-state {
  padding: 28px 16px;
  text-align: center;
  color: #6b7280;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.text-link {
  background: none;
  border: none;
  color: #1f7a41;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}

.orders-main::-webkit-scrollbar {
  width: 8px;
}

.orders-main::-webkit-scrollbar-thumb {
  background: #d2e3d6;
  border-radius: 999px;
}

@media (max-width: 920px) {
  .orders-shell,
  .toolbar-card {
    grid-template-columns: 1fr;
  }

  .orders-shell {
    height: auto;
    overflow: visible;
  }

  .orders-main {
    overflow: visible;
    padding-right: 0;
  }
}
</style>
