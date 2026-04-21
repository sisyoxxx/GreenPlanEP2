import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../../core/auth/useAuthStore';
import AppLayout from '../../../layouts/AppLayout.vue';
import { normalizeBuyerCategory } from '../categoryConfig';
import { useBuyerCartStore } from '../stores/useBuyerCartStore';
import { createOrder, fetchProduct, fetchProductReviews } from '../api';
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const cartStore = useBuyerCartStore();
const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const message = ref('');
const product = ref(null);
const reviews = ref([]);
const quantity = ref(1);
const showPayDialog = ref(false);
const maxPurchase = computed(() => {
    if (!product.value?.onlineStock)
        return 1;
    return Math.max(1, product.value.onlineStock);
});
const payQuantity = computed(() => Math.max(1, Math.min(maxPurchase.value, Number(quantity.value) || 1)));
const averageRating = computed(() => {
    if (reviews.value.length === 0)
        return 0;
    const total = reviews.value.reduce((sum, item) => sum + item.rating, 0);
    return total / reviews.value.length;
});
const averageRatingText = computed(() => (averageRating.value > 0 ? averageRating.value.toFixed(1) : '暂无评分'));
const averageStars = computed(() => renderStars(Math.round(averageRating.value || 0)));
const displayCategory = computed(() => normalizeBuyerCategory(product.value?.category));
const productThumbText = computed(() => product.value?.name || '商品');
function hasDisplayImage(url) {
    if (!url)
        return false;
    return /^https?:\/\//i.test(url);
}
onMounted(async () => {
    const id = Number(route.params.id);
    if (!Number.isFinite(id)) {
        loading.value = false;
        error.value = '无效的商品 ID';
        return;
    }
    try {
        const [productDetail, productReviews] = await Promise.all([fetchProduct(id), fetchProductReviews(id)]);
        product.value = productDetail;
        reviews.value = productReviews;
        quantity.value = 1;
        cartStore.syncProduct(productDetail);
    }
    catch (err) {
        error.value = err?.response?.data?.message || '加载商品失败';
    }
    finally {
        loading.value = false;
    }
});
function ensureBuyer(actionText) {
    if (!auth.isLoggedIn || auth.role !== 'BUYER') {
        message.value = `${actionText}前请先登录买家账户。`;
        router.push('/login');
        return false;
    }
    return true;
}
function openPayDialog() {
    if (!product.value)
        return;
    if (!ensureBuyer('购买'))
        return;
    showPayDialog.value = true;
}
function closePayDialog() {
    showPayDialog.value = false;
}
async function confirmPay() {
    if (!product.value)
        return;
    submitting.value = true;
    message.value = '';
    try {
        const res = await createOrder([{ productId: product.value.id, quantity: payQuantity.value }]);
        message.value = `订单已生成：${res.data.orderNo}`;
        product.value = await fetchProduct(product.value.id);
        if (product.value)
            cartStore.syncProduct(product.value);
        closePayDialog();
        router.push(`/orders?focus=${res.data.id}`);
    }
    catch (err) {
        message.value = err?.response?.data?.message || '下单失败';
    }
    finally {
        submitting.value = false;
    }
}
function addToCart() {
    if (!product.value)
        return;
    if (!ensureBuyer('加入购物车'))
        return;
    cartStore.addItem(product.value, payQuantity.value);
    message.value = `${product.value.name} 已加入购物车。`;
}
function renderStars(rating) {
    const safe = Math.max(0, Math.min(5, rating));
    return `${'★'.repeat(safe)}${'☆'.repeat(5 - safe)}`;
}
function formatPrice(price) {
    return Number(price).toFixed(2);
}
function formatDateTime(value) {
    if (!value)
        return '刚刚';
    return value.replace('T', ' ').slice(0, 16);
}
function goProducts() {
    router.push('/products');
}
function goCart() {
    router.push('/cart');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['detail-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-field']} */ ;
