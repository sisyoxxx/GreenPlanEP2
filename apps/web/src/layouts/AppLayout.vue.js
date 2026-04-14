import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from '../shared/components/AppHeader.vue';
const route = useRoute();
const publicHeaderRoutes = ['/', '/login', '/profile', '/products', '/tutorial', '/planting-records', '/community'];
const showHeader = computed(() => publicHeaderRoutes.includes(route.path) || route.path.startsWith('/products/'));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['app-main']} */ ;
/** @type {__VLS_StyleScopedClasses['app-main']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-layout" },
});
if (__VLS_ctx.showHeader) {
    /** @type {[typeof AppHeader, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(AppHeader, new AppHeader({}));
    const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "app-main" },
    ...{ class: ({ 'app-main-no-header': !__VLS_ctx.showHeader }) },
});
var __VLS_3 = {};
/** @type {__VLS_StyleScopedClasses['app-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['app-main']} */ ;
// @ts-ignore
var __VLS_4 = __VLS_3;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppHeader: AppHeader,
            showHeader: showHeader,
        };
    },
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
