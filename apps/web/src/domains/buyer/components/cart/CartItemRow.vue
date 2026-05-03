<template>
  <article class="cart-item-card" :class="{ multi: isMultiMode }">
    <label v-if="isMultiMode" class="select-box">
      <input :checked="selected" type="checkbox" @change="$emit('toggleSelect', item.id)" />
    </label>

    <div class="cart-item-cover" @click="$emit('goDetail', item.id)">
      <img v-if="hasDisplayImage(item.imageUrl)" :src="item.imageUrl" :alt="item.name" loading="lazy" />
      <span v-else>{{ item.name }}</span>
    </div>

    <div class="cart-item-info">
      <div class="cart-item-top">
        <div>
          <span class="cart-item-tag">{{ normalizeCategory(item.category) }}</span>
          <h3 class="cart-item-title" @click="$emit('goDetail', item.id)">{{ item.name }}</h3>
        </div>
        <strong class="cart-item-price">￥{{ formatPrice(item.price) }}</strong>
      </div>

      <p class="cart-item-desc">{{ item.description }}</p>

      <div class="cart-item-meta">
        <span>播种：{{ item.plantingMonth || '未设置' }}</span>
        <span>地区：{{ item.suitableRegion || '未设置' }}</span>
        <span>库存：{{ item.onlineStock }}</span>
      </div>

      <div class="cart-item-actions">
        <div class="qty-stepper">
          <button type="button" class="step-btn" @click="$emit('decrease', item.id)">-</button>
          <input
            :value="item.quantity"
            type="number"
            min="1"
            :max="Math.max(1, item.onlineStock)"
            @input="onQuantityInput"
          />
          <button type="button" class="step-btn" @click="$emit('increase', item.id)">+</button>
        </div>

        <div class="cart-item-side-actions">
          <span class="line-total">小计：￥{{ formatPrice(item.price * item.quantity) }}</span>
          <button type="button" class="text-btn" @click="$emit('remove', item.id)">移除</button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { normalizeBuyerCategory } from '../../categoryConfig'
import type { BuyerCartItem } from '../../stores/useBuyerCartStore'
import { formatPrice, hasDisplayImage } from '../../../../utils/format'

const props = defineProps<{
  item: BuyerCartItem
  selected: boolean
  isMultiMode: boolean
}>()

const emit = defineEmits<{
  (e: 'toggleSelect', id: number): void
  (e: 'decrease', id: number): void
  (e: 'increase', id: number): void
  (e: 'updateQuantity', id: number, quantity: number): void
  (e: 'remove', id: number): void
  (e: 'goDetail', id: number): void
}>()

function normalizeCategory(category: string | null | undefined) {
  return normalizeBuyerCategory(category)
}

function onQuantityInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('updateQuantity', props.item.id, Number(target.value) || 1)
}
</script>

<style scoped>
.cart-item-card {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 16px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid #e5efe7;
  background: #fbfefb;
}

.cart-item-card.multi {
  grid-template-columns: 24px 180px minmax(0, 1fr);
}

.select-box {
  display: flex;
  align-items: start;
  justify-content: center;
  padding-top: 6px;
}

.cart-item-cover {
  min-height: 180px;
  border-radius: 14px;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1f7a41;
  font-weight: 700;
  text-align: center;
  padding: 16px;
  cursor: pointer;
}

.cart-item-cover img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

.cart-item-cover span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.cart-item-info {
  display: grid;
  gap: 10px;
}

.cart-item-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.cart-item-tag {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}

.cart-item-title {
  cursor: pointer;
  color: #1f2937;
}

.cart-item-price {
  color: #1f7a41;
  font-size: 20px;
}

.cart-item-desc {
  margin: 0;
  color: #6b7280;
  line-height: 1.7;
}

.cart-item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #5f6d66;
  font-size: 12px;
}

.cart-item-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.qty-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid #dfe8e1;
  border-radius: 999px;
  overflow: hidden;
  background: #fff;
}

.qty-stepper input {
  width: 64px;
  border: none;
  text-align: center;
  background: transparent;
  appearance: textfield;
  -moz-appearance: textfield;
}

.qty-stepper input::-webkit-outer-spin-button,
.qty-stepper input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.step-btn {
  border: none;
  background: #f4f8f4;
  color: #1f7a41;
  width: 36px;
  height: 36px;
  font-size: 18px;
}

.cart-item-side-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.line-total {
  color: #1f2937;
  font-weight: 700;
}

.text-btn {
  border: none;
  background: transparent;
  color: #dc2626;
  padding: 0;
}

@media (max-width: 760px) {
  .cart-item-top {
    flex-direction: column;
    align-items: stretch;
  }

  .cart-item-card {
    grid-template-columns: 1fr;
  }

  .cart-item-card.multi {
    grid-template-columns: 1fr;
  }

  .select-box {
    justify-content: flex-start;
    padding-top: 0;
  }
}
</style>
