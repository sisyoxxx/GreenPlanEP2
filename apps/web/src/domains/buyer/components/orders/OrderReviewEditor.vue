<template>
  <section class="page-lite review-editor">
    <div class="review-editor-head">
      <div>
        <h3>提交评价</h3>
        <p class="muted">{{ productName }} · 订单 {{ orderNo }}</p>
      </div>
      <button class="secondary-btn" @click="emit('cancel')">关闭</button>
    </div>

    <label class="field">
      <span>评分</span>
      <select
        :value="rating"
        @change="emit('update:rating', Number(($event.target as HTMLSelectElement).value))"
      >
        <option :value="5">5 星</option>
        <option :value="4">4 星</option>
        <option :value="3">3 星</option>
        <option :value="2">2 星</option>
        <option :value="1">1 星</option>
      </select>
    </label>

    <label class="field">
      <span>评价内容</span>
      <textarea
        :value="content"
        rows="4"
        placeholder="写下你的真实体验"
        @input="emit('update:content', ($event.target as HTMLTextAreaElement).value)"
      />
    </label>

    <div class="card-actions">
      <button :disabled="submitting" @click="emit('submit')">
        {{ submitting ? '提交中...' : '提交评价' }}
      </button>
      <button class="secondary-btn" @click="emit('cancel')">取消</button>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  productName: string
  orderNo: string
  rating: number
  content: string
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: []
  cancel: []
  'update:rating': [value: number]
  'update:content': [value: string]
}>()
</script>

<style scoped>
.review-editor {
  display: grid;
  gap: 14px;
}

.review-editor-head {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.review-editor-head h3 {
  margin: 0;
  color: #16351f;
}

.field {
  display: grid;
  gap: 6px;
}

.field span {
  color: #4b5563;
  font-size: 13px;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.muted {
  color: #6b7280;
  font-size: 13px;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}
</style>
