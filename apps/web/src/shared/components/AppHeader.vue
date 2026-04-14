<template>
  <header class="top-header">
    <div class="brand-wrap">
      <RouterLink to="/" class="brand">GreenPlanEP2</RouterLink>
    </div>

    <nav class="top-nav top-nav-centered">
      <RouterLink v-if="!isOnCommunity" to="/" class="nav-link" exact-active-class="nav-link-active">首页</RouterLink>
      <RouterLink v-if="!isOnCommunity" to="/products" class="nav-link" active-class="nav-link-active">商品</RouterLink>
      <RouterLink v-if="!isOnCommunity" to="/tutorial" class="nav-link" active-class="nav-link-active">教程</RouterLink>
      <RouterLink v-if="!isOnCommunity" to="/planting-records" class="nav-link" active-class="nav-link-active">日记</RouterLink>
      <RouterLink to="/community" class="nav-link" :class="{ 'nav-link-active': isOnCommunity }">社区</RouterLink>
      <RouterLink v-if="!isOnCommunity" to="/orders" class="nav-link" active-class="nav-link-active">订单</RouterLink>
      <RouterLink v-if="auth.role === 'ADMIN'" to="/admin/dashboard" class="nav-link" active-class="nav-link-active">工作台</RouterLink>
    </nav>

    <div class="user-bar-right">
      <template v-if="auth.user">
        <div class="avatar-wrap" @mouseenter="onAvatarEnter" @mouseleave="onAvatarLeave">
          <div class="user-avatar" @click="goProfile">{{ auth.user.username?.charAt(0) || 'U' }}</div>
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
import { ref, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../../core/auth/useAuthStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const showDropdown = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

const isOnCommunity = computed(() => route.path === '/community')

function onAvatarEnter() {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  showDropdown.value = true
}

function onAvatarLeave() {
  hideTimer = setTimeout(() => { showDropdown.value = false }, 150)
}

function goLogin() { router.push('/login') }
function goProfile() { showDropdown.value = false; router.push('/profile') }
function logout() { showDropdown.value = false; auth.logout(); router.push('/login') }
</script>

<style scoped>
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 28px;
  background: #80ab64;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.brand-wrap { display: flex; align-items: center; }

.brand {
  font-weight: 700;
  color: #f7fff4;
  text-decoration: none;
  letter-spacing: 0.3px;
}

.top-nav { display: flex; gap: 12px; justify-content: center; flex: 1; }

.nav-link {
  position: relative;
  color: #eef8ea;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.nav-link:hover { background: rgba(255, 255, 255, 0.18); color: #ffffff; }

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
  left: 12px; right: 12px; bottom: 4px;
  height: 2px;
  border-radius: 999px;
  background: #1f7a41;
}

.user-bar-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
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

.avatar-wrap:hover .user-avatar {
  background: rgba(255, 255, 255, 0.4);
}

.avatar-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0;
  padding-top: 8px;
  min-width: 120px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 6px 0;
  z-index: 100;
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

.dropdown-item:hover { background: #f3f8f4; color: #1f7a41; }

.dropdown-logout { color: #dc2626; }
.dropdown-logout:hover { background: #fef2f2; color: #dc2626; }

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

  .top-nav::-webkit-scrollbar { display: none; }
  .nav-link { white-space: nowrap; padding: 6px 10px; font-size: 13px; }
}
</style>
