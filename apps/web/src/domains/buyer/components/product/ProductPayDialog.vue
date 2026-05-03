<template>
  <div v-if="show && product" class="pay-dialog-mask" @click.self="onClose">
    <div class="pay-dialog page-lite">
      <div class="pay-dialog-head">
        <div>
          <h3>支付确认</h3>
          <p>这里仅做流程演示，不会接入真实支付。</p>
        </div>
        <button class="close-btn" @click="onClose">×</button>
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
        <button class="secondary-btn" @click="onClose">取消</button>
        <button @click="onConfirm" :disabled="submitting">{{ submitting ? '处理中...' : '确认支付' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type Product } from '../../api'
import { formatPrice } from '../../../../utils/format'

const props = defineProps<{
  show: boolean
  product: Product | null
  quantity: number
  maxPurchase: number
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const payQuantity = computed(() => Math.max(1, Math.min(props.maxPurchase, Number(props.quantity) || 1)))

function onClose() {
  emit('close')
}

function onConfirm() {
  emit('confirm')
}
</script>

<style scoped>
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

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}
</style>
