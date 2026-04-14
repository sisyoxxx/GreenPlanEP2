const categories = [
    { icon: '🌱', name: '蔬菜种子', desc: '阳台与庭院种植' },
    { icon: '🌸', name: '花卉种子', desc: '观赏与四季花园' },
    { icon: '🪴', name: '盆栽绿植', desc: '室内净化与观叶' },
    { icon: '🧰', name: '种植工具', desc: '育苗、浇灌、修剪' },
    { icon: '🍀', name: '营养肥料', desc: '土壤、肥料与营养液' }
];
const services = [
    { title: '种植新手指引', desc: '从播种到养护的完整说明' },
    { title: '季节推荐', desc: '根据时令推荐适宜种植的品类' }
];
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "sidebar-list sidebar-grid-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.categories))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (item.name),
        ...{ class: "sidebar-list-item sidebar-grid-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "sidebar-icon" },
    });
    (item.icon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-grid-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-item-title" },
    });
    (item.name);
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
        ...{ class: "mini-service-card" },
        key: (service.title),
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
            categories: categories,
            services: services,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
