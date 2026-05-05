<template>
  <div class="app-layout">
    <AppHeader v-if="showHeader" />
    <main class="app-main" :class="{ 'app-main-no-header': !showHeader }">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '../shared/components/AppHeader.vue'

const route = useRoute()

const publicHeaderRoutes = ['/', '/login', '/profile', '/favorites', '/products', '/tutorial', '/planting-records', '/community', '/orders', '/cart']
const showHeader = computed(() =>
  publicHeaderRoutes.includes(route.path) ||
  route.path.startsWith('/products/') ||
  route.path.startsWith('/tutorial/') ||
  route.path.startsWith('/community/posts/') ||
  route.path.startsWith('/admin') ||
  route.path.startsWith('/inventory')
)
</script>

<style scoped>
.app-main {
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 12px;
}

.app-main-no-header {
  max-width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1500px) {
  .app-main {
    max-width: 1380px;
    padding: 14px 10px;
  }
}

@media (max-width: 1280px) {
  .app-main {
    max-width: 1220px;
    padding: 14px 10px;
  }
}
</style>
