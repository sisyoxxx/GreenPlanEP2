<template>
  <div class="admin-layout">
    <!-- 顶部导航 -->
    <header class="admin-header">
      <div class="admin-brand">GreenPlanEP2 管理后台</div>
      <nav class="admin-header-nav">
        <RouterLink to="/admin/dashboard" class="admin-header-link" active-class="admin-header-link-active">工作台</RouterLink>
        <RouterLink to="/community" class="admin-header-link" active-class="admin-header-link-active">社区</RouterLink>
      </nav>
      <div class="admin-header-right">
        <div class="admin-avatar-wrap" @mouseenter="onEnter" @mouseleave="onLeave">
          <div class="admin-avatar">{{ auth.user?.username?.charAt(0) || 'A' }}</div>
          <div v-if="showDropdown" class="admin-dropdown">
            <div class="admin-dropdown-name">{{ auth.user?.username }}</div>
            <div class="admin-dropdown-divider"></div>
            <button class="admin-dropdown-item" @click="logout">退出登录</button>
          </div>
        </div>
      </div>
    </header>

    <div class="admin-body">
      <!-- 左侧栏 -->
      <aside class="admin-sidebar">
        <nav class="admin-nav">
          <div v-for="item in navItems" :key="item.path">
            <div v-if="item.submenu" class="admin-nav-group">
              <button :class="['admin-nav-item', { active: isActive(item.path) }]" @click="toggleSubmenu(item.path)">
                <span class="admin-nav-icon">{{ item.icon }}</span>
                {{ item.label }}
                <span class="admin-nav-arrow">{{ expandedSubmenu === item.path ? '▼' : '▶' }}</span>
              </button>
              <div v-if="expandedSubmenu === item.path" class="admin-submenu">
                <RouterLink v-for="sub in item.submenu" :key="sub.path" :to="sub.path"
                  :class="['admin-submenu-item', { active: isActive(sub.path) }]">
                  {{ sub.label }}
                </RouterLink>
              </div>
            </div>
            <RouterLink v-else :to="item.path"
              :class="['admin-nav-item', { active: isActive(item.path) }]">
              <span class="admin-nav-icon">{{ item.icon }}</span>
              {{ item.label }}
            </RouterLink>
          </div>
        </nav>
      </aside>

      <!-- 主内容 -->
      <main class="admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../core/auth/useAuthStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const showDropdown = ref(false)
const expandedSubmenu = ref<string | null>(null)
let hideTimer: ReturnType<typeof setTimeout> | null = null

const navItems = [
  { path: '/admin/dashboard', icon: '📊', label: '工作台' },
  { path: '/admin/orders', icon: '📋', label: '订单管理' },
  { path: '/admin/products', icon: '📦', label: '商品管理' },
  { path: '/admin/reports/sales', icon: '📈', label: '销量分析' },
  { path: '/admin/reviews', icon: '⭐', label: '用户评价' },
  { path: '/admin/announcements', icon: '📢', label: '公告管理' },
  { path: '/admin/promotions', icon: '🎯', label: '促销管理', submenu: [
    { path: '/admin/promotions?type=home', label: '首页轮播' },
    { path: '/admin/promotions?type=product', label: '商品页轮播' }
  ] },
  { path: '/admin/promotion-posts', icon: '📝', label: '推广文章' }
]

function isActive(path: string) { return route.path === path }
function toggleSubmenu(path: string) { expandedSubmenu.value = expandedSubmenu.value === path ? null : path }
function onEnter() { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }; showDropdown.value = true }
function onLeave() { hideTimer = setTimeout(() => { showDropdown.value = false }, 150) }
function logout() { showDropdown.value = false; auth.logout(); router.push('/login') }
</script>

<style scoped>
.admin-layout { min-height: 100vh; background: #f3f7f3; }

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #80ab64;
  color: #fff;
}

.admin-brand { font-weight: 700; font-size: 16px; letter-spacing: 0.3px; }

.admin-header-nav { display: flex; gap: 20px; }
.admin-header-link { color: #fff; text-decoration: none; font-size: 14px; transition: opacity 0.15s; padding: 6px 12px; border-radius: 999px; }
.admin-header-link:hover { opacity: 0.8; }
.admin-header-link-active { background: rgba(255,255,255,0.25); font-weight: 600; }

.admin-avatar-wrap { position: relative; cursor: pointer; }

.admin-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,0.25); color: #fff;
  font-weight: 700; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(255,255,255,0.5);
}

.admin-avatar-wrap:hover .admin-avatar { background: rgba(255,255,255,0.4); }

.admin-dropdown {
  position: absolute; top: 100%; right: 0;
  padding-top: 8px; z-index: 100;
}

.admin-dropdown-name {
  padding: 8px 12px 6px; font-size: 13px; font-weight: 600; color: #1f2937;
  background: #fff; border-radius: 8px 8px 0 0;
}

.admin-dropdown-divider { height: 1px; background: #f0f0f0; }

.admin-dropdown-item {
  display: block; width: 100%; padding: 7px 12px;
  border: none; background: #fff; color: #dc2626;
  font-size: 13px; text-align: left; cursor: pointer;
  border-radius: 0 0 8px 8px;
}

.admin-dropdown-item:hover { background: #fef2f2; }

.admin-body { display: flex; min-height: calc(100vh - 58px); }

.admin-sidebar {
  width: 240px; flex-shrink: 0;
  background: #fff; border-right: 1px solid #e6ece7;
  padding: 14px 10px;
  position: sticky; top: 0; height: calc(100vh - 58px);
  overflow-y: auto;
}

.admin-nav { display: grid; gap: 2px; }

.admin-nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 8px;
  color: #374151; font-size: 14px;
  text-decoration: none; transition: background 0.15s;
  border: none; background: transparent; cursor: pointer; width: 100%; text-align: left;
}

.admin-nav-item:hover { background: #f0f7f1; }
.admin-nav-item.active { background: #e6f4ea; color: #1f7a41; font-weight: 600; }
.admin-nav-icon { font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; }
.admin-nav-arrow { margin-left: auto; font-size: 12px; }

.admin-nav-group { display: grid; gap: 0; }
.admin-submenu { display: grid; gap: 0; background: #f9fdfb; border-radius: 6px; margin: 2px 8px; overflow: hidden; }
.admin-submenu-item { display: block; padding: 8px 14px 8px 40px; color: #6b7280; font-size: 13px; text-decoration: none; transition: background 0.15s; }
.admin-submenu-item:hover { background: #f0f7f1; color: #374151; }
.admin-submenu-item.active { background: #e6f4ea; color: #1f7a41; font-weight: 600; }

.admin-content {
  flex: 1; padding: 20px 32px;
  min-width: 0;
}
</style>
