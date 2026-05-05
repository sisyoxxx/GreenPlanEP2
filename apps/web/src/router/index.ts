import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../core/auth/useAuthStore'
import { hasPermission, type Permission } from '../core/auth/permissions'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../domains/buyer/views/LoginView.vue') },
  { path: '/', name: 'Home', component: () => import('../domains/buyer/views/BuyerHomeView.vue') },
  { path: '/profile', name: 'Profile', component: () => import('../domains/buyer/views/ProfileView.vue'), meta: { requiresAuth: true, permission: 'BUYER_ONLY' as Permission } },
  { path: '/favorites', name: 'Favorites', component: () => import('../domains/buyer/views/FavoritesView.vue'), meta: { requiresAuth: true, permission: 'BUYER_ONLY' as Permission } },
  { path: '/products', name: 'Products', component: () => import('../domains/buyer/views/ProductsView.vue') },
  { path: '/products/:id', name: 'ProductDetail', component: () => import('../domains/buyer/views/ProductDetailView.vue') },
  { path: '/cart', name: 'Cart', component: () => import('../domains/buyer/views/CartView.vue'), meta: { requiresAuth: true, permission: 'BUYER_ONLY' as Permission } },
  { path: '/orders', name: 'Orders', component: () => import('../domains/buyer/views/OrdersView.vue'), meta: { requiresAuth: true, permission: 'BUYER_ONLY' as Permission } },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('../domains/buyer/views/ForgotPasswordView.vue') },
  { path: '/tutorial', name: 'Tutorial', component: () => import('../domains/buyer/views/TutorialView.vue') },
  { path: '/tutorial/:id', name: 'TutorialDetail', component: () => import('../domains/buyer/views/TutorialDetailView.vue') },
  { path: '/planting-records', name: 'PlantingRecords', component: () => import('../domains/buyer/views/PlantingRecordsView.vue'), meta: { requiresAuth: true, permission: 'BUYER_ONLY' as Permission } },
  { path: '/community', name: 'Community', component: () => import('../domains/buyer/views/CommunityView.vue') },
  { path: '/community/posts/:id', name: 'CommunityPostDetail', component: () => import('../domains/buyer/views/CommunityPostDetailView.vue') },

  { path: '/admin/dashboard', name: 'AdminDashboard', component: () => import('../domains/admin/views/AdminDashboardView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/orders', name: 'AdminOrders', component: () => import('../domains/admin/views/AdminOrdersView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/orders/:id', name: 'AdminOrderDetail', component: () => import('../domains/admin/views/AdminOrderDetailView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/announcements', name: 'AdminAnnouncements', component: () => import('../domains/admin/views/AdminAnnouncementsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/products', name: 'AdminProducts', component: () => import('../domains/admin/views/AdminProductsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/tutorials', name: 'AdminTutorials', component: () => import('../domains/admin/views/AdminTutorialsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/reports/sales', name: 'AdminReports', component: () => import('../domains/admin/views/AdminReportsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/audit/reviews', name: 'AdminReviews', component: () => import('../domains/admin/views/AdminReviewsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/audit/posts', name: 'AdminPostAudits', component: () => import('../domains/admin/views/AdminPostAuditsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/audit/reports', name: 'AdminReportAudits', component: () => import('../domains/admin/views/AdminReportAuditsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/promotions', name: 'AdminPromotions', component: () => import('../domains/admin/views/AdminPromotionsView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/community', name: 'AdminCommunity', component: () => import('../domains/admin/views/AdminCommunityView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },
  { path: '/admin/profile', name: 'AdminProfile', component: () => import('../domains/admin/views/AdminProfileView.vue'), meta: { requiresAuth: true, permission: 'ADMIN_ONLY' as Permission } },

  { path: '/inventory/dashboard', name: 'InventoryDashboard', component: () => import('../domains/inventory/views/InventoryDashboardView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/procurement', name: 'InventoryProcurement', component: () => import('../domains/inventory/views/InventoryProcurementView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/orders', name: 'InventoryOrders', component: () => import('../domains/inventory/views/InventoryOrdersView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/items', name: 'InventoryItems', component: () => import('../domains/inventory/views/InventoryItemsView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/warnings', name: 'InventoryWarnings', component: () => import('../domains/inventory/views/InventoryWarningsView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/inbound', name: 'InventoryInbound', component: () => import('../domains/inventory/views/InventoryInboundView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/movements', name: 'InventoryMovements', component: () => import('../domains/inventory/views/InventoryMovementsView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },
  { path: '/inventory/profile', name: 'InventoryProfile', component: () => import('../domains/inventory/views/InventoryProfileView.vue'), meta: { requiresAuth: true, permission: 'INVENTORY_ONLY' as Permission } },

  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../domains/buyer/views/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
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
