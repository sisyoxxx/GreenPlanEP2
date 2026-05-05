<template>
  <AppLayout>
    <div class="not-found-shell">
      <div class="not-found-card page-lite">
        <h1>404</h1>
        <p>页面不存在或已被移除</p>
        <button @click="goHome">返回首页</button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'

const router = useRouter()
function goHome() {
  router.push('/')
}
</script>

<style scoped>
.not-found-shell {
  width: 100%;
  min-height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.not-found-card {
  text-align: center;
  display: grid;
  gap: 16px;
}

.not-found-card h1 {
  font-size: 72px;
  color: #1f7a41;
  margin: 0;
}

.not-found-card p {
  color: #6b7280;
  margin: 0;
}
</style>
