import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '../../../layouts/AppLayout.vue';
import { useAuthStore } from '../../../core/auth/useAuthStore';
import HomeCategorySidebar from '../components/HomeCategorySidebar.vue';
import HomeRecommendationRail from '../components/HomeRecommendationRail.vue';
import { normalizeBuyerCategory } from '../categoryConfig';
import { useBuyerCartStore } from '../stores/useBuyerCartStore';
import { fetchProducts, fetchPromotions, fetchTutorials } from '../api';
const router = useRouter();
const auth = useAuthStore();
const cartStore = useBuyerCartStore();
const products = ref([]);
const tutorials = ref([]);
const promotions = ref([]);
const message = ref('');
const topProducts = computed(() => products.value.slice(0, 6));
const topTutorials = computed(() => tutorials.value.slice(0, 6));
const homePromotions = computed(() => promotions.value.filter((item) => item.strategyType === 'home'));
const leadPromotion = computed(() => homePromotions.value[0] || null);
const heroTag = computed(() => leadPromotion.value?.title || '新人推荐 · 春播季');
const heroTitle = computed(() => '家庭种植商品与园艺灵感一站式选购');
const heroSubtitle = computed(() => {
    if (leadPromotion.value?.description)
        return leadPromotion.value.description;
    return '点击左侧分类可快速筛选商品，加入购物车后可在购物车页统一下单。';
});
const highlightLabel = computed(() => {
    if (leadPromotion.value)
        return '首页促销位';
    return topProducts.value.length > 0 ? '本周热销' : '本周精选教程';
});
const highlightTitle = computed(() => {
    if (leadPromotion.value)
        return leadPromotion.value.title;
    if (topProducts.value.length > 0)
        return topProducts.value[0]?.name || '家庭种植推荐';
    return topTutorials.value[0]?.title || '阳台种植入门教程';
});
const highlightDesc = computed(() => {
    if (leadPromotion.value?.description)
        return leadPromotion.value.description;
    if (topProducts.value.length > 0)
        return topProducts.value[0]?.description || '从分类筛选到购物车下单，流程更顺手。';
    return topTutorials.value[0]?.description || '先看教程再上手，适合新手快速入门。';
});
function formatDuration(durationMinutes) {
    return durationMinutes ? `${durationMinutes} 分钟` : '图文教程';
}
function formatPrice(value) {
    return Number(value).toFixed(2);
}
function hasDisplayImage(url) {
    if (!url)
        return false;
    return /^https?:\/\//i.test(url);
}
onMounted(async () => {
    await Promise.all([reloadProducts(), reloadTutorials(), reloadPromotions()]);
});
async function reloadProducts() {
    try {
        products.value = (await fetchProducts()) || [];
        products.value.forEach((item) => cartStore.syncProduct(item));
    }
    catch (err) {
        message.value = err?.response?.data?.message || '加载商品失败';
    }
}
async function reloadTutorials() {
    try {
        const res = await fetchTutorials();
        tutorials.value = res.tutorials || [];
    }
    catch (err) {
        if (!message.value) {
            message.value = err?.response?.data?.message || '加载教程失败';
        }
    }
}
async function reloadPromotions() {
    try {
        promotions.value = await fetchPromotions();
    }
    catch (err) {
        if (!message.value) {
            message.value = err?.response?.data?.message || '加载促销位失败';
        }
    }
}
function goProducts() {
    router.push('/products');
}
function goCommunity() {
    router.push('/community');
}
function goTutorials() {
    router.push('/tutorial');
}
function goProductDetail(id) {
    router.push(`/products/${id}`);
}
function goCart() {
    router.push('/cart');
}
function addToCart(item) {
    if (!auth.isLoggedIn || auth.role !== 'BUYER') {
        message.value = '加入购物车前请先登录买家账户。';
        router.push('/login');
        return;
    }
    cartStore.addItem(item, 1);
    message.value = `${item.name} 已加入购物车。`;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['home-center']} */ ;
