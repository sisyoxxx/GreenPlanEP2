<template>
  <AppLayout>
    <div class="profile-page">
      <aside class="profile-nav page-lite">
        <div class="nav-head">
          <div class="avatar-block">
            <div class="avatar clickable" role="button" tabindex="0" @click="openAvatarViewer">
              <img v-if="avatarPreview" :src="avatarPreview" alt="avatar" />
              <span v-else>{{ (displayName.charAt(0) || 'U').toUpperCase() }}</span>
            </div>
            <div class="avatar-meta">
              <strong class="display-name">{{ displayName }}</strong>
              <span class="username">@{{ auth.user?.username || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="nav-items">
          <button
            type="button"
            class="nav-btn"
            :class="{ active: activeTab === 'basic' }"
            @click="activeTab = 'basic'"
          >
            基本信息
          </button>
          <button
            type="button"
            class="nav-btn"
            :class="{ active: activeTab === 'addresses' }"
            @click="activeTab = 'addresses'"
          >
            收货地址
          </button>
        </div>

        <div class="nav-links">
          <p class="nav-section-title">快捷入口</p>
          <button type="button" class="nav-link-btn" :class="{ active: quickPanel === 'cart' }" @click="openQuickPanel('cart')">🛒 购物车</button>
          <button type="button" class="nav-link-btn" :class="{ active: quickPanel === 'orders' }" @click="openQuickPanel('orders')">📦 订单</button>
          <button type="button" class="nav-link-btn" :class="{ active: quickPanel === 'records' }" @click="openQuickPanel('records')">🪴 种植记录</button>
          <button type="button" class="nav-link-btn" :class="{ active: quickPanel === 'favorites' }" @click="openQuickPanel('favorites')">⭐ 我的收藏</button>
        </div>

        <div class="nav-foot">
          <button type="button" class="secondary-btn" @click="reloadAll" :disabled="loadingProfile || savingProfile">
            {{ loadingProfile ? '刷新中...' : '刷新' }}
          </button>
        </div>
      </aside>

      <section class="profile-content">
        <div v-if="loadingProfile" class="page-lite content-card">
          <h1>个人中心</h1>
          <p class="desc">加载中...</p>
        </div>

        <div v-else class="content-stack">
          <section class="page-lite stats-card">
            <div class="stats-head">
              <div>
                <h1 class="stats-title">我的概览</h1>
                <p class="desc">轻量统计，用来展示你的全流程进度。</p>
              </div>
              <div class="head-actions">
                <button type="button" class="secondary-btn" @click="router.push('/products')">去选购</button>
                <button type="button" class="secondary-btn" @click="router.push('/community')">去社区</button>
              </div>
            </div>

            <div class="stats-grid">
              <div class="stat-tile">
                <span class="stat-label">购物车</span>
                <strong class="stat-value">{{ cartStore.uniqueCount }} 种 · {{ cartStore.itemCount }} 件</strong>
              </div>
              <div class="stat-tile">
                <span class="stat-label">收藏</span>
                <strong class="stat-value">教程 {{ favoriteTutorialCount }} · 帖子 {{ favoritePostCount }}</strong>
              </div>
              <div class="stat-tile">
                <span class="stat-label">收货地址</span>
                <strong class="stat-value">{{ addresses.length }} 个</strong>
              </div>
              <div class="stat-tile">
                <span class="stat-label">账号</span>
                <strong class="stat-value">@{{ auth.user?.username || '-' }}</strong>
              </div>
            </div>
          </section>

          <section v-if="quickPanel !== 'none'" class="page-lite quick-preview">
            <div class="content-head">
              <div>
                <h1>{{ quickPanelTitle }}</h1>
                <p class="desc">{{ quickPanelDesc }}</p>
              </div>
              <div class="head-actions">
                <button type="button" class="secondary-btn" @click="quickPanel = 'none'">收起</button>
              </div>
            </div>

            <template v-if="quickPanel === 'orders'">
              <div class="quick-search-row">
                <input v-model.trim="quickOrderKeyword" type="text" placeholder="搜索订单号或商品名" />
                <button type="button" class="secondary-btn" @click="loadQuickOrders(true)" :disabled="quickOrdersLoading">
                  {{ quickOrdersLoading ? '加载中...' : '刷新' }}
                </button>
              </div>
              <div v-if="quickOrdersLoading && quickOrders.length === 0" class="empty">订单加载中...</div>
              <div v-else-if="quickOrdersError" class="empty">{{ quickOrdersError }}</div>
              <div v-else-if="quickFilteredOrders.length === 0" class="empty">没有匹配订单</div>
              <div v-else class="quick-order-list">
                <article
                  v-for="order in quickFilteredOrders"
                  :key="order.id"
                  class="quick-order-item"
                  @click="goOrderDetail(order)"
                >
                  <div>
                    <strong>{{ order.orderNo }}</strong>
                    <p class="sub">{{ formatDateTime(order.createdAt) }}</p>
                  </div>
                  <span :class="['quick-status', `status-${order.status}`]">{{ statusLabel(order.status) }}</span>
                </article>
              </div>
            </template>

            <template v-else-if="quickPanel === 'records'">
              <div class="quick-plant-list">
                <article v-for="plant in quickPlants" :key="plant.name" class="quick-plant-item">
                  <div>
                    <strong>{{ plant.icon }} {{ plant.name }}</strong>
                    <p class="sub">状态：{{ plant.status }}</p>
                  </div>
                </article>
              </div>
            </template>

            <template v-else-if="quickPanel === 'cart'">
              <div v-if="cartStore.items.length === 0" class="empty">购物车暂无商品</div>
              <div v-else class="quick-cart-list">
                <article v-for="item in cartStore.items.slice(0, 6)" :key="item.id" class="quick-cart-item">
                  <div>
                    <strong>{{ item.name }}</strong>
                    <p class="sub">x{{ item.quantity }} · 单价 ¥{{ item.price.toFixed(2) }}</p>
                  </div>
                </article>
              </div>
            </template>

            <template v-else>
              <div class="quick-fav-summary">
                <div class="stat-tile">
                  <span class="stat-label">教程收藏</span>
                  <strong class="stat-value">{{ favoriteTutorialCount }}</strong>
                </div>
                <div class="stat-tile">
                  <span class="stat-label">帖子收藏</span>
                  <strong class="stat-value">{{ favoritePostCount }}</strong>
                </div>
              </div>
            </template>
          </section>

          <section v-if="activeTab === 'basic'" class="page-lite content-card">
            <div class="content-head">
              <div>
                <h1>个人信息</h1>
                <p class="desc">昵称未填写时，将默认使用账号名作为显示名称。</p>
              </div>
              <div class="head-actions">
                <button type="button" @click="saveProfile" :disabled="savingProfile">
                  {{ savingProfile ? '保存中...' : '保存' }}
                </button>
              </div>
            </div>

            <div class="form-grid">
              <div class="field span-2">
                <label>头像</label>
                <div class="avatar-editor">
                  <div class="avatar large clickable" role="button" tabindex="0" @click="openAvatarViewer">
                    <img v-if="avatarPreview" :src="avatarPreview" alt="avatar" />
                    <span v-else>{{ (displayName.charAt(0) || 'U').toUpperCase() }}</span>
                  </div>
                  <div class="avatar-actions">
                    <div class="btn-row">
                      <label class="file-btn secondary-btn">
                        修改头像
                        <input type="file" accept="image/*" @change="onAvatarChange" />
                      </label>
                    </div>
                    <p class="hint">单击头像可查看大图。支持 JPG/PNG/GIF，建议使用小尺寸图片（会以 base64 保存到数据库）。</p>
                  </div>
                </div>
              </div>

              <div class="field">
                <label>昵称</label>
                <input v-model="form.nickname" type="text" placeholder="未填写则默认使用账号名" />
              </div>

              <div class="field">
                <label>性别</label>
                <select v-model="form.gender">
                  <option value="">保密</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>

              <div class="field span-2">
                <label>手机号</label>
                <input v-model="form.phone" type="text" placeholder="例如 13800000000" />
              </div>
            </div>

            <p v-if="profileTip" class="tip">{{ profileTip }}</p>
          </section>

          <section v-else class="page-lite content-card">
            <div class="content-head">
              <div>
                <h1>收货地址</h1>
                <p class="desc">支持多个地址，默认地址会在列表顶部展示。</p>
              </div>
              <div class="head-actions">
                <button type="button" class="secondary-btn" @click="loadAddresses" :disabled="loadingAddresses">
                  {{ loadingAddresses ? '刷新中...' : '刷新地址' }}
                </button>
              </div>
            </div>

            <div class="address-add">
              <label>新增地址</label>
              <textarea
                v-model="newAddressText"
                rows="3"
                placeholder="填写收货地址（可包含省市区、街道门牌等）"
              />
              <div class="address-add-actions">
                <label class="check">
                  <input v-model="newAddressDefault" type="checkbox" />
                  设为默认
                </label>
                <div class="btn-row">
                  <button type="button" @click="addAddress" :disabled="addingAddress || !newAddressText.trim()">
                    {{ addingAddress ? '新增中...' : '新增地址' }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="addresses.length === 0" class="empty">
              暂无收货地址，先新增一个吧。
            </div>

            <div v-else class="address-list">
              <article v-for="addr in addresses" :key="addr.id" class="address-card">
                <div class="address-main">
                  <div class="address-tags">
                    <span v-if="addr.isDefault" class="tag">默认</span>
                    <span class="sub">#{{ addr.id }}</span>
                  </div>

                  <div v-if="editingId !== addr.id" class="address-text">
                    {{ addr.addressText }}
                  </div>

                  <div v-else class="address-edit">
                    <textarea v-model="editAddressText" rows="3" />
                    <label class="check">
                      <input v-model="editAddressDefault" type="checkbox" />
                      设为默认
                    </label>
                  </div>
                </div>

                <div class="address-actions">
                  <template v-if="editingId !== addr.id">
                    <button type="button" class="secondary-btn" @click="startEdit(addr)">编辑</button>
                    <button
                      type="button"
                      class="danger-btn"
                      @click="removeAddress(addr.id)"
                      :disabled="deletingId === addr.id"
                    >
                      {{ deletingId === addr.id ? '删除中...' : '删除' }}
                    </button>
                  </template>
                  <template v-else>
                    <button type="button" @click="saveEdit(addr.id)" :disabled="savingEdit">
                      {{ savingEdit ? '保存中...' : '保存' }}
                    </button>
                    <button type="button" class="secondary-btn" @click="cancelEdit">取消</button>
                  </template>
                </div>
              </article>
            </div>

            <p v-if="addressTip" class="tip">{{ addressTip }}</p>
          </section>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <div v-if="avatarViewerOpen" class="avatar-viewer" @click.self="closeAvatarViewer">
        <div class="avatar-viewer-card page-lite">
          <div class="viewer-head">
            <strong>头像预览</strong>
            <button type="button" class="secondary-btn" @click="closeAvatarViewer">关闭</button>
          </div>
          <div class="viewer-body">
            <img v-if="avatarPreview" :src="avatarPreview" alt="avatar large" />
            <div v-else class="viewer-placeholder">{{ (displayName.charAt(0) || 'U').toUpperCase() }}</div>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import { useBuyerCartStore } from '../stores/useBuyerCartStore'
import { useBuyerFavoritesStore } from '../stores/useBuyerFavoritesStore'
import {
  createMyAddress,
  deleteMyAddress,
  fetchMyAddresses,
  fetchMyOrders,
  fetchMyProfile,
  updateMyAddress,
  updateMyProfile,
  type BuyerOrder,
  type MyAddress,
  type MyProfile
} from '../api'

const router = useRouter()
const auth = useAuthStore()
const cartStore = useBuyerCartStore()
const favoritesStore = useBuyerFavoritesStore()

type QuickPanel = 'none' | 'orders' | 'records' | 'cart' | 'favorites'

const activeTab = ref<'basic' | 'addresses'>('basic')
const quickPanel = ref<QuickPanel>('none')

const loadingProfile = ref(false)
const savingProfile = ref(false)
const profileTip = ref('')

const loadingAddresses = ref(false)
const addingAddress = ref(false)
const addressTip = ref('')

const profile = ref<MyProfile | null>(null)
const addresses = ref<MyAddress[]>([])

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

const quickOrderKeyword = ref('')
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

const quickPanelTitle = computed(() => {
  if (quickPanel.value === 'orders') return '快捷订单'
  if (quickPanel.value === 'records') return '种植记录预览'
  if (quickPanel.value === 'cart') return '购物车预览'
  if (quickPanel.value === 'favorites') return '收藏预览'
  return ''
})

const quickPanelDesc = computed(() => {
  if (quickPanel.value === 'orders') return '在这里快速搜索订单，点击后再进入订单详情页。'
  if (quickPanel.value === 'records') return '只读展示你当前在种的植物进度。'
  if (quickPanel.value === 'cart') return '显示最近加入购物车的商品摘要。'
  if (quickPanel.value === 'favorites') return '展示教程与帖子收藏数量。'
  return ''
})

const quickFilteredOrders = computed(() => {
  const keyword = quickOrderKeyword.value.trim().toLowerCase()
  if (!keyword) return quickOrders.value
  return quickOrders.value.filter((order) =>
    order.orderNo.toLowerCase().includes(keyword) ||
    order.items.some((item) => item.productName.toLowerCase().includes(keyword))
  )
})

const newAddressText = ref('')
const newAddressDefault = ref(false)

const editingId = ref<number | null>(null)
const editAddressText = ref('')
const editAddressDefault = ref(false)
const savingEdit = ref(false)
const deletingId = ref<number | null>(null)
const avatarViewerOpen = ref(false)

onMounted(async () => {
  await loadProfile()
  await loadAddresses()
})

watch(activeTab, async (tab) => {
  if (tab === 'addresses' && addresses.value.length === 0) {
    await loadAddresses()
  }
})

async function reloadAll() {
  profileTip.value = ''
  addressTip.value = ''
  quickOrdersLoaded.value = false
  await Promise.all([loadProfile(), loadAddresses()])
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
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 404) {
      profileTip.value = '后端未启动个人资料接口，请重启后端服务后再试'
    } else {
      profileTip.value = err?.response?.data?.message || '个人信息加载失败'
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
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 404) {
      profileTip.value = '保存失败：后端未启动个人资料接口，请重启后端服务'
    } else {
      profileTip.value = err?.response?.data?.message || '保存失败'
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
  } catch (err: any) {
    quickOrdersError.value = err?.response?.data?.message || '订单加载失败'
  } finally {
    quickOrdersLoading.value = false
  }
}

function goOrderDetail(order: BuyerOrder) {
  router.push(`/orders?focus=${order.id}`)
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: '待支付',
    PAID: '待发货',
    SHIPPED: '运输中',
    DELIVERED: '已签收'
  }
  return map[status] || status
}

function formatDateTime(value: string | null) {
  if (!value) return '时间未记录'
  return value.replace('T', ' ').slice(0, 16)
}

async function loadAddresses() {
  if (loadingAddresses.value) return
  loadingAddresses.value = true
  addressTip.value = ''
  try {
    addresses.value = await fetchMyAddresses()
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 404) {
      addressTip.value = '后端未启动地址接口，请重启后端服务后再试'
    } else {
      addressTip.value = err?.response?.data?.message || '地址加载失败'
    }
  } finally {
    loadingAddresses.value = false
  }
}

