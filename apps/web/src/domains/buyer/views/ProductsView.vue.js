import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { useAuthStore } from '../../../core/auth/useAuthStore';
import AppLayout from '../../../layouts/AppLayout.vue';
import FloatingBall from '../../../shared/components/FloatingBall.vue';
import { BUYER_CATEGORY_DEFINITIONS, findBuyerCategoryByLabel, normalizeBuyerCategory } from '../categoryConfig';
import { useBuyerCartStore } from '../stores/useBuyerCartStore';
import { createOrder, fetchProducts, fetchPromotions } from '../api';
const DEFAULT_MONTH_OPTIONS = ['春播', '夏播', '秋播', '冬季', '全年'];
const fallbackSlides = [
    {
        tag: '家庭园艺',
        title: '一站式挑选种子与工具',
        desc: '从蔬菜、花卉到草本植物，分类更清晰，查找更省心。'
    },
    {
        tag: '今日推荐',
        title: '按分类快速找到合适商品',
        desc: '点击左侧分类即可筛选，再次点击可恢复全部。'
    },
    {
        tag: '买家专区',
        title: '加入购物车后可统一结算',
        desc: '商品页、详情页与购物车共享同一份购物数据。'
    }
];
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const cartStore = useBuyerCartStore();
const cartBadgeText = computed(() => {
    const count = cartStore.itemCount;
    if (!count)
        return null;
    return count > 99 ? '...' : String(count);
});
const loading = ref(false);
const error = ref('');
const message = ref('');
const keyword = ref('');
const products = ref([]);
const promotions = ref([]);
const selectedCategory = ref(null);
const selectedMonth = ref('全部');
const selectedRegion = ref('全部');
const slides = computed(() => {
    const backendSlides = promotions.value
        .filter((item) => item.strategyType === 'product')
        .map((item) => ({
        tag: '商品活动',
        title: item.title,
        desc: item.description || '精选活动进行中'
    }));
    return backendSlides.length > 0 ? backendSlides : fallbackSlides;
});
const monthFilters = computed(() => {
    const monthSet = new Set(DEFAULT_MONTH_OPTIONS);
    products.value.forEach((item) => {
        if (item.plantingMonth)
            monthSet.add(item.plantingMonth);
    });
    return ['全部', ...Array.from(monthSet)];
});
const regionFilters = computed(() => {
    const seen = new Set();
    const labels = products.value
        .map((item) => normalizeRegion(item.suitableRegion))
        .filter((label) => {
        if (label === '未设置')
            return false;
        if (seen.has(label))
            return false;
        seen.add(label);
        return true;
    })
        .sort((a, b) => a.localeCompare(b, 'zh-CN'));
    return ['全部', ...labels];
});
const filteredProducts = computed(() => {
    return products.value.filter((item) => {
        const categoryText = normalizeCategory(item.category);
        const monthText = item.plantingMonth || '未设置';
        const regionText = normalizeRegion(item.suitableRegion);
        const keywordValue = keyword.value.trim().toLowerCase();
        const matchKeyword = !keywordValue ||
            [item.name, categoryText, item.description, monthText, regionText].some((text) => text.toLowerCase().includes(keywordValue));
        const matchCategory = !selectedCategory.value || categoryText === selectedCategory.value;
        const matchMonth = selectedMonth.value === '全部' || monthText === selectedMonth.value || monthText === '全年';
        const matchRegion = selectedRegion.value === '全部' || regionText === selectedRegion.value;
        return matchKeyword && matchCategory && matchMonth && matchRegion;
    });
});
const exactMonthProducts = computed(() => {
    if (selectedMonth.value === '全部')
        return filteredProducts.value;
    return filteredProducts.value.filter((item) => (item.plantingMonth || '未设置') === selectedMonth.value);
});
const monthEmptyHint = computed(() => {
    if (selectedMonth.value === '全部' || exactMonthProducts.value.length > 0)
        return '';
    return `${selectedMonth.value} 当前没有对应商品，已为你保留其他筛选条件。`;
});
const monthTipTitle = computed(() => {
    if (!monthEmptyHint.value)
        return '';
    return `${selectedMonth.value} 暂无商品`;
});
const emptyStateText = computed(() => {
    if (selectedCategory.value) {
        return `当前“${selectedCategory.value}”下没有符合条件的商品，请切换其他分类试试。`;
    }
    return '请尝试切换播种时段、地区或搜索关键词。';
});
onMounted(() => {
    syncCategoryFromRoute(route.query.category);
    reload();
});
watch(() => route.query.category, (value) => {
    syncCategoryFromRoute(value);
});
watch(selectedCategory, (value) => {
    const currentQuery = typeof route.query.category === 'string' ? route.query.category : '';
    const nextQuery = value ?? '';
    if (currentQuery === nextQuery)
        return;
    const query = { ...route.query };
    if (nextQuery)
        query.category = nextQuery;
    else
        delete query.category;
    router.replace({ query });
});
async function reload() {
    loading.value = true;
    error.value = '';
    try {
        const [productList, promotionList] = await Promise.all([fetchProducts(), fetchPromotions()]);
        products.value = productList;
        promotions.value = promotionList;
        productList.forEach((item) => cartStore.syncProduct(item));
    }
    catch (err) {
        error.value = err?.response?.data?.message || '商品数据加载失败';
    }
    finally {
        loading.value = false;
    }
}
function syncCategoryFromRoute(value) {
    if (typeof value !== 'string' || !value) {
        selectedCategory.value = null;
        return;
    }
    selectedCategory.value = findBuyerCategoryByLabel(value)?.label ?? null;
}
function toggleCategory(label) {
    selectedCategory.value = selectedCategory.value === label ? null : label;
}
function normalizeCategory(category) {
    return normalizeBuyerCategory(category);
}
function normalizeRegion(region) {
    return region || '未设置';
}
function hasDisplayImage(url) {
    return Boolean(url && /^https?:\/\//i.test(url));
}
function productThumbText(item) {
    if (hasDisplayImage(item.imageUrl))
        return item.name;
    return normalizeCategory(item.category);
}
function formatPrice(value) {
    return Number(value).toFixed(2);
}
function updatePopupQuantity(productId, event) {
    const value = Number(event.target?.value ?? 1);
    cartStore.setQuantity(productId, value);
}
function goDetail(id) {
    router.push(`/products/${id}`);
}
function requireBuyerLogin(actionText) {
    if (!auth.isLoggedIn || auth.role !== 'BUYER') {
        message.value = `${actionText}前请先登录买家账号。`;
        router.push('/login');
        return false;
    }
    return true;
}
function addToCart(item) {
    if (!requireBuyerLogin('加入购物车'))
        return;
    cartStore.addItem(item, 1);
    message.value = `${item.name} 已加入购物车。`;
}
async function buyNow(item) {
    if (!requireBuyerLogin('立即购买'))
        return;
    const confirmed = window.confirm(`确认立即购买「${item.name}」吗？`);
    if (!confirmed)
        return;
    try {
        const res = (await createOrder([{ productId: item.id, quantity: 1 }]));
        message.value = `${item.name} 已下单，订单号：${res.data.orderNo}`;
        await reload();
        router.push(`/orders?focus=${res.data.id}`);
    }
    catch (err) {
        message.value = err?.response?.data?.message || '下单失败';
    }
}
function goCheckout() {
    router.push('/cart');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper']} */ ;
/** @type {__VLS_StyleScopedClasses['products-search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['month-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['month-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['no-products']} */ ;
/** @type {__VLS_StyleScopedClasses['product-list-card']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-stepper']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-stepper']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-stepper']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-step-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-remove']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-total']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-checkout']} */ ;
/** @type {__VLS_StyleScopedClasses['products-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['products-main']} */ ;
/** @type {__VLS_StyleScopedClasses['products-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['products-main']} */ ;
/** @type {__VLS_StyleScopedClasses['products-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['products-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper-slide']} */ ;
/** @type {__VLS_StyleScopedClasses['products-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['products-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['products-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['products-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['products-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['products-main']} */ ;
/** @type {__VLS_StyleScopedClasses['products-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper-slide']} */ ;
/** @type {__VLS_StyleScopedClasses['products-search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['search-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['products-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['category-chip-group']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppLayout, typeof AppLayout, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppLayout, new AppLayout({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "products-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "products-sidebar page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section category-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-title-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "sidebar-tip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-chip-group category-chip-group" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.BUYER_CATEGORY_DEFINITIONS))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleCategory(item.label);
            } },
        key: (item.label),
        type: "button",
        ...{ class: "filter-chip category-chip" },
        ...{ class: ({ active: __VLS_ctx.selectedCategory === item.label }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "category-chip-icon" },
    });
    (item.icon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "category-chip-label" },
    });
    (item.label);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-chip-group month-chip-group" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.monthFilters))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectedMonth = item;
            } },
        key: (item),
        type: "button",
        ...{ class: "filter-chip month-chip" },
        ...{ class: ({ active: __VLS_ctx.selectedMonth === item }) },
    });
    (item);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-chip-group" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.regionFilters))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectedRegion = item;
            } },
        key: (item),
        type: "button",
        ...{ class: "filter-chip" },
        ...{ class: ({ active: __VLS_ctx.selectedRegion === item }) },
    });
    (item);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "products-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-lite products-swiper-wrap" },
});
const __VLS_4 = {}.Swiper;
/** @type {[typeof __VLS_components.Swiper, typeof __VLS_components.Swiper, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    modules: ([__VLS_ctx.Autoplay, __VLS_ctx.Pagination, __VLS_ctx.EffectCoverflow]),
    effect: "coverflow",
    slidesPerView: ('auto'),
    centeredSlides: (true),
    loop: (__VLS_ctx.slides.length > 1),
    autoplay: ({ delay: 3200 }),
    pagination: ({ clickable: true }),
    coverflowEffect: ({
        rotate: 0,
        stretch: 0,
        depth: 150,
        scale: 0.92,
        modifier: 1,
        slideShadows: false
    }),
    ...{ class: "products-swiper" },
}));
const __VLS_6 = __VLS_5({
    modules: ([__VLS_ctx.Autoplay, __VLS_ctx.Pagination, __VLS_ctx.EffectCoverflow]),
    effect: "coverflow",
    slidesPerView: ('auto'),
    centeredSlides: (true),
    loop: (__VLS_ctx.slides.length > 1),
    autoplay: ({ delay: 3200 }),
    pagination: ({ clickable: true }),
    coverflowEffect: ({
        rotate: 0,
        stretch: 0,
        depth: 150,
        scale: 0.92,
        modifier: 1,
        slideShadows: false
    }),
    ...{ class: "products-swiper" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
for (const [slide] of __VLS_getVForSourceType((__VLS_ctx.slides))) {
    const __VLS_8 = {}.SwiperSlide;
    /** @type {[typeof __VLS_components.SwiperSlide, typeof __VLS_components.SwiperSlide, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (slide.title),
        ...{ class: "products-swiper-slide" },
    }));
    const __VLS_10 = __VLS_9({
        key: (slide.title),
        ...{ class: "products-swiper-slide" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "products-banner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "hero-tag" },
    });
    (slide.tag);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    (slide.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "hero-subtitle" },
    });
    (slide.desc);
    var __VLS_11;
}
var __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-lite products-search-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    value: (__VLS_ctx.keyword),
    type: "text",
    placeholder: "搜索商品名称、分类或描述",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-toolbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "count-chip" },
});
(__VLS_ctx.filteredProducts.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.reload) },
    ...{ class: "secondary-btn" },
    disabled: (__VLS_ctx.loading),
});
(__VLS_ctx.loading ? '加载中...' : '刷新');
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-lite no-products" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-lite no-products" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "product-desc" },
    });
    (__VLS_ctx.error);
}
else {
    if (__VLS_ctx.monthEmptyHint) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "page-lite month-tip" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.monthTipTitle);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "product-desc" },
        });
        (__VLS_ctx.monthEmptyHint);
    }
    if (__VLS_ctx.filteredProducts.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "page-lite no-products" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "product-desc" },
        });
        (__VLS_ctx.emptyStateText);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "products-card-grid" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredProducts))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.error))
                            return;
                        if (!!(__VLS_ctx.filteredProducts.length === 0))
                            return;
                        __VLS_ctx.goDetail(item.id);
                    } },
                key: (item.id),
                ...{ class: "product-list-card page-lite" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "product-cover" },
            });
            if (__VLS_ctx.hasDisplayImage(item.imageUrl)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    ...{ class: "product-image" },
                    src: (item.imageUrl),
                    alt: (item.name),
                    loading: "lazy",
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "product-thumb" },
                });
                (__VLS_ctx.productThumbText(item));
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "product-list-content" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "product-list-top" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "product-category-tag" },
            });
            (__VLS_ctx.normalizeCategory(item.category));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ class: "product-title-link" },
            });
            (item.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "product-list-price" },
            });
            (__VLS_ctx.formatPrice(item.price));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "product-desc" },
            });
            (item.description);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "product-extra-meta" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (item.plantingMonth || '未设置');
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.normalizeRegion(item.suitableRegion));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (item.onlineStock);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "product-actions" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.error))
                            return;
                        if (!!(__VLS_ctx.filteredProducts.length === 0))
                            return;
                        __VLS_ctx.buyNow(item);
                    } },
                type: "button",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.error))
                            return;
                        if (!!(__VLS_ctx.filteredProducts.length === 0))
                            return;
                        __VLS_ctx.addToCart(item);
                    } },
                type: "button",
                ...{ class: "secondary-btn" },
            });
        }
    }
}
if (__VLS_ctx.message) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "home-message" },
    });
    (__VLS_ctx.message);
}
/** @type {[typeof FloatingBall, typeof FloatingBall, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(FloatingBall, new FloatingBall({
    icon: "🛒",
    color: "#80ab64",
    popupWidth: (340),
    popupHeight: (420),
    badgeText: (__VLS_ctx.cartBadgeText),
}));
const __VLS_13 = __VLS_12({
    icon: "🛒",
    color: "#80ab64",
    popupWidth: (340),
    popupHeight: (420),
    badgeText: (__VLS_ctx.cartBadgeText),
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
__VLS_14.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cart-popup" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cart-popup-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "cart-popup-count" },
});
(__VLS_ctx.cartStore.itemCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cart-popup-body" },
});
if (__VLS_ctx.cartStore.isEmpty) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cart-popup-empty" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cart-popup-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.cartStore.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.id),
            ...{ class: "cart-popup-item" },
        });
        if (__VLS_ctx.hasDisplayImage(item.imageUrl)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ class: "cart-popup-thumb-image" },
                src: (item.imageUrl),
                alt: (item.name),
                loading: "lazy",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "cart-popup-thumb" },
            });
            (item.name.charAt(0) || '商品');
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cart-popup-main" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cart-popup-top" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "cart-popup-name" },
        });
        (item.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "cart-popup-price" },
        });
        (__VLS_ctx.formatPrice(item.price * item.quantity));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cart-popup-bottom" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: () => { } },
            ...{ class: "cart-popup-stepper" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.cartStore.isEmpty))
                        return;
                    __VLS_ctx.cartStore.decrease(item.id);
                } },
            type: "button",
            ...{ class: "popup-step-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onInput: (...[$event]) => {
                    if (!!(__VLS_ctx.cartStore.isEmpty))
                        return;
                    __VLS_ctx.updatePopupQuantity(item.id, $event);
                } },
            value: (item.quantity),
            type: "number",
            min: "1",
            max: (Math.max(1, item.onlineStock)),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.cartStore.isEmpty))
                        return;
                    __VLS_ctx.cartStore.increase(item.id);
                } },
            type: "button",
            ...{ class: "popup-step-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.cartStore.isEmpty))
                        return;
                    __VLS_ctx.cartStore.removeItem(item.id);
                } },
            type: "button",
            ...{ class: "cart-popup-remove" },
        });
    }
}
if (!__VLS_ctx.cartStore.isEmpty) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cart-popup-footer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "cart-popup-total" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.formatPrice(__VLS_ctx.cartStore.totalAmount));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goCheckout) },
        ...{ class: "cart-popup-checkout" },
    });
}
var __VLS_14;
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['products-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['products-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['category-section']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip-group']} */ ;
/** @type {__VLS_StyleScopedClasses['category-chip-group']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['category-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['category-chip-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['category-chip-label']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip-group']} */ ;
/** @type {__VLS_StyleScopedClasses['month-chip-group']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['month-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip-group']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['products-main']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper-slide']} */ ;
/** @type {__VLS_StyleScopedClasses['products-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['products-search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['search-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['count-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['no-products']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['no-products']} */ ;
/** @type {__VLS_StyleScopedClasses['product-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['month-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['product-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['no-products']} */ ;
/** @type {__VLS_StyleScopedClasses['product-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['products-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['product-list-card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['product-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['product-image']} */ ;
/** @type {__VLS_StyleScopedClasses['product-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['product-list-content']} */ ;
/** @type {__VLS_StyleScopedClasses['product-list-top']} */ ;
/** @type {__VLS_StyleScopedClasses['product-category-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['product-title-link']} */ ;
/** @type {__VLS_StyleScopedClasses['product-list-price']} */ ;
/** @type {__VLS_StyleScopedClasses['product-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['product-extra-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['product-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['home-message']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-count']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-body']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-list']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-item']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-thumb-image']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-main']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-top']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-name']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-price']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-stepper']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-step-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-step-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-remove']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-total']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-popup-checkout']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Swiper: Swiper,
            SwiperSlide: SwiperSlide,
            Autoplay: Autoplay,
            EffectCoverflow: EffectCoverflow,
            Pagination: Pagination,
            AppLayout: AppLayout,
            FloatingBall: FloatingBall,
            BUYER_CATEGORY_DEFINITIONS: BUYER_CATEGORY_DEFINITIONS,
            cartStore: cartStore,
            cartBadgeText: cartBadgeText,
            loading: loading,
            error: error,
            message: message,
            keyword: keyword,
            selectedCategory: selectedCategory,
            selectedMonth: selectedMonth,
            selectedRegion: selectedRegion,
            slides: slides,
            monthFilters: monthFilters,
            regionFilters: regionFilters,
            filteredProducts: filteredProducts,
            monthEmptyHint: monthEmptyHint,
            monthTipTitle: monthTipTitle,
            emptyStateText: emptyStateText,
            reload: reload,
            toggleCategory: toggleCategory,
            normalizeCategory: normalizeCategory,
            normalizeRegion: normalizeRegion,
            hasDisplayImage: hasDisplayImage,
            productThumbText: productThumbText,
            formatPrice: formatPrice,
            updatePopupQuantity: updatePopupQuantity,
            goDetail: goDetail,
            addToCart: addToCart,
            buyNow: buyNow,
            goCheckout: goCheckout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