/** @type {__VLS_StyleScopedClasses['home-center']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-content']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['product-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['product-cover-media']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['home-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['featured-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['home-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['home-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['home-center']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['right-sidebar']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppLayout, typeof AppLayout, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppLayout, new AppLayout({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "home-shell" },
});
/** @type {[typeof HomeCategorySidebar, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(HomeCategorySidebar, new HomeCategorySidebar({}));
const __VLS_5 = __VLS_4({}, ...__VLS_functionalComponentArgsRest(__VLS_4));
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "home-center" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-banner page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "hero-tag" },
});
(__VLS_ctx.heroTag);
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(__VLS_ctx.heroTitle);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "hero-subtitle" },
});
(__VLS_ctx.heroSubtitle);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.goProducts) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.goCommunity) },
    ...{ class: "secondary-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-highlight" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "highlight-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "highlight-label" },
});
(__VLS_ctx.highlightLabel);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "highlight-title" },
});
(__VLS_ctx.highlightTitle);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "highlight-desc" },
});
(__VLS_ctx.highlightDesc);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.topProducts.length > 0 ? '精选商品' : '教程卡片');
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.topProducts.length > 0 ? __VLS_ctx.goProducts() : __VLS_ctx.goTutorials();
        } },
    ...{ class: "secondary-btn" },
});
(__VLS_ctx.topProducts.length > 0 ? '查看全部商品' : '查看全部教程');
if (__VLS_ctx.topProducts.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "featured-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.topProducts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.topProducts.length > 0))
                        return;
                    __VLS_ctx.goProductDetail(item.id);
                } },
            key: (item.id),
            ...{ class: "featured-product page-lite" },
        });
        if (__VLS_ctx.hasDisplayImage(item.imageUrl)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ class: "product-image product-cover-media" },
                src: (item.imageUrl),
                alt: (item.name),
                loading: "lazy",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "product-thumb product-cover-media" },
            });
            (__VLS_ctx.normalizeBuyerCategory(item.category));
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "product-title" },
        });
        (item.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "product-desc" },
        });
        (item.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "product-meta" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatPrice(item.price));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.sales ?? 0);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "product-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.topProducts.length > 0))
                        return;
                    __VLS_ctx.addToCart(item);
                } },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.topProducts.length > 0))
                        return;
                    __VLS_ctx.goProductDetail(item.id);
                } },
            ...{ class: "secondary-btn" },
        });
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "featured-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.topTutorials))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (item.id),
            ...{ class: "featured-product page-lite tutorial-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "product-thumb" },
            ...{ style: ({ background: item.backgroundStyle }) },
        });
        (item.tag);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "product-title" },
        });
        (item.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "product-desc" },
        });
        (item.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "product-meta" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.difficulty || '精选');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatDuration(item.durationMinutes));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "product-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.goTutorials) },
        });
    }
}
if (!__VLS_ctx.cartStore.isEmpty) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cart-strip page-lite" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.cartStore.uniqueCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "sidebar-item-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cart-strip-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.cartStore.isEmpty))
                    return;
                __VLS_ctx.cartStore.clear();
            } },
        ...{ class: "secondary-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goCart) },
    });
}
if (__VLS_ctx.message) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "home-message" },
    });
    (__VLS_ctx.message);
}
/** @type {[typeof HomeRecommendationRail, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(HomeRecommendationRail, new HomeRecommendationRail({}));
const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['home-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['home-center']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-content']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-label']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-title']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['featured-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['featured-product']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['product-image']} */ ;
/** @type {__VLS_StyleScopedClasses['product-cover-media']} */ ;
/** @type {__VLS_StyleScopedClasses['product-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['product-cover-media']} */ ;
/** @type {__VLS_StyleScopedClasses['product-title']} */ ;
/** @type {__VLS_StyleScopedClasses['product-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['product-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['product-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['featured-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['featured-product']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['tutorial-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['product-title']} */ ;
/** @type {__VLS_StyleScopedClasses['product-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['product-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['product-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-strip-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['home-message']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppLayout: AppLayout,
            HomeCategorySidebar: HomeCategorySidebar,
            HomeRecommendationRail: HomeRecommendationRail,
            normalizeBuyerCategory: normalizeBuyerCategory,
            cartStore: cartStore,
            message: message,
            topProducts: topProducts,
            topTutorials: topTutorials,
            heroTag: heroTag,
            heroTitle: heroTitle,
            heroSubtitle: heroSubtitle,
            highlightLabel: highlightLabel,
            highlightTitle: highlightTitle,
            highlightDesc: highlightDesc,
            formatDuration: formatDuration,
            formatPrice: formatPrice,
            hasDisplayImage: hasDisplayImage,
            goProducts: goProducts,
            goCommunity: goCommunity,
            goTutorials: goTutorials,
            goProductDetail: goProductDetail,
            goCart: goCart,
            addToCart: addToCart,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