/** @type {__VLS_StyleScopedClasses['review-summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-score']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-score']} */ ;
/** @type {__VLS_StyleScopedClasses['review-head']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-dialog-head']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-dialog-head']} */ ;
/** @type {__VLS_StyleScopedClasses['product-detail-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['review-list']} */ ;
/** @type {__VLS_StyleScopedClasses['review-summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-score']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppLayout, typeof AppLayout, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppLayout, new AppLayout({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-lite state-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-lite state-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "muted" },
    });
    (__VLS_ctx.error);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goProducts) },
    });
}
else if (__VLS_ctx.product) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "product-detail-shell page-lite" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-cover" },
    });
    if (__VLS_ctx.hasDisplayImage(__VLS_ctx.product.imageUrl)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ class: "product-image detail-image" },
            src: (__VLS_ctx.product.imageUrl),
            alt: (__VLS_ctx.product.name),
            loading: "lazy",
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "product-thumb detail-thumb" },
        });
        (__VLS_ctx.productThumbText);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-tags" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-tag" },
    });
    (__VLS_ctx.displayCategory);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-tag subtle" },
    });
    (__VLS_ctx.product.plantingMonth || '全年可种');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-tag subtle" },
    });
    (__VLS_ctx.product.suitableRegion || '通用地区');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    (__VLS_ctx.product.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "rating-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "rating-stars" },
    });
    (__VLS_ctx.averageStars);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "rating-meta" },
    });
    (__VLS_ctx.averageRatingText);
    (__VLS_ctx.reviews.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "detail-price" },
    });
    (__VLS_ctx.formatPrice(__VLS_ctx.product.price));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "hero-subtitle" },
    });
    (__VLS_ctx.product.description);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-extra-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.product.onlineStock);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.product.sku);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "purchase-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "qty-field" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        min: "1",
        max: (__VLS_ctx.maxPurchase),
    });
    (__VLS_ctx.quantity);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.openPayDialog) },
        disabled: (__VLS_ctx.submitting || __VLS_ctx.product.onlineStock <= 0),
    });
    (__VLS_ctx.submitting ? '下单中...' : __VLS_ctx.product.onlineStock > 0 ? '立即购买' : '库存不足');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.addToCart) },
        ...{ class: "secondary-btn" },
        disabled: (__VLS_ctx.product.onlineStock <= 0),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goCart) },
        ...{ class: "secondary-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goProducts) },
        ...{ class: "secondary-btn" },
    });
    if (__VLS_ctx.message) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "message" },
        });
        (__VLS_ctx.message);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "reviews-shell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-lite review-summary-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "muted" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-score" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.averageRatingText);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.reviews.length);
    if (__VLS_ctx.reviews.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "page-lite state-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "muted" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "review-list" },
        });
        for (const [review] of __VLS_getVForSourceType((__VLS_ctx.reviews))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                key: (review.id),
                ...{ class: "page-lite review-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "review-head" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (review.buyerUsername);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "review-time" },
            });
            (__VLS_ctx.formatDateTime(review.createdAt));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "review-stars" },
            });
            (__VLS_ctx.renderStars(review.rating));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "review-content" },
            });
            (review.content);
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-lite state-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "muted" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goProducts) },
    });
}
if (__VLS_ctx.showPayDialog && __VLS_ctx.product) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closePayDialog) },
        ...{ class: "pay-dialog-mask" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pay-dialog page-lite" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pay-dialog-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closePayDialog) },
        ...{ class: "close-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pay-dialog-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pay-line" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.product.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pay-line" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.payQuantity);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pay-line" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: "pay-amount" },
    });
    (__VLS_ctx.formatPrice(__VLS_ctx.product.price * __VLS_ctx.payQuantity));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pay-note" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pay-dialog-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closePayDialog) },
        ...{ class: "secondary-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.confirmPay) },
        disabled: (__VLS_ctx.submitting),
    });
    (__VLS_ctx.submitting ? '处理中...' : '确认支付');
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['state-card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['state-card']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['product-detail-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['product-image']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-image']} */ ;
/** @type {__VLS_StyleScopedClasses['product-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['subtle']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['subtle']} */ ;
/** @type {__VLS_StyleScopedClasses['rating-row']} */ ;
/** @type {__VLS_StyleScopedClasses['rating-stars']} */ ;
/** @type {__VLS_StyleScopedClasses['rating-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-price']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['product-extra-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['purchase-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-field']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['reviews-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['review-summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-score']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['state-card']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['review-list']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['review-card']} */ ;
/** @type {__VLS_StyleScopedClasses['review-head']} */ ;
/** @type {__VLS_StyleScopedClasses['review-time']} */ ;
/** @type {__VLS_StyleScopedClasses['review-stars']} */ ;
/** @type {__VLS_StyleScopedClasses['review-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['state-card']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-dialog-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-dialog-head']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-dialog-body']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-line']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-line']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-line']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-amount']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-note']} */ ;
/** @type {__VLS_StyleScopedClasses['pay-dialog-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppLayout: AppLayout,
            loading: loading,
            submitting: submitting,
            error: error,
            message: message,
            product: product,
            reviews: reviews,
            quantity: quantity,
            showPayDialog: showPayDialog,
            maxPurchase: maxPurchase,
            payQuantity: payQuantity,
            averageRatingText: averageRatingText,
            averageStars: averageStars,
            displayCategory: displayCategory,
            productThumbText: productThumbText,
            hasDisplayImage: hasDisplayImage,
            openPayDialog: openPayDialog,
            closePayDialog: closePayDialog,
            confirmPay: confirmPay,
            addToCart: addToCart,
            renderStars: renderStars,
            formatPrice: formatPrice,
            formatDateTime: formatDateTime,
            goProducts: goProducts,
            goCart: goCart,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