async function addAddress() {
  const text = newAddressText.value.trim()
  if (!text || addingAddress.value) return
  addingAddress.value = true
  addressTip.value = ''
  try {
    await createMyAddress({ addressText: text, isDefault: newAddressDefault.value })
    newAddressText.value = ''
    newAddressDefault.value = false
    await loadAddresses()
    addressTip.value = '已新增地址'
  } catch (err: any) {
    addressTip.value = err?.response?.data?.message || '新增失败'
  } finally {
    addingAddress.value = false
  }
}

function startEdit(addr: MyAddress) {
  editingId.value = addr.id
  editAddressText.value = addr.addressText
  editAddressDefault.value = !!addr.isDefault
  addressTip.value = ''
}

function cancelEdit() {
  editingId.value = null
  editAddressText.value = ''
  editAddressDefault.value = false
}

async function saveEdit(id: number) {
  if (savingEdit.value) return
  const text = editAddressText.value.trim()
  if (!text) {
    addressTip.value = '地址内容不能为空'
    return
  }

  savingEdit.value = true
  addressTip.value = ''
  try {
    await updateMyAddress(id, { addressText: text, isDefault: editAddressDefault.value })
    await loadAddresses()
    cancelEdit()
    addressTip.value = '已保存'
  } catch (err: any) {
    addressTip.value = err?.response?.data?.message || '保存失败'
  } finally {
    savingEdit.value = false
  }
}

