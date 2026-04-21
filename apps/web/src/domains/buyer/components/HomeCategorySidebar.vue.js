import { useRouter } from 'vue-router';
import { BUYER_CATEGORY_DEFINITIONS } from '../categoryConfig';
const router = useRouter();
const services = [
    { title: '新手指引', desc: '从播种、浇水到养护节奏，帮你快速上手。' },
    { title: '时令推荐', desc: '根据当前适播季节挑选更适合的商品。' }
];
function goCategory(category) {
    router.push({
        path: '/products',
        query: { category }
    });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['sidebar-grid-button']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-grid-list']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-grid-item']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "home-sidebar left-sidebar page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-list sidebar-grid-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.BUYER_CATEGORY_DEFINITIONS))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.goCategory(item.label);
            } },
        key: (item.label),
        type: "button",
        ...{ class: "sidebar-list-item sidebar-grid-item sidebar-grid-button" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "sidebar-icon" },
        'aria-hidden': "true",
    });
    (item.icon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-grid-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-item-title" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-item-desc" },
    });
    (item.desc);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "sidebar-title" },
});
for (const [service] of __VLS_getVForSourceType((__VLS_ctx.services))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (service.title),
        ...{ class: "mini-service-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-item-title" },
    });
    (service.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-item-desc" },
    });
    (service.desc);
}
/** @type {__VLS_StyleScopedClasses['home-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-list']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-grid-list']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-grid-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-grid-button']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-grid-text']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BUYER_CATEGORY_DEFINITIONS: BUYER_CATEGORY_DEFINITIONS,
            services: services,
            goCategory: goCategory,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
