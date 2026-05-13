<template>
  <div class="hero-banner page-lite">
    <div class="hero-content">
      <p class="hero-tag">{{ heroTag }}</p>
      <h1>{{ heroTitle }}</h1>
      <p class="hero-subtitle">{{ heroSubtitle }}</p>
      <div class="hero-actions">
        <button @click="$emit('goProducts')">立即选购</button>
        <button class="secondary-btn" @click="$emit('goCommunity')">逛逛社区</button>
      </div>
    </div>
    <div class="hero-highlight">
      <div v-if="hasHomePromotions" class="promo-carousel">
        <div class="promo-slides">
          <div
            v-for="(promo, idx) in promotions"
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
                <div class="highlight-label">首页促销位 {{ idx + 1 }} / {{ promotions.length }}</div>
                <div class="highlight-title">{{ promo.title }}</div>
                <div class="highlight-desc">{{ promo.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <button
          v-if="promotions.length > 1"
          class="carousel-arrow carousel-prev"
          type="button"
          aria-label="上一个"
          @click="prevPromotion"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button
          v-if="promotions.length > 1"
          class="carousel-arrow carousel-next"
          type="button"
          aria-label="下一个"
          @click="nextPromotion"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        <div v-if="promotions.length > 1" class="carousel-dots">
          <button
            v-for="(_, idx) in promotions"
            :key="idx"
            type="button"
            class="carousel-dot"
            :class="{ active: idx === currentPromoIndex }"
            :aria-label="`切换到第 ${idx + 1} 个促销`"
            @click="goToPromotion(idx)"
          />
        </div>
      </div>

      <div v-else class="highlight-card" :class="{ 'has-image': fallbackHasImage }">
        <img
          v-if="fallbackHasImage"
          class="promo-image"
          :src="fallbackImage || ''"
          :alt="fallbackTitle"
          loading="lazy"
        />
        <div class="highlight-overlay">
          <div class="highlight-label">{{ fallbackLabel }}</div>
          <div class="highlight-title">{{ fallbackTitle }}</div>
          <div class="highlight-desc">{{ fallbackDesc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { hasDisplayImage } from '../../../utils/format'
import type { Product, PromotionItem, TutorialItem } from '../api'

const props = defineProps<{
  promotions: PromotionItem[]
  topProduct: Product | null
  topTutorial: TutorialItem | null
}>()

defineEmits<{
  (e: 'goProducts'): void
  (e: 'goCommunity'): void
}>()

const currentPromoIndex = ref(0)
const promoTimer = ref<ReturnType<typeof setInterval> | null>(null)

const hasHomePromotions = computed(() => props.promotions.length > 0)
const currentPromotion = computed(() => props.promotions[currentPromoIndex.value] || null)

const heroTag = computed(() => {
  if (currentPromotion.value) return currentPromotion.value.title
  return '新人推荐 · 春播季'
})

const heroTitle = computed(() => '家庭种植商品与园艺灵感一站式选购')

const heroSubtitle = computed(() => {
  if (currentPromotion.value?.description) return currentPromotion.value.description
  return '点击左侧分类可快速筛选商品，加入购物车后可在购物车页统一下单。'
})

const fallbackHasImage = computed(() =>
  props.topProduct ? hasDisplayImage(props.topProduct.imageUrl) : false
)
const fallbackImage = computed(() => props.topProduct?.imageUrl || '')
const fallbackLabel = computed(() => (props.topProduct ? '本周热销' : '本周精选教程'))
const fallbackTitle = computed(() =>
  props.topProduct?.name || props.topTutorial?.title || '家庭种植推荐'
)
const fallbackDesc = computed(() =>
  props.topProduct?.description || props.topTutorial?.description || '从分类筛选到购物车下单，流程更顺手。'
)

function nextPromotion() {
  if (props.promotions.length === 0) return
  currentPromoIndex.value = (currentPromoIndex.value + 1) % props.promotions.length
}

function prevPromotion() {
  if (props.promotions.length === 0) return
  currentPromoIndex.value = (currentPromoIndex.value - 1 + props.promotions.length) % props.promotions.length
}

function goToPromotion(idx: number) {
  currentPromoIndex.value = idx
  resetPromoTimer()
}

function resetPromoTimer() {
  if (promoTimer.value) {
    clearInterval(promoTimer.value)
  }
  if (props.promotions.length > 1) {
    promoTimer.value = setInterval(nextPromotion, 4000)
  }
}

onMounted(() => {
  resetPromoTimer()
})

onUnmounted(() => {
  if (promoTimer.value) clearInterval(promoTimer.value)
})
</script>

<style scoped>
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

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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

@media (max-width: 950px) {
  .hero-banner {
    grid-template-columns: 1fr;
  }
}
</style>
