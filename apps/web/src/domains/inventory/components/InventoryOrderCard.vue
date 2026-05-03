<template>
  <article :class="['order-entry', { expanded: props.expanded }]">
    <div
      :class="['trow', { 'trow-expanded': props.expanded }]"
      @click="emit('toggle')"
    >
      <div class="check-col" @click.stop>
        <input
          type="checkbox"
          :checked="props.selected"
          :disabled="props.order.status !== 'PAID'"
          @change="onSelectChange"
        />
      </div>
      <div class="name">
        <div class="title">{{ orderName }}</div>
        <div class="sub">订单号：{{ props.order.orderNo }}</div>
      </div>
      <div class="sub">{{ props.order.buyerUsername || `用户#${props.order.buyerId || '-'}` }}</div>
      <div>
        <div class="pill">{{ logisticsLabel }}</div>
        <div class="sub meta">{{ logisticsMeta }}</div>
      </div>
      <div class="right actions" @click.stop>
        <button
          v-if="props.order.status === 'PAID'"
          class="secondary-btn"
          @click="emit('ship')"
          :disabled="props.submitting"
        >
          {{ props.pending ? '发货中...' : '发货' }}
        </button>
        <button v-else class="secondary-btn muted-btn" disabled>
          {{ props.order.status === 'DELIVERED' ? '已签收' : '已发货' }}
        </button>
      </div>
    </div>

    <div v-if="props.expanded" class="detail-wrap">
      <div class="detail-divider"></div>

      <div class="detail-head">
        <div>
          <h3>订单详情：{{ props.order.orderNo }}</h3>
          <p class="sub">{{ props.order.buyerUsername || `用户#${props.order.buyerId || '-'}` }}</p>
        </div>
        <button class="secondary-btn" @click="emit('toggle')">关闭</button>
      </div>

      <div class="detail-panel">
        <div class="detail-banner">
          <span class="detail-badge">当前订单详情</span>
          <span class="detail-note">点击订单展开这里只查看明细，发货按钮会直接修改订单状态。</span>
        </div>

        <div class="grid grid-2 detail-grid">
          <div class="info-card">
            <h4>物流状态</h4>
            <p class="sub">{{ logisticsLabel }}</p>
          </div>
          <div class="info-card">
            <h4>发货说明</h4>
            <p class="sub">{{ shippingNote }}</p>
          </div>
        </div>

        <div class="item-list">
          <div class="item-row" v-for="item in props.order.items || []" :key="`${props.order.id}-${item.productId}`">
            <span>{{ item.productName }}</span>
            <span>x{{ item.quantity }}</span>
          </div>
        </div>

        <div class="row-actions">
          <button
            v-if="props.order.status === 'PAID'"
            @click="emit('ship')"
            :disabled="props.submitting"
          >
            {{ props.pending ? '发货中...' : '确认发货' }}
          </button>
          <button
            v-if="props.order.status === 'SHIPPED'"
            class="secondary-btn"
            @click="emit('updateLogistics', 'DELIVERED')"
            :disabled="props.submitting"
          >
            设为已签收
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type InventoryOrderItem = {
  productId: number
  productName: string
  quantity: number
}

type InventoryOrder = {
  id: number
  orderNo: string
  status: string
  buyerId?: number
  buyerUsername?: string
  shippingCarrier?: string | null
  trackingNo?: string | null
  shippingStatus?: string | null
  items?: InventoryOrderItem[]
}

const props = defineProps<{
  order: InventoryOrder
  expanded: boolean
  selected: boolean
  submitting: boolean
  pending: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'select', checked: boolean): void
  (e: 'ship'): void
  (e: 'updateLogistics', status: string): void
}>()

function onSelectChange(event: Event) {
  const checked = (event.target as HTMLInputElement | null)?.checked ?? false
  emit('select', checked)
}

