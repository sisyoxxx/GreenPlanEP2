<template>
  <article :class="['page-lite order-card', { focused: focused }]">
    <div class="order-card-head">
      <div>
        <strong>{{ order.orderNo }}</strong>
        <p class="muted">{{ formatOrderTime(order) }}</p>
      </div>
      <div class="status-stack">
        <span :class="['status-badge', `status-${order.status}`]">{{ statusLabel(order.status) }}</span>
      </div>
    </div>

    <div class="item-list">
      <div v-for="item in order.items" :key="`${order.id}-${item.productId}`" class="item-card">
        <div class="item-info">
          <button class="item-title" @click="emit('goProduct', item.productId)">{{ item.productName }}</button>
          <span class="muted">x{{ item.quantity }} · ¥{{ formatPrice(item.lineTotal) }}</span>
        </div>
        <button
          v-if="canReviewItem(item.productId)"
          class="secondary-btn"
          @click="emit('openReview', item.productId, item.productName)"
        >
          去评价
        </button>
        <span v-else-if="isReviewed(item.productId)" class="review-done">已评价</span>
      </div>
    </div>

    <div class="order-card-foot">
      <span class="order-total">合计 ¥{{ formatPrice(order.totalAmount) }}</span>
      <div class="card-actions">
        <button
          v-if="canConfirmReceive"
          class="secondary-btn"
          :disabled="confirming"
          @click="emit('confirmReceive')"
        >
          {{ confirming ? '处理中...' : '已收货' }}
        </button>
        <button class="secondary-btn" @click="emit('goProduct', order.items[0]?.productId)">再次购买</button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type BuyerOrder } from '../../api'
import { formatDateTime, formatPrice } from '../../../../utils/format'
import { ORDER_STATUS_MAP } from '../../../../utils/constants'

const props = withDefaults(
  defineProps<{
    order: BuyerOrder
    focused?: boolean
    confirming?: boolean
    reviewedProductIds?: number[]
  }>(),
  {
    focused: false,
    confirming: false,
    reviewedProductIds: () => []
  }
)

const emit = defineEmits<{
  confirmReceive: []
  goProduct: [productId?: number]
  openReview: [productId: number, productName: string]
}>()

function statusLabel(status: string) {
  return ORDER_STATUS_MAP[status] || status
}

function formatOrderTime(order: BuyerOrder) {
  const text = formatDateTime(order.createdAt)
  if (text) return text

  const match = order.orderNo?.match(/^GP(\d{13})/)
  if (match) {
    const ts = Number(match[1])
    if (Number.isFinite(ts) && ts > 0) {
      const date = new Date(ts)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const hh = String(date.getHours()).padStart(2, '0')
      const mm = String(date.getMinutes()).padStart(2, '0')
      return `${y}-${m}-${d} ${hh}:${mm}`
    }
  }

  return '下单时间待同步'
}

function isReviewed(productId: number) {
  return props.reviewedProductIds.includes(productId)
}

function canReviewItem(productId: number) {
  return ['SHIPPED', 'DELIVERED'].includes(props.order.status) && !isReviewed(productId)
}

const canConfirmReceive = computed(() => {
  return ['PAID', 'SHIPPED'].includes(props.order.status)
})
</script>

<style scoped>
.order-card {
  display: grid;
  gap: 14px;
}

.order-card.focused {
  border: 1px solid #9ad3aa;
  box-shadow: 0 0 0 1px rgba(31, 122, 65, 0.16);
}

.order-card-head,
.status-stack,
.order-card-foot,
.card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.status-badge,
.review-done {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-PAID {
  background: #fff5d6;
  color: #946200;
}

.status-SHIPPED {
  background: #e7eefc;
  color: #2f5fb8;
}

.status-DELIVERED {
  background: #dff5e4;
  color: #166534;
}

.review-done {
  background: #edf9ef;
  color: #1f7a41;
}

.item-list {
  display: grid;
  gap: 10px;
}

.item-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  background: #f8fcf8;
  border: 1px solid #e3eee4;
}

.item-info {
  display: grid;
  gap: 4px;
}

.item-title {
  padding: 0;
  border: none;
  background: transparent;
  color: #16351f;
  font-weight: 700;
  text-align: left;
}

.order-total {
  font-size: 15px;
  font-weight: 700;
  color: #16351f;
}

.muted {
  color: #6b7280;
  font-size: 13px;
}

.card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}
</style>
