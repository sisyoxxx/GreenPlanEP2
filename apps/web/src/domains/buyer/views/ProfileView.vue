<template>
  <AppLayout>
    <div class="profile-page">
      <ProfileSidebar
        :avatar-preview="avatarPreview"
        :display-name="displayName"
        :username="auth.user?.username || '-'"
        :active-tab="activeTab"
        :quick-panel="quickPanel"
        :loading-profile="loadingProfile"
        :saving-profile="savingProfile"
        @switch-tab="activeTab = $event"
        @open-quick-panel="openQuickPanel"
        @open-avatar-viewer="openAvatarViewer"
        @reload="reloadAll"
      />

      <section class="profile-content">
        <div v-if="loadingProfile" class="page-lite content-card">
          <h1>个人中心</h1>
          <p class="desc">加载中...</p>
        </div>

        <div v-else class="content-stack">
          <ProfileStatsCard
            :cart-unique-count="cartStore.uniqueCount"
            :cart-item-count="cartStore.itemCount"
            :favorite-tutorial-count="favoriteTutorialCount"
            :favorite-post-count="favoritePostCount"
            :address-count="addressCount"
            :username="auth.user?.username || '-'"
          />

          <ProfileQuickPanel
            :panel="quickPanel"
            :orders="quickOrders"
            :plants="quickPlants"
            :cart-items="cartStore.items.slice(0, 6)"
            :fav-tutorial-count="favoriteTutorialCount"
            :fav-post-count="favoritePostCount"
            :loading="quickOrdersLoading"
            :error="quickOrdersError"
            @close="quickPanel = 'none'"
            @refresh-orders="loadQuickOrders(true)"
          />

          <ProfileBasicForm
            v-if="activeTab === 'basic'"
            :form="form"
            :avatar-preview="avatarPreview"
            :display-name="displayName"
            :saving="savingProfile"
            :tip="profileTip"
            @save="saveProfile"
            @avatar-change="onAvatarChange"
            @open-avatar-viewer="openAvatarViewer"
          />

          <ProfileAddressManager v-else ref="addressManagerRef" />
        </div>
      </section>
    </div>

    <AvatarViewer
      :open="avatarViewerOpen"
      :src="avatarPreview"
      :display-name="displayName"
      @close="closeAvatarViewer"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AppLayout from '../../../layouts/AppLayout.vue'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import { useBuyerCartStore } from '../stores/useBuyerCartStore'
import { useBuyerFavoritesStore } from '../stores/useBuyerFavoritesStore'
import {
  fetchMyOrders,
  fetchMyProfile,
  updateMyProfile,
  type BuyerOrder,
  type MyProfile
} from '../api'
import AvatarViewer from '../components/profile/AvatarViewer.vue'
import ProfileAddressManager from '../components/profile/ProfileAddressManager.vue'
import ProfileStatsCard from '../components/profile/ProfileStatsCard.vue'
import ProfileQuickPanel from '../components/profile/ProfileQuickPanel.vue'
import ProfileBasicForm from '../components/profile/ProfileBasicForm.vue'
import ProfileSidebar from '../components/profile/ProfileSidebar.vue'

const auth = useAuthStore()
const cartStore = useBuyerCartStore()
const favoritesStore = useBuyerFavoritesStore()

type QuickPanel = 'none' | 'orders' | 'records' | 'cart' | 'favorites'

const activeTab = ref<'basic' | 'addresses'>('basic')
const quickPanel = ref<QuickPanel>('none')

const loadingProfile = ref(false)
const savingProfile = ref(false)
const profileTip = ref('')

const profile = ref<MyProfile | null>(null)

const form = reactive({
  nickname: '',
  gender: '',
  phone: '',
  avatarDataUrl: '' as string | null
})

const avatarPreview = computed(() => form.avatarDataUrl || '')
const displayName = computed(() => (form.nickname || '').trim() || auth.user?.username || '用户')
const favoriteTutorialCount = computed(() => favoritesStore.tutorialIds.length)
const favoritePostCount = computed(() => favoritesStore.posts.length)

const quickOrders = ref<BuyerOrder[]>([])
const quickOrdersLoading = ref(false)
const quickOrdersLoaded = ref(false)
const quickOrdersError = ref('')

const quickPlants = [
  { name: '番茄', icon: '🍅', status: '育苗中' },
  { name: '薄荷', icon: '🌿', status: '生长旺盛' },
  { name: '草莓', icon: '🍓', status: '开花中' },
  { name: '罗勒', icon: '🌱', status: '已定植' }
]

