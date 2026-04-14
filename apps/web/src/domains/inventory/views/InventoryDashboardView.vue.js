import { onMounted, ref } from 'vue';
import AppLayout from '../../../layouts/AppLayout.vue';
import { fetchInventoryWarnings } from '../api';
const warnings = ref([]);
onMounted(async () => {
    warnings.value = await fetchInventoryWarnings();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {[typeof AppLayout, typeof AppLayout, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppLayout, new AppLayout({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "admin-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "admin-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "admin-subtitle" },
});
(__VLS_ctx.warnings.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "list-stack" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.warnings))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-card" },
        key: (item.id),
    });
    (item.product.id);
    (item.onlineStock);
    (item.warningThreshold);
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['admin-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-title']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['list-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppLayout: AppLayout,
            warnings: warnings,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
