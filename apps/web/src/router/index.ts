import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../core/auth/useAuthStore'
import { hasPermission, type Permission } from '../core/auth/permissions'

const routes = [
  { path: '/login', component: () => import('../domains/buyer/views/LoginView.vue') },
  { path: '/', component: () => import('../domains/buyer/views/BuyerHomeView.vue') },
  { path: '/profile', component: () => import('../domains/buyer/views/ProfileView.vue'), meta: { requiresAuth: true, permission: 'BUYER_ONLY' as Permission } },
  { path: '/favorites', component: () => import('../domains/buyer/views/FavoritesView.vue'), meta: { requiresAuth: true, permission: 'BUYER_ONLY' as Permission } },
  { path: '/products', component: () => import('../domains/buyer/views/ProductsView.vue') },
  { path: '/products/:id', component: () => import('../domains/buyer/views/ProductDetailView.vue'), meta: { requiresAuth: true, permission: 'BUYER_ONLY' as Permission } },
  { path: '/cart', component: () => import('../domains/buyer/views/CartView.vue'), meta: { requiresAuth: true, permission: 'BUYER_ONLY' as Permission } },
  { path: '/orders', component: () => import('../domains/buyer/views/OrdersView.vue'), meta: { requiresAuth: true, permission: 'BUYER_ONLY' as Permission } },
  { path: '/forgot-password', component: () => import('../domains/buyer/views/ForgotPasswordView.vue') },
  { path: '/tutorial', component: () => import('../domains/buyer/views/TutorialView.vue') },
  { path: '/tutorial/:id', component: () => import('../domains/buyer/views/TutorialDetailView.vue') },
  { path: '/planting-records', component: () => import('../domains/buyer/views/PlantingRecordsView.vue'), meta: { requiresAuth: true, permission: 'BUYER_ONLY' as Permission } },
  { path: '/community', component: () => import('../domains/buyer/views/CommunityView.vue') },
  { path: '/community/posts/:id', component: () => import('../domains/buyer/views/CommunityPostDetailView.vue') },

  { path: '/admin/dashboard', component: () => import('../domains/admin/views/AdminDashboardView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/orders', component: () => import('../domains/admin/views/AdminOrdersView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/orders/:id', component: () => import('../domains/admin/views/AdminOrderDetailView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/announcements', component: () => import('../domains/admin/views/AdminAnnouncementsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/products', component: () => import('../domains/admin/views/AdminProductsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/tutorials', component: () => import('../domains/admin/views/AdminTutorialsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/reports/sales', component: () => import('../domains/admin/views/AdminReportsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/audit/reviews', component: () => import('../domains/admin/views/AdminReviewsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/audit/posts', component: () => import('../domains/admin/views/AdminPostAuditsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/audit/reports', component: () => import('../domains/admin/views/AdminReportAuditsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/promotions', component: () => import('../domains/admin/views/AdminPromotionsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/promotion-posts', component: () => import('../domains/admin/views/AdminPromotionPostsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/community', component: () => import('../domains/admin/views/AdminCommunityView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/profile', component: () => import('../domains/admin/views/AdminProfileView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },

  { path: '/inventory/dashboard', component: () => import('../domains/inventory/views/InventoryDashboardView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/procurement', component: () => import('../domains/inventory/views/InventoryProcurementView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/orders', component: () => import('../domains/inventory/views/InventoryOrdersView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/items', component: () => import('../domains/inventory/views/InventoryItemsView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/warnings', component: () => import('../domains/inventory/views/InventoryWarningsView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/inbound', component: () => import('../domains/inventory/views/InventoryInboundView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/movements', component: () => import('../domains/inventory/views/InventoryMovementsView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/profile', component: () => import('../domains/inventory/views/InventoryProfileView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return '/login'
  }
  const required = to.meta.permission as Permission | undefined
  if (!hasPermission(auth.role, required)) {
    if (auth.role === 'ADMIN') return '/admin/dashboard'
    if (auth.role === 'INVENTORY_MANAGER') return '/inventory/dashboard'
    if (auth.role === 'BUYER') return '/'
    return '/login'
  }
  return true
})

export default router
