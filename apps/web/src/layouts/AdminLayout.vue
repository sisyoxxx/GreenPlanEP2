<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="admin-brand">GreenPlanEP2 管理后台</div>
      <div class="admin-header-right">
        <span class="admin-username">{{ auth.user?.username || '管理员' }}</span>
        <div class="admin-avatar-wrap" @mouseenter="onEnter" @mouseleave="onLeave">
          <div class="admin-avatar">
            <img v-if="auth.user?.avatarDataUrl" :src="auth.user.avatarDataUrl" alt="avatar" />
            <span v-else>{{ auth.user?.username?.charAt(0) || 'A' }}</span>
          </div>
          <div v-if="showDropdown" class="admin-dropdown">
            <div class="admin-dropdown-name">{{ auth.user?.username }}</div>
            <div class="admin-dropdown-divider"></div>
            <button class="admin-dropdown-item" @click="logout">退出登录</button>
          </div>
        </div>
      </div>
    </header>

    <div class="admin-body">
      <aside class="admin-sidebar">
        <nav class="admin-nav">
          <div v-for="item in navItems" :key="item.path">
            <div v-if="item.submenu" class="admin-nav-group">
              <button :class="['admin-nav-item', { active: isActive(item.path) }]" @click="toggleSubmenu(item.path)">
                <span class="admin-nav-icon">{{ item.icon }}</span>
                {{ item.label }}
                <span class="admin-nav-arrow">{{ expandedSubmenu === item.path ? '▾' : '▸' }}</span>
              </button>
              <div v-if="expandedSubmenu === item.path" class="admin-submenu">
                <RouterLink
                  v-for="sub in item.submenu"
                  :key="sub.label"
                  :to="sub.to ?? sub.path"
                  :class="['admin-submenu-item', { active: isActive(sub.path, typeof sub.to === 'object' ? sub.to.query : undefined) }]"
                >
                  {{ sub.label }}
                </RouterLink>
              </div>
            </div>

            <RouterLink v-else :to="item.path" :class="['admin-nav-item', { active: isActive(item.path) }]">
              <span class="admin-nav-icon">{{ item.icon }}</span>
              {{ item.label }}
            </RouterLink>
          </div>
        </nav>
      </aside>

      <main class="admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../core/auth/useAuthStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const showDropdown = ref(false)
const expandedSubmenu = ref<string | null>(null)
let hideTimer: ReturnType<typeof setTimeout> | null = null

interface NavItem {
  path: string
  icon?: string
  label: string
  to?: string | { path: string; query?: Record<string, string> }
  submenu?: NavSubItem[]
}

interface NavSubItem {
  path: string
  label: string
  to?: string | { path: string; query?: Record<string, string> }
}

const navItems: NavItem[] = [
  { path: '/admin/profile', icon: '👤', label: '个人信息' },
  { path: '/admin/dashboard', icon: '📊', label: '工作台' },
  { path: '/admin/reports/sales', icon: '📈', label: '销量分析' },
  { path: '/admin/orders', icon: '🧾', label: '订单管理' },
  { path: '/admin/products', icon: '🪴', label: '商品管理' },
  { path: '/admin/tutorials', icon: '📚', label: '教程管理' },
  {
    path: '/admin/audit',
    icon: '🔍',
    label: '审核',
    submenu: [
      { path: '/admin/audit/reviews', label: '评价审核' },
      { path: '/admin/audit/posts', label: '帖子审核' },
      { path: '/admin/audit/reports', label: '举报审核' }
    ]
  },
  { path: '/admin/announcements', icon: '📣', label: '公告管理' },
  {
    path: '/admin/promotions',
    icon: '🎆',
    label: '促销管理',
    submenu: [
      { path: '/admin/promotions', label: '首页轮播', to: { path: '/admin/promotions', query: { type: 'home' } } },
      { path: '/admin/promotions', label: '商品页轮播', to: { path: '/admin/promotions', query: { type: 'product' } } }
    ]
  },
  { path: '/admin/community', icon: '💬', label: '社区管理' }
]

function isActive(path: string, query?: Record<string, string>) {
  if (query) {
    const queryMatch = Object.entries(query).every(
      ([key, value]) => route.query[key] === value
    )
    return route.path === path && queryMatch
  }
  return route.path === path
}

function toggleSubmenu(path: string) {
  expandedSubmenu.value = expandedSubmenu.value === path ? null : path
}

function onEnter() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  showDropdown.value = true
}

function onLeave() {
  hideTimer = setTimeout(() => {
    showDropdown.value = false
  }, 150)
}

function logout() {
  showDropdown.value = false
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f3f7f3;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #80ab64;
  color: #fff;
}

.admin-brand {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.3px;
}

.admin-header-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.admin-username {
  font-size: 14px;
  font-weight: 600;
  color: #f7fff4;
}

.admin-avatar-wrap {
  position: relative;
  cursor: pointer;
}

.admin-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.admin-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.admin-avatar span {
  width: 100%;
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.admin-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  padding-top: 8px;
  z-index: 100;
}

.admin-dropdown-name {
  padding: 8px 12px 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  background: #fff;
  border-radius: 8px 8px 0 0;
}

.admin-dropdown-divider {
  height: 1px;
  background: #f0f0f0;
}

.admin-dropdown-item {
  display: block;
  width: 100%;
  padding: 7px 12px;
  border: none;
  background: #fff;
  color: #dc2626;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  border-radius: 0 0 8px 8px;
}

.admin-body {
  display: flex;
  min-height: calc(100vh - 58px);
}

.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e6ece7;
  padding: 14px 10px;
  position: sticky;
  top: 0;
  height: calc(100vh - 58px);
  overflow-y: auto;
}

.admin-nav {
  display: grid;
  gap: 2px;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  text-decoration: none;
  transition: background 0.15s;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.admin-nav-item:hover {
  background: #f0f7f1;
}

.admin-nav-item.active {
  background: #e6f4ea;
  color: #1f7a41;
  font-weight: 600;
}

.admin-nav-icon {
  font-size: 16px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.admin-nav-arrow {
  margin-left: auto;
  font-size: 12px;
}

.admin-nav-group {
  display: grid;
  gap: 0;
}

.admin-submenu {
  display: grid;
  gap: 0;
  background: #f9fdfb;
  border-radius: 6px;
  margin: 2px 8px;
  overflow: hidden;
}

.admin-submenu-item {
  display: block;
  padding: 8px 14px 8px 40px;
  color: #6b7280;
  font-size: 13px;
  text-decoration: none;
  transition: background 0.15s;
}

.admin-submenu-item:hover {
  background: #f0f7f1;
  color: #374151;
}

.admin-submenu-item.active {
  background: #e6f4ea;
  color: #1f7a41;
  font-weight: 600;
}

.admin-content {
  flex: 1;
  padding: 20px 32px;
  min-width: 0;
}
</style>
