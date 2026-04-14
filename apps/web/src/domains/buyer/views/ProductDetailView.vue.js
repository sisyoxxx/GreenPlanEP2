import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppLayout from '../../../layouts/AppLayout.vue';
import { fetchProducts } from '../api';
const route = useRoute();
const router = useRouter();
const product = ref(null);
const categoryLabelMap = {
    VEGETABLE: '蔬菜种子',
    FLOWER: '花卉种子',
    HERB: '香草种子',
    FRUIT: '营养肥料',
    TOOL: '园艺工具'
};
onMounted(async () => {
    const id = Number(route.params.id);
    const products = await fetchProducts();
    product.value = products.find((item) => item.id === id) ?? null;
});
function goProducts() {
    router.push('/products');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-price']} */ ;
/** @type {__VLS_StyleScopedClasses['product-detail-shell']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppLayout, typeof AppLayout, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppLayout, new AppLayout({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
if (__VLS_ctx.product) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-detail-shell page-lite" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-cover" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-thumb detail-thumb" },
    });
    (__VLS_ctx.product.imageUrl || (__VLS_ctx.categoryLabelMap[__VLS_ctx.product.category] ?? __VLS_ctx.product.category));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "hero-tag" },
    });
    (__VLS_ctx.product.plantingMonth || '未设置月份');
    (__VLS_ctx.product.suitableRegion || '未设置地区');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    (__VLS_ctx.product.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "detail-price" },
    });
    (__VLS_ctx.product.price);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "hero-subtitle" },
    });
    (__VLS_ctx.product.description);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-extra-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.categoryLabelMap[__VLS_ctx.product.category] ?? __VLS_ctx.product.category);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.product.onlineStock);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goProducts) },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-lite no-products" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "product-desc" },
    });
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['product-detail-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['product-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-price']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['product-extra-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['product-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['no-products']} */ ;
/** @type {__VLS_StyleScopedClasses['product-desc']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppLayout: AppLayout,
            product: product,
            categoryLabelMap: categoryLabelMap,
            goProducts: goProducts,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
