import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  confirmMyOrderReceived,
  createReview,
  fetchMyOrders,
  fetchMyReviews,
  type BuyerOrder,
  type ProductReview
} from '../api'

export type OrderTab = 'all' | 'paid' | 'shipped' | 'delivered' | 'toReview' | 'reviews'

export function useOrderCenter() {
  const route = useRoute()
  const router = useRouter()

  const loading = ref(false)
  const submittingReview = ref(false)
  const error = ref('')
  const message = ref('')
  const orders = ref<BuyerOrder[]>([])
  const reviews = ref<ProductReview[]>([])
  const keyword = ref('')
  const sortBy = ref('newest')
  const activeTab = ref<OrderTab>('all')
  const focusOrderId = ref<number | null>(null)
  const confirmingOrderId = ref<number | null>(null)

  const reviewDraft = ref<{
    orderId: number
    orderNo: string
    productId: number
    productName: string
  } | null>(null)

  const reviewForm = reactive({
    rating: 5,
    content: ''
  })

  const reviewKeySet = computed(() => {
    return new Set(
      reviews.value
        .filter((item) => item.orderId)
        .map((item) => `${item.orderId}-${item.productId}`)
    )
  })

  const tabs = computed(() => [
    { key: 'all' as OrderTab, label: '全部订单', count: orders.value.length },
    {
      key: 'paid' as OrderTab,
      label: '待发货',
      count: orders.value.filter((item) => item.status === 'PAID').length
    },
    {
      key: 'shipped' as OrderTab,
      label: '运输中',
      count: orders.value.filter((item) => item.status === 'SHIPPED').length
    },
    {
      key: 'delivered' as OrderTab,
      label: '已收货',
      count: orders.value.filter((item) => item.status === 'DELIVERED').length
    },
    {
      key: 'toReview' as OrderTab,
      label: '待评价',
      count: orders.value.filter((item) => reviewableItems(item).length > 0).length
    },
    { key: 'reviews' as OrderTab, label: '我的评价', count: reviews.value.length }
  ])

  const activeTitle = computed(() => {
    const map: Record<OrderTab, string> = {
      all: '全部订单',
      paid: '待发货订单',
      shipped: '运输中订单',
      delivered: '已收货订单',
      toReview: '待评价订单',
      reviews: '我的评价'
    }
    return map[activeTab.value]
  })

  const filteredOrders = computed(() => {
    let list = orders.value
    if (activeTab.value === 'paid') list = list.filter((item) => item.status === 'PAID')
    if (activeTab.value === 'shipped') list = list.filter((item) => item.status === 'SHIPPED')
    if (activeTab.value === 'delivered') list = list.filter((item) => item.status === 'DELIVERED')
    if (activeTab.value === 'toReview')
      list = list.filter((item) => reviewableItems(item).length > 0)

    const search = keyword.value.toLowerCase()
    if (!search) return list
    return list.filter((order) => {
      const byOrderNo = order.orderNo.toLowerCase().includes(search)
      const byProduct = order.items.some((item) =>
        item.productName.toLowerCase().includes(search)
      )
      return byOrderNo || byProduct
    })
  })

  const sortedOrders = computed(() => {
    const list = [...filteredOrders.value]
    if (sortBy.value === 'oldest') list.reverse()
    if (sortBy.value === 'amount')
      list.sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount))
    return list
  })

  function init() {
    const focus = Number(route.query.focus)
    focusOrderId.value = Number.isFinite(focus) ? focus : null
    loadData()
  }

  async function loadData() {
    loading.value = true
    error.value = ''
    try {
      const [orderRes, reviewRes] = await Promise.allSettled([
        fetchMyOrders(),
        fetchMyReviews()
      ])
      if (orderRes.status === 'fulfilled') {
        orders.value = orderRes.value || []
      } else {
        console.error('加载订单失败', orderRes.reason)
        error.value = orderRes.reason?.response?.data?.message || '订单加载失败'
      }
      if (reviewRes.status === 'fulfilled') {
        reviews.value = reviewRes.value || []
      } else {
        console.error('加载评价失败', reviewRes.reason)
        if (!error.value) {
          error.value = reviewRes.reason?.response?.data?.message || '评价加载失败'
        }
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e?.response?.data?.message || '订单数据加载失败'
    } finally {
      loading.value = false
    }
  }

  async function confirmReceived(order: BuyerOrder) {
    if (confirmingOrderId.value) return

    confirmingOrderId.value = order.id
    message.value = ''
    error.value = ''
    try {
      const updated = await confirmMyOrderReceived(order.id)
      const target = orders.value.find((item) => item.id === order.id)
      if (target) Object.assign(target, updated)
      message.value = `订单 ${order.orderNo} 已确认收货`
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e?.response?.data?.message || '确认收货失败'
    } finally {
      confirmingOrderId.value = null
    }
  }

  function reviewableItems(order: BuyerOrder) {
    if (!['SHIPPED', 'DELIVERED'].includes(order.status)) return []
    return order.items.filter((item) => !isReviewed(order.id, item.productId))
  }

  function isReviewed(orderId: number, productId: number) {
    return reviewKeySet.value.has(`${orderId}-${productId}`)
  }

  function openReview(order: BuyerOrder, productId: number, productName: string) {
    reviewDraft.value = {
      orderId: order.id,
      orderNo: order.orderNo,
      productId,
      productName
    }
    reviewForm.rating = 5
    reviewForm.content = ''
    message.value = ''
    error.value = ''
  }

  function closeReview() {
    reviewDraft.value = null
    reviewForm.rating = 5
    reviewForm.content = ''
  }

  async function submitReview() {
    if (!reviewDraft.value) return
    if (!reviewForm.content) {
      error.value = '请填写评价内容'
      return
    }

    submittingReview.value = true
    error.value = ''
    message.value = ''

    try {
      await createReview(reviewDraft.value.orderId, {
        productId: reviewDraft.value.productId,
        rating: reviewForm.rating,
        content: reviewForm.content
      })
      message.value = '评价已提交'
      closeReview()
      await loadData()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e?.response?.data?.message || '评价提交失败'
    } finally {
      submittingReview.value = false
    }
  }

  function goProduct(productId?: number) {
    if (!productId) return
    router.push(`/products/${productId}`)
  }

  return {
    loading,
    submittingReview,
    error,
    message,
    orders,
    reviews,
    keyword,
    sortBy,
    activeTab,
    focusOrderId,
    confirmingOrderId,
    reviewDraft,
    reviewForm,
    tabs,
    activeTitle,
    filteredOrders,
    sortedOrders,
    reviewKeySet,
    init,
    loadData,
    confirmReceived,
    reviewableItems,
    isReviewed,
    openReview,
    closeReview,
    submitReview,
    goProduct
  }
}
