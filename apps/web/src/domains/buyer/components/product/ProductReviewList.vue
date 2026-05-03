<template>
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

<script setup lang="ts">
import { computed } from 'vue'
import { type ProductReview } from '../../api'
import { formatDateTime, renderStars } from '../../../../utils/format'

const props = defineProps<{
  reviews: ProductReview[]
}>()

const averageRating = computed(() => {
  if (props.reviews.length === 0) return 0
  const total = props.reviews.reduce((sum, item) => sum + item.rating, 0)
  return total / props.reviews.length
})

const averageRatingText = computed(() => (averageRating.value > 0 ? averageRating.value.toFixed(1) : '暂无评分'))
</script>

<style scoped>
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

.review-stars {
  color: #f59e0b;
  font-size: 16px;
  letter-spacing: 0.08em;
}

.review-time,
.muted {
  color: #6b7280;
  line-height: 1.7;
}

.review-content {
  margin: 0;
  color: #4b5563;
  line-height: 1.8;
}

.state-card {
  display: grid;
  gap: 10px;
  padding: 18px;
}

@media (max-width: 900px) {
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