async function removeAddress(id: number) {
  if (deletingId.value) return
  deletingId.value = id
  addressTip.value = ''
  try {
    await deleteMyAddress(id)
    await loadAddresses()
    if (editingId.value === id) cancelEdit()
    addressTip.value = '已删除'
  } catch (err: any) {
    addressTip.value = err?.response?.data?.message || '删除失败'
  } finally {
    deletingId.value = null
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

.avatar.large {
  width: 76px;
  height: 76px;
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

.quick-preview {
  display: grid;
  gap: 14px;
  border: 1px solid #dcebdd;
  background: linear-gradient(135deg, #f7fcf8, #ffffff);
}

.quick-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.quick-order-list,
.quick-plant-list,
.quick-cart-list {
  display: grid;
  gap: 10px;
}

.quick-order-item,
.quick-plant-item,
.quick-cart-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e5efe7;
  background: #fff;
}

.quick-order-item {
  cursor: pointer;
}

.quick-order-item:hover {
  border-color: rgba(31, 122, 65, 0.28);
  background: #f8fcf8;
}

.quick-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.quick-status.status-PENDING {
  background: #fff5d6;
  color: #946200;
}

.quick-status.status-PAID {
  background: #eef8f0;
  color: #1f7a41;
}

.quick-status.status-SHIPPED {
  background: #e7eefc;
  color: #2f5fb8;
}

.quick-status.status-DELIVERED {
  background: #dff5e4;
  color: #166534;
}

.quick-fav-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stats-card {
  display: grid;
  gap: 14px;
  border: 1px solid #dcebdd;
  background: linear-gradient(135deg, #f7fcf8, #ffffff);
}

.stats-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.stats-title {
  margin: 0;
  font-size: 18px;
  color: #16351f;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stat-tile {
  border-radius: 16px;
  border: 1px solid #e5efe7;
  background: #fbfefb;
  padding: 12px;
  display: grid;
  gap: 6px;
  min-width: 0;
}

.stat-label {
  color: #1f7a41;
  font-weight: 900;
  font-size: 12px;
}

.stat-value {
  color: #16351f;
  font-weight: 900;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-card {
  display: grid;
  gap: 16px;
}

.content-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.head-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-row {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.file-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 800;
  cursor: pointer;
}

.file-btn input[type="file"] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

h1 {
  margin: 0;
}

.desc {
  margin: 6px 0 0;
  color: #6b7280;
  line-height: 1.7;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 14px;
}

.field {
  display: grid;
  gap: 6px;
}

.field span,
.field label {
  color: #1f7a41;
  font-weight: 800;
  font-size: 13px;
}

.field input,
.field select,
.field textarea {
  width: 100%;
}

.span-2 {
  grid-column: 1 / 3;
}

.avatar-editor {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.avatar-actions {
  display: grid;
  gap: 12px;
}

.hint {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.6;
}

.tip {
  margin: 0;
  color: #1f7a41;
  font-weight: 800;
}

.address-add {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8fcf8, #ffffff);
  border: 1px solid #dbeadf;
}

.address-add label {
  color: #1f7a41;
  font-weight: 900;
}

.address-add-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.check {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: #374151;
  font-weight: 700;
  font-size: 13px;
}

.empty {
  color: #9ca3af;
}

.address-list {
  display: grid;
  gap: 12px;
}

.address-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid #e5efe7;
  background: #fbfefb;
}

.address-main {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.address-tags {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  background: #1f7a41;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}

.sub {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

.address-text {
  color: #111827;
  line-height: 1.7;
  word-break: break-word;
}

.address-edit {
  display: grid;
  gap: 10px;
}

.address-actions {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.danger-btn {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #be123c;
}

.profile-nav::-webkit-scrollbar,
.profile-content::-webkit-scrollbar {
  width: 8px;
}

.profile-nav::-webkit-scrollbar-thumb,
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

  .profile-nav {
    overflow: visible;
    padding-right: 0;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .profile-content {
    overflow: visible;
    padding-right: 0;
  }
}

@media (max-width: 760px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: 1 / 2;
  }

  .content-head {
    flex-direction: column;
    align-items: stretch;
  }

  .address-card {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.avatar-viewer {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.58);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 60;
}

.avatar-viewer-card {
  width: min(560px, 100%);
  display: grid;
  gap: 12px;
  padding: 14px;
}

.viewer-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.viewer-body {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 16px;
  background: #f8fcf8;
  border: 1px solid #e4efe6;
}

.viewer-body img {
  width: 100%;
  max-height: 72vh;
  object-fit: contain;
  border-radius: 14px;
}

.viewer-placeholder {
  width: 240px;
  height: 240px;
  border-radius: 999px;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  border: 2px solid #cfe9d7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1f7a41;
  font-weight: 900;
  font-size: 84px;
}
</style>
