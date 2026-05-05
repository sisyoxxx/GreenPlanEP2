<template>
  <section class="page-lite form-card">
    <h3>{{ isEdit ? '编辑商品' : '新增商品' }}</h3>
    <div class="form-grid">
      <label>
        <span>商品名称</span>
        <input v-model.trim="localForm.name" type="text" placeholder="请输入商品名称" />
      </label>
      <label>
        <span>SKU</span>
        <input v-model.trim="localForm.sku" type="text" placeholder="如：GP-SEED-001" />
      </label>
      <label>
        <span>分类</span>
        <select v-model="localForm.category">
          <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <label>
        <span>品种</span>
        <input v-model.trim="localForm.variety" type="text" placeholder="如：樱桃番茄" />
      </label>
      <label>
        <span>产地</span>
        <input v-model.trim="localForm.origin" type="text" placeholder="如：山东寿光" />
      </label>
      <label>
        <span>发芽率(%)</span>
        <input v-model.number="localForm.germinationRate" type="number" min="0" max="100" step="0.01" />
      </label>
      <label>
        <span>价格</span>
        <input v-model.number="localForm.price" type="number" min="0.01" step="0.01" />
      </label>
      <label>
        <span>库存</span>
        <input v-model.number="localForm.initialStock" type="number" min="0" />
      </label>
      <label>
        <span>种植月份</span>
        <input v-model.trim="localForm.plantingMonth" type="text" placeholder="如：3-6月" />
      </label>
      <label>
        <span>适宜地区</span>
        <input v-model.trim="localForm.suitableRegion" type="text" placeholder="如：华东/华南" />
      </label>
      <label class="full-span">
        <span>图片地址</span>
        <input v-model.trim="localForm.imageUrl" type="text" placeholder="https://..." />
      </label>
      <label class="full-span">
        <span>商品描述</span>
        <textarea v-model.trim="localForm.description" rows="4" placeholder="请输入商品描述"></textarea>
      </label>
    </div>

    <div class="form-actions">
      <button :disabled="submitting" @click="$emit('submit', { ...localForm })">{{ submitting ? '保存中...' : isEdit ? '保存修改' : '创建商品' }}</button>
      <button class="secondary-btn" :disabled="submitting" @click="$emit('cancel')">取消</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

interface ProductFormData {
  sku: string
  name: string
  description: string
  price: number
  category: string
  variety: string
  plantingMonth: string
  suitableRegion: string
  origin: string
  germinationRate: number
  imageUrl: string
  initialStock: number
}

const props = defineProps<{
  form: ProductFormData
  isEdit: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', value: ProductFormData): void
  (e: 'cancel'): void
  (e: 'update:form', value: ProductFormData): void
}>()

const categoryOptions = ['蔬菜种子', '花卉种子', '香草种子', '营养肥料', '园艺工具', '多肉植物', '其他']

const localForm = reactive<ProductFormData>({ ...props.form })

watch(
  () => props.form,
  (newVal) => {
    Object.assign(localForm, newVal)
  },
  { deep: true }
)

watch(
  localForm,
  () => {
    emit('update:form', { ...localForm })
  },
  { deep: true }
)
</script>

<style scoped>
.form-card {
  display: grid;
  gap: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

label {
  display: grid;
  gap: 6px;
}

label span {
  font-size: 12px;
  color: #4b5563;
  font-weight: 700;
}

.full-span {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 1280px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
