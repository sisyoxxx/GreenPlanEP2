<template>
  <aside class="profile-nav page-lite">
    <div class="nav-head">
      <div class="avatar-block">
        <div class="avatar clickable" role="button" tabindex="0" @click="$emit('openAvatarViewer')">
          <img v-if="avatarPreview" :src="avatarPreview" alt="avatar" />
          <span v-else>{{ (displayName.charAt(0) || 'U').toUpperCase() }}</span>
        </div>
        <div class="avatar-meta">
          <strong class="display-name">{{ displayName }}</strong>
          <span class="username">@{{ username }}</span>
        </div>
      </div>
    </div>

    <div class="nav-items">
      <button
        type="button"
        class="nav-btn"
        :class="{ active: activeTab === 'basic' }"
        @click="$emit('switchTab', 'basic')"
      >
        基本信息
      </button>
      <button
        type="button"
        class="nav-btn"
        :class="{ active: activeTab === 'addresses' }"
        @click="$emit('switchTab', 'addresses')"
      >
        收货地址
      </button>
    </div>

    <div class="nav-links">
      <p class="nav-section-title">快捷入口</p>
      <button type="button" class="nav-link-btn" :class="{ active: quickPanel === 'cart' }" @click="$emit('openQuickPanel', 'cart')">🛒 购物车</button>
      <button type="button" class="nav-link-btn" :class="{ active: quickPanel === 'orders' }" @click="$emit('openQuickPanel', 'orders')">📦 订单</button>
      <button type="button" class="nav-link-btn" :class="{ active: quickPanel === 'records' }" @click="$emit('openQuickPanel', 'records')">🪴 种植记录</button>
      <button type="button" class="nav-link-btn" :class="{ active: quickPanel === 'favorites' }" @click="$emit('openQuickPanel', 'favorites')">⭐ 我的收藏</button>
    </div>

    <div class="nav-foot">
      <button type="button" class="secondary-btn" @click="$emit('reload')" :disabled="loadingProfile || savingProfile">
        {{ loadingProfile ? '刷新中...' : '刷新' }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  avatarPreview: string
  displayName: string
  username: string
  activeTab: 'basic' | 'addresses'
  quickPanel: string
  loadingProfile: boolean
  savingProfile: boolean
}>()

defineEmits<{
  (e: 'switchTab', tab: 'basic' | 'addresses'): void
  (e: 'openQuickPanel', panel: 'cart' | 'orders' | 'records' | 'favorites'): void
  (e: 'openAvatarViewer'): void
  (e: 'reload'): void
}>()
</script>

<style scoped>
.profile-nav {
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.nav-head {
  display: grid;
  gap: 10px;
}

.avatar-block {
  display: flex;
  gap: 12px;
  align-items: center;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  border: 2px solid #cfe9d7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #1f7a41;
  font-weight: 900;
}

.avatar.clickable {
  cursor: pointer;
}

.avatar.clickable:hover {
  border-color: rgba(31, 122, 65, 0.38);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-meta {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.display-name {
  color: #16351f;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.username {
  color: #6b7280;
  font-size: 12px;
}

.nav-items {
  display: grid;
  gap: 12px;
}

.nav-links {
  display: grid;
  gap: 10px;
}

.nav-section-title {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav-link-btn {
  text-align: left;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid #e3ece5;
  background: linear-gradient(135deg, #ffffff, #fbfefb);
  color: #1f2937;
  font-weight: 800;
  cursor: pointer;
}

.nav-link-btn:hover {
  border-color: rgba(31, 122, 65, 0.26);
  background: linear-gradient(135deg, #f7fcf8, #ffffff);
  color: #1f7a41;
}

.nav-link-btn.active {
  border-color: rgba(31, 122, 65, 0.26);
  background: linear-gradient(135deg, #edf9ef, #ffffff);
  color: #1f7a41;
}

.nav-btn {
  text-align: left;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid #e3ece5;
  background: #ffffff;
  color: #1f2937;
  font-weight: 700;
  cursor: pointer;
}

.nav-btn:hover {
  border-color: #cfe9d7;
  background: #f6fbf7;
}

.nav-btn.active {
  background: linear-gradient(135deg, #edf9ef, #ffffff);
  border-color: rgba(31, 122, 65, 0.26);
  color: #1f7a41;
}

.nav-foot {
  display: grid;
  gap: 10px;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.profile-nav::-webkit-scrollbar {
  width: 8px;
}

.profile-nav::-webkit-scrollbar-thumb {
  background: #d2e3d6;
  border-radius: 999px;
}

@media (max-width: 900px) {
  .profile-nav {
    overflow: visible;
    padding-right: 0;
  }
}
</style>