const avatarViewerOpen = ref(false)
const addressManagerRef = ref<InstanceType<typeof ProfileAddressManager> | null>(null)
const addressCount = computed(() => addressManagerRef.value?.addresses?.length ?? 0)

onMounted(async () => {
  await loadProfile()
})

async function reloadAll() {
  profileTip.value = ''
  quickOrdersLoaded.value = false
  await loadProfile()
  await addressManagerRef.value?.loadAddresses()
  if (quickPanel.value === 'orders') {
    await loadQuickOrders(true)
  }
}

async function loadProfile() {
  if (loadingProfile.value) return
  loadingProfile.value = true
  profileTip.value = ''
  try {
    const data = await fetchMyProfile()
    profile.value = data
    form.nickname = data.nickname || ''
    form.gender = data.gender || ''
    form.phone = data.phone || ''
    form.avatarDataUrl = data.avatarDataUrl || ''
    auth.syncUserProfile({
      nickname: data.nickname || null,
      avatarDataUrl: data.avatarDataUrl || null
    })
  } catch (err: unknown) {
    const e = err as any
    const status = e?.response?.status
    if (status === 404) {
      profileTip.value = '后端未启动个人资料接口，请重启后端服务后再试'
    } else {
      profileTip.value = e?.response?.data?.message || '个人信息加载失败'
    }
  } finally {
    loadingProfile.value = false
  }
}

async function saveProfile() {
  if (savingProfile.value) return
  savingProfile.value = true
  profileTip.value = ''
  try {
    const saved = await updateMyProfile({
      nickname: (form.nickname || '').trim() || null,
      gender: (form.gender || '').trim() || null,
      phone: (form.phone || '').trim() || null,
      avatarDataUrl: form.avatarDataUrl || null
    })
    profile.value = saved
    auth.syncUserProfile({
      nickname: saved.nickname || null,
      avatarDataUrl: saved.avatarDataUrl || null
    })
    profileTip.value = '已保存'
  } catch (err: unknown) {
    const e = err as any
    const status = e?.response?.status
    if (status === 404) {
      profileTip.value = '保存失败：后端未启动个人资料接口，请重启后端服务'
    } else {
      profileTip.value = e?.response?.data?.message || '保存失败'
    }
  } finally {
    savingProfile.value = false
  }
}

function clearAvatar() {
  form.avatarDataUrl = ''
  profileTip.value = '已移除头像，点击保存生效'
}

async function onAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return

  profileTip.value = ''

  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result || '')
    form.avatarDataUrl = result
    profileTip.value = '头像已选择，点击保存生效'
  }
  reader.onerror = () => {
    profileTip.value = '头像读取失败，请重试'
  }
  reader.readAsDataURL(file)
}

function openAvatarViewer() {
  avatarViewerOpen.value = true
}

function closeAvatarViewer() {
  avatarViewerOpen.value = false
}

function openQuickPanel(panel: Exclude<QuickPanel, 'none'>) {
  quickPanel.value = quickPanel.value === panel ? 'none' : panel
  if (quickPanel.value === 'orders') {
    loadQuickOrders()
  }
}

async function loadQuickOrders(force = false) {
  if (quickOrdersLoading.value) return
  if (!force && quickOrdersLoaded.value) return

  quickOrdersLoading.value = true
  quickOrdersError.value = ''
  try {
    quickOrders.value = await fetchMyOrders()
    quickOrdersLoaded.value = true
  } catch (err: unknown) {
    const e = err as any
    quickOrdersError.value = e?.response?.data?.message || '订单加载失败'
  } finally {
    quickOrdersLoading.value = false
  }
}
</script>

<style scoped>
.profile-page {
  display: grid;
  grid-template-columns: minmax(240px, 280px) minmax(0, 1fr);
  gap: 18px;
  align-items: stretch;
  height: calc(100vh - 108px);
  overflow: hidden;
}

.profile-content {
  display: grid;
  gap: 16px;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.content-stack {
  display: grid;
  gap: 16px;
}

.content-card {
  display: grid;
  gap: 16px;
}

h1 {
  margin: 0;
}

.desc {
  margin: 6px 0 0;
  color: #6b7280;
  line-height: 1.7;
}

.profile-content::-webkit-scrollbar {
  width: 8px;
}

.profile-content::-webkit-scrollbar-thumb {
  background: #d2e3d6;
  border-radius: 999px;
}

@media (max-width: 1020px) {
  .profile-page {
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 14px;
  }
}

@media (max-width: 900px) {
  .profile-page {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }

  .profile-content {
    overflow: visible;
    padding-right: 0;
  }
}
</style>
