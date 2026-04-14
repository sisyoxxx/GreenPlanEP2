import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '../../../layouts/AppLayout.vue';
import { useAuthStore } from '../../../core/auth/useAuthStore';
import { createOrder, fetchProducts } from '../api';
import HomeCategorySidebar from '../components/HomeCategorySidebar.vue';
import HomeRecommendationRail from '../components/HomeRecommendationRail.vue';
const router = useRouter();
const auth = useAuthStore();
const products = ref([]);
const cart = ref([]);
const message = ref('');
const tutorials = [
    { title: '播种前的种子处理方法', desc: '了解浸种、催芽与播前准备。' },
    { title: '家庭阳台种植光照指南', desc: '不同作物需要的光照强度与摆放建议。' },
    { title: '浇水频率怎么判断', desc: '避免积水烂根和长期缺水。' },
    { title: '新手营养肥料搭配技巧', desc: '肥料比例与盆栽通气性建议。' },
    { title: '幼苗期常见问题排查', desc: '徒长、黄叶、倒伏的处理思路。' },
    { title: '家庭病虫害预防方案', desc: '低风险、易上手的园艺防护方法。' },
    { title: '四季适合播种的品种', desc: '按季节筛选更容易成功的作物。' }
];
const communityPosts = [
    { title: '番茄从发芽到开花记录', desc: '分享阳台番茄完整生长过程。' },
    { title: '如何让薄荷长得更旺盛', desc: '社区热议的修剪与浇水经验。' },
    { title: '春季阳台花园布置灵感', desc: '适合小空间的花卉搭配方案。' },
    { title: '新手入门买哪些工具', desc: '大家推荐的实用园艺工具清单。' },
    { title: '我家的草莓终于结果了', desc: '从播种到采收的经验总结。' },
    { title: '家庭堆肥小技巧', desc: '厨余再利用与土壤改良心得。' },
    { title: '夏季浇水避坑经验', desc: '高温阶段如何减少闷根与蒸腾损伤。' },
    { title: '香草植物适合厨房窗边吗', desc: '关于罗勒、迷迭香、薄荷的讨论。' }
];
const totalCardCount = computed(() => products.value.length + tutorials.length + communityPosts.length);
onMounted(async () => {
    products.value = (await fetchProducts()).slice(0, 8);
});
function goProducts() {
    router.push('/products');
}
function goTutorial() {
    router.push('/tutorial');
}
function goCommunity() {
    router.push('/community');
}
function requireBuyerLogin(actionText) {
    if (!auth.isLoggedIn || auth.role !== 'BUYER') {
        message.value = `${actionText}前请先登录买家账号`;
        router.push('/login');
        return false;
    }
    return true;
}
function addToCart(item) {
    if (!requireBuyerLogin('加入购物车'))
        return;
    const existed = cart.value.find((c) => c.id === item.id);
    if (existed)
        existed.quantity += 1;
    else
        cart.value.push({ ...item, quantity: 1 });
    message.value = `${item.name} 已加入购物车`;
}
function clearCart() {
    cart.value = [];
    message.value = '购物车已清空';
}
async function submitOrder() {
    if (!requireBuyerLogin('下单'))
        return;
    if (cart.value.length === 0)
        return;
    const payload = cart.value.map((item) => ({ productId: item.id, quantity: item.quantity }));
    try {
        const res = await createOrder(payload);
        message.value = `下单成功，订单号：${res.data.orderNo}`;
        cart.value = [];
        products.value = (await fetchProducts()).slice(0, 8);
    }
    catch (e) {
        message.value = e?.response?.data?.message || '下单失败';
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero-content']} */ ;
/** @type {__VLS_StyleScopedClasses['featured-product']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-card']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-card']} */ ;
/** @type {__VLS_StyleScopedClasses['home-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['home-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['home-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['featured-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['home-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['home-shell']} */ ;
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "hero-subtitle" },
});
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "highlight-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "highlight-desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "featured-grid" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.products))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "featured-product page-lite" },
        key: (item.id),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-thumb" },
    });
    (item.category);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (item.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "product-desc" },
    });
    (item.description);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.price);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.onlineStock);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.addToCart(item);
            } },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goProducts) },
        ...{ class: "secondary-btn" },
    });
}
if (__VLS_ctx.cart.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cart-strip page-lite" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.cart.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "sidebar-item-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cart-strip-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.clearCart) },
        ...{ class: "secondary-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.submitOrder) },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "bottom-sections" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-section page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.goProducts) },
    ...{ class: "secondary-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-card-grid" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.products))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "bottom-card" },
        key: (`product-${item.id}`),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bottom-card-tag" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (item.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (item.description);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-section page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.goTutorial) },
    ...{ class: "secondary-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-card-grid" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.tutorials))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "bottom-card" },
        key: (item.title),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bottom-card-tag" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (item.desc);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-section page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.goCommunity) },
    ...{ class: "secondary-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-card-grid" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.communityPosts))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "bottom-card" },
        key: (item.title),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bottom-card-tag" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (item.desc);
}
if (__VLS_ctx.totalCardCount > 20) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "overflow-actions page-lite" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goProducts) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goTutorial) },
        ...{ class: "secondary-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goCommunity) },
        ...{ class: "secondary-btn" },
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
/** @type {__VLS_StyleScopedClasses['featured-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['featured-product']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['product-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['product-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['product-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['product-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-strip-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-sections']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-section']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-card']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-card-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-section']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-card']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-card-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-section']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-card']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-card-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['home-message']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppLayout: AppLayout,
            HomeCategorySidebar: HomeCategorySidebar,
            HomeRecommendationRail: HomeRecommendationRail,
            products: products,
            cart: cart,
            message: message,
            tutorials: tutorials,
            communityPosts: communityPosts,
            totalCardCount: totalCardCount,
            goProducts: goProducts,
            goTutorial: goTutorial,
            goCommunity: goCommunity,
            addToCart: addToCart,
            clearCart: clearCart,
            submitOrder: submitOrder,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
