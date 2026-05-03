<template>
  <div class="cart-popup">
    <div class="cart-popup-header">
      <span>购物车</span>
      <span class="cart-popup-count">{{ cartStore.itemCount }} 件</span>
    </div>
    <div class="cart-popup-body">
      <div v-if="cartStore.isEmpty" class="cart-popup-empty">购物车还是空的，去挑选商品吧。</div>
      <div v-else class="cart-popup-list">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-popup-item">
          <img
            v-if="hasDisplayImage(item.imageUrl)"
            class="cart-popup-thumb-image"
            :src="item.imageUrl"
            :alt="item.name"
            loading="lazy"
          />
          <div v-else class="cart-popup-thumb">{{ item.name.charAt(0) || '商品' }}</div>
          <div class="cart-popup-main">
            <div class="cart-popup-top">
              <span class="cart-popup-name">{{ item.name }}</span>
              <span class="cart-popup-price">¥{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
            <div class="cart-popup-bottom">
              <div class="cart-popup-stepper" @click.stop>
                <button type="button" class="popup-step-btn" @click.stop="cartStore.decrease(item.id)">-</button>
                <input
                  :value="item.quantity"
                  type="number"
                  min="1"
                  :max="Math.max(1, item.onlineStock)"
                  @input="updateQuantity(item.id, $event)"
                />
                <button type="button" class="popup-step-btn" @click.stop="cartStore.increase(item.id)">+</button>
              </div>
              <button type="button" class="cart-popup-remove" @click.stop="cartStore.removeItem(item.id)">
                移除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!cartStore.isEmpty" class="cart-popup-footer">
      <span class="cart-popup-total">合计：<strong>¥{{ formatPrice(cartStore.totalAmount) }}</strong></span>
      <button class="cart-popup-checkout" @click="emit('checkout')">查看购物车</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBuyerCartStore } from '../../stores/useBuyerCartStore'
import { formatPrice, hasDisplayImage } from '../../../../utils/format'

const emit = defineEmits<{
  (e: 'checkout'): void
}>()

const cartStore = useBuyerCartStore()

function updateQuantity(productId: number, event: Event) {
  const value = Number((event.target as HTMLInputElement | null)?.value ?? 1)
  cartStore.setQuantity(productId, value)
}
</script>

<style scoped>
.cart-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
}

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
  background: rgba(255, 255, 255, 0.25);
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

.cart-popup-list {
  display: grid;
  gap: 8px;
}

.cart-popup-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
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

.cart-popup-thumb-image {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
  flex-shrink: 0;
}

.cart-popup-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.cart-popup-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: start;
}

.cart-popup-name {
  font-size: 13px;
  color: #1f2937;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-popup-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.cart-popup-price {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  white-space: nowrap;
}

.cart-popup-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid #dfe8e1;
  border-radius: 999px;
  overflow: hidden;
  background: #fff;
}

.cart-popup-stepper input {
  width: 54px;
  border: none;
  text-align: center;
  background: transparent;
  font-size: 12px;
  padding: 0;
  appearance: textfield;
  -moz-appearance: textfield;
}

.cart-popup-stepper input::-webkit-outer-spin-button,
.cart-popup-stepper input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.popup-step-btn {
  border: none;
  background: #f4f8f4;
  color: #1f7a41;
  width: 32px;
  height: 32px;
  font-size: 16px;
  cursor: pointer;
}

.popup-step-btn:hover {
  background: #eaf3ec;
}

.cart-popup-remove {
  border: none;
  background: transparent;
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.cart-popup-remove:hover {
  color: #b91c1c;
}

.cart-popup-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  background: #fff;
}

.cart-popup-total {
  font-size: 14px;
  color: #6b7280;
}

.cart-popup-total strong {
  color: #1f2937;
  font-size: 16px;
}

.cart-popup-checkout {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: #1f7a41;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.cart-popup-checkout:hover {
  background: #276749;
}
</style>
