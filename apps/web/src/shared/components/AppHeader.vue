<template>
  <header class="top-header">
    <div class="brand-wrap">
      <RouterLink to="/" class="brand">GreenPlanEP2</RouterLink>
    </div>

    <nav v-if="showTopNav" class="top-nav">
      <RouterLink to="/" class="nav-link" exact-active-class="nav-link-active">首页</RouterLink>
      <RouterLink to="/products" class="nav-link" active-class="nav-link-active">商品</RouterLink>
      <RouterLink to="/tutorial" class="nav-link" active-class="nav-link-active">教程</RouterLink>
      <RouterLink to="/planting-records" class="nav-link" active-class="nav-link-active">日志</RouterLink>
      <RouterLink to="/community" class="nav-link" active-class="nav-link-active">社区</RouterLink>
      <RouterLink to="/orders" class="nav-link" active-class="nav-link-active">订单</RouterLink>
      <RouterLink
        v-if="auth.role === 'ADMIN'"
        to="/admin/dashboard"
        class="nav-link"
        active-class="nav-link-active"
      >
        管理台
      </RouterLink>
      <RouterLink
        v-if="auth.role === 'INVENTORY_MANAGER'"
        to="/inventory/dashboard"
        class="nav-link"
        active-class="nav-link-active"
      >
        库存
      </RouterLink>
    </nav>

    <div class="user-bar-right">
      <button
        v-if="showTopNav"
        type="button"
        class="cart-entry"
        @click="goCart"
      >
        <span class="cart-icon" aria-hidden="true">🛒</span>
        <span class="cart-label">购物车</span>
        <span v-if="cartCount > 0" class="cart-badge">{{ cartBadgeText }}</span>
      </button>

      <template v-if="auth.user">
        <span v-if="showRoleUsername" class="header-username">{{ auth.user.username }}</span>
        <div class="avatar-wrap" @mouseenter="onAvatarEnter" @mouseleave="onAvatarLeave">
          <div class="user-avatar" @click="goProfile">
            <img v-if="auth.user.avatarDataUrl" :src="auth.user.avatarDataUrl" alt="avatar" />
            <span v-else>{{ auth.user.username?.charAt(0) || 'U' }}</span>
          </div>
          <div v-if="showDropdown" class="avatar-dropdown">
            <div class="dropdown-username">{{ auth.user.username }}</div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="goProfile">个人中心</button>
            <button class="dropdown-item dropdown-logout" @click="logout">退出登录</button>
          </div>
        </div>
      </template>
      <template v-else>
        <button @click="goLogin">登录</button>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../core/auth/useAuthStore'
import { useBuyerCartStore } from '../../domains/buyer/stores/useBuyerCartStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const cartStore = useBuyerCartStore()

const showDropdown = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

const showTopNav = computed(() => !route.path.startsWith('/admin') && !route.path.startsWith('/inventory'))
const showRoleUsername = computed(() => auth.role === 'INVENTORY_MANAGER' && route.path.startsWith('/inventory'))
const cartCount = computed(() => cartStore.itemCount)
const cartBadgeText = computed(() => (cartCount.value > 99 ? '...' : String(cartCount.value)))

function onAvatarEnter() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  showDropdown.value = true
}

function onAvatarLeave() {
  hideTimer = setTimeout(() => {
    showDropdown.value = false
  }, 150)
}

function goLogin() {
  router.push('/login')
}

function goProfile() {
  showDropdown.value = false
  router.push('/profile')
}

function goCart() {
  router.push('/cart')
}

function logout() {
  showDropdown.value = false
  auth.logout()
  cartStore.clear()
  router.push('/login')
}
</script>

<style scoped>
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 14px 28px;
  background: #80ab64;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.brand-wrap {
  display: flex;
  align-items: center;
}

.brand {
  font-weight: 700;
  color: #f7fff4;
  text-decoration: none;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.top-nav {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex: 1;
  min-width: 0;
}

.nav-link {
  position: relative;
  color: #eef8ea;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 999px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.nav-link-active,
.nav-link.router-link-active {
  color: #1f5c34;
  background: rgba(255, 255, 255, 0.72);
  font-weight: 700;
}

.nav-link-active::after,
.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 4px;
  height: 2px;
  border-radius: 999px;
  background: #1f7a41;
}

.user-bar-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.header-username {
  font-size: 14px;
  font-weight: 600;
  color: #f7fff4;
}

.cart-entry {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.cart-entry:hover {
  background: rgba(255, 255, 255, 0.24);
}

.cart-label {
  font-size: 14px;
  font-weight: 600;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.9);
  line-height: 1;
}

.avatar-wrap {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: background 0.2s;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.user-avatar span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.avatar-wrap:hover .user-avatar {
  background: rgba(255, 255, 255, 0.4);
}

.avatar-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 140px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 6px 0;
  z-index: 100;
  margin-top: 8px;
}

.dropdown-username {
  padding: 8px 12px 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.dropdown-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 2px 12px;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 7px 12px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: #f3f8f4;
  color: #1f7a41;
}

.dropdown-logout {
  color: #dc2626;
}

.dropdown-logout:hover {
  background: #fef2f2;
  color: #dc2626;
}

@media (max-width: 1280px) {
  .top-header {
    gap: 10px;
    padding: 10px 18px;
  }

  .top-nav {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .top-nav::-webkit-scrollbar {
    display: none;
  }

  .nav-link {
    padding: 6px 10px;
    font-size: 13px;
  }

  .cart-label {
    display: none;
  }
}

@media (max-width: 760px) {
  .top-header {
    padding: 10px 12px;
  }

  .user-bar-right {
    gap: 6px;
  }
}
</style>
