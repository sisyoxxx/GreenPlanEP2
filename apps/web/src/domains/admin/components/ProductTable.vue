<template>
  <div>
    <div v-if="loading && items.length === 0" class="empty-state">商品加载中...</div>
    <div v-else-if="items.length === 0" class="empty-state">暂无匹配商品</div>
    <div v-else class="table-wrap">
      <table class="prod-table">
        <thead>
          <tr>
            <th class="checkbox-col">
              <input type="checkbox" :checked="isAllSelected" @change="$emit('toggleSelectAll')" />
            </th>
            <th>商品</th>
            <th>SKU</th>
            <th>分类</th>
            <th>品种</th>
            <th>产地</th>
            <th>发芽率</th>
            <th>价格</th>
            <th>库存</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td class="checkbox-col">
              <input type="checkbox" :checked="selectedIds.includes(item.id)" @change="$emit('toggleSelect', item.id)" />
            </td>
            <td>
              <div class="name-cell">
                <img v-if="item.imageUrl" :src="item.imageUrl" alt="product" />
                <div>
                  <strong>{{ item.name }}</strong>
                  <p>{{ item.description || '暂无描述' }}</p>
                </div>
              </div>
            </td>
            <td>{{ item.sku }}</td>
            <td>{{ item.category || '-' }}</td>
            <td>{{ item.variety || '-' }}</td>
            <td>{{ item.origin || '-' }}</td>
            <td>{{ Number(item.germinationRate || 0).toFixed(2) }}%</td>
            <td>¥{{ Number(item.price).toFixed(2) }}</td>
            <td>{{ item.onlineStock }}</td>
            <td>
              <span :class="['status-tag', statusClass(item.status)]">
                {{ statusText(item.status) }}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <button class="text-link" @click="$emit('edit', item)">编辑</button>
                <button class="text-link" @click="$emit('toggleStatus', item)">{{ item.status === 'PUBLISHED' ? '下架' : '上架' }}</button>
                <button class="text-link danger" @click="$emit('delete', item)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminProduct } from '../api'

defineProps<{
  items: AdminProduct[]
  loading: boolean
  selectedIds: number[]
  isAllSelected: boolean
}>()

defineEmits<{
  (e: 'edit', item: AdminProduct): void
  (e: 'delete', item: AdminProduct): void
  (e: 'toggleStatus', item: AdminProduct): void
  (e: 'preview', item: AdminProduct): void
  (e: 'toggleSelect', id: number): void
  (e: 'toggleSelectAll'): void
}>()

function statusClass(status: string) {
  if (status === 'PUBLISHED') return 'on'
  if (status === 'UNPUBLISHED') return 'off'
  return 'deleted'
}

function statusText(status: string) {
  if (status === 'PUBLISHED') return '在售'
  if (status === 'UNPUBLISHED') return '下架'
  return '已删除'
}
</script>

<style scoped>
.table-wrap {
  overflow-x: auto;
}

.prod-table {
  width: 100%;
  border-collapse: collapse;
}

.prod-table th,
.prod-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #edf1ee;
  text-align: left;
  vertical-align: top;
}

.prod-table th {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

.name-cell {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  gap: 10px;
}

.name-cell img {
  width: 54px;
  height: 54px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid #e3ece5;
}

.name-cell strong {
  color: #1f2937;
}

.name-cell p {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 12px;
}

.status-tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-tag.on {
  background: #e8f6eb;
  color: #1f7a41;
}

.status-tag.off {
  background: #f3f4f6;
  color: #6b7280;
}

.status-tag.deleted {
  background: #fee2e2;
  color: #991b1b;
}

.text-link {
  border: none;
  background: transparent;
  color: #1f7a41;
  padding: 0;
  font-size: 13px;
  cursor: pointer;
}

.text-link.danger {
  color: #dc2626;
}

.row-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.checkbox-col {
  width: 40px;
  text-align: center;
}

.empty-state {
  color: #6b7280;
  text-align: center;
  padding: 24px 0;
}
</style>