const orderName = computed(() => {
  const items = Array.isArray(props.order.items) ? props.order.items : []
  if (items.length === 0) return props.order.orderNo || '订单'
  const first = items[0]?.productName || '商品'
  return items.length > 1 ? `${first} 等 ${items.length} 件` : first
})

const logisticsLabel = computed(() => {
  if (props.order.shippingStatus === 'DELIVERED' || props.order.status === 'DELIVERED') return '已签收'
  if (props.order.shippingStatus === 'IN_TRANSIT' || props.order.status === 'SHIPPED') return '已发货'
  return '待发货'
})

const logisticsMeta = computed(() => {
  if (props.order.status === 'DELIVERED') return '订单已签收'
  if (props.order.status === 'SHIPPED') return '库存管理员已手动发货'
  return '点击发货后更新状态'
})

const shippingNote = computed(() => {
  if (props.order.status === 'DELIVERED') return '该订单已经完成签收。'
  if (props.order.status === 'SHIPPED') return '该订单已由库存管理员手动发货。'
  return '当前项目不填写承运商，点击发货后会直接更新订单状态。'
})
</script>

<style scoped>
.order-entry {
  border: 1px solid #e4efe6;
  background: #f8fcf8;
  border-radius: 16px;
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.order-entry.expanded {
  border-color: #bdd7c5;
  box-shadow: 0 12px 30px rgba(31, 122, 65, 0.1);
}

.trow {
  display: grid;
  grid-template-columns: 44px 1.2fr 0.7fr 1.1fr 0.4fr;
  gap: 10px;
  align-items: center;
  padding: 12px 10px;
  cursor: pointer;
  transition: background-color 0.18s ease;
}

.trow:hover {
  background: rgba(237, 249, 239, 0.86);
}

.trow-expanded {
  background: linear-gradient(180deg, #f2faf4 0%, #edf8f0 100%);
}

.detail-wrap {
  display: grid;
  gap: 12px;
  padding: 0 12px 14px;
  background: linear-gradient(180deg, #f4fbf6 0%, #ffffff 100%);
}

.detail-divider {
  height: 1px;
  margin: 0 -12px;
  background: linear-gradient(90deg, transparent 0%, #bfdcc7 12%, #bfdcc7 88%, transparent 100%);
}

.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
}

.detail-head h3,
.info-card h4 {
  margin: 0;
  color: #16351f;
}

.detail-panel {
  display: grid;
  gap: 14px;
  padding: 14px;
  border: 1px solid #cfe3d5;
  border-left: 4px solid #2f8f4e;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fcf8 100%);
  box-shadow:
    0 10px 26px rgba(22, 53, 31, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.detail-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #eef8f0;
  border: 1px solid #d7ebdc;
}

.detail-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 5px 10px;
  border-radius: 999px;
  background: #1f7a41;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.detail-note {
  color: #587061;
  font-size: 12px;
  line-height: 1.5;
}

.check-col {
  display: flex;
  justify-content: center;
}

.right {
  text-align: right;
}

.actions {
  display: inline-flex;
  justify-content: flex-end;
}

.name .title {
  font-weight: 800;
  color: #1f2937;
}

.sub {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
}

.meta {
  margin-top: 6px;
}

.pill {
  display: inline-flex;
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid #d8f0de;
  background: #edf9ef;
  color: #1f7a41;
  font-weight: 800;
  font-size: 12px;
}

.row-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.info-card {
  display: grid;
  gap: 6px;
  padding: 12px;
  border-radius: 12px;
  background: #fbfefb;
  border: 1px solid #dcebe0;
}

.item-list {
  display: grid;
  gap: 10px;
  margin: 2px 0;
}

.item-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fbfefb;
  border: 1px solid #dcebe0;
}

.muted-btn {
  opacity: 0.7;
}

.detail-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 780px) {
  .detail-grid,
  .trow {
    grid-template-columns: 1fr;
  }

  .right {
    text-align: left;
  }

  .actions {
    justify-content: flex-start;
  }

  .check-col {
    justify-content: flex-start;
  }

  .detail-head,
  .detail-banner {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
