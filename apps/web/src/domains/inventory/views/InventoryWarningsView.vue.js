import { reactive, ref } from 'vue';
import AppLayout from '../../../layouts/AppLayout.vue';
import { updateWarningThreshold } from '../api';
const form = reactive({ productId: 1, warningThreshold: 10 });
const message = ref('');
async function submit() {
    await updateWarningThreshold(form.productId, form.warningThreshold);
    message.value = '库存预警阈值已更新';
}
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.submit) },
    ...{ class: "form-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    min: "1",
    placeholder: "商品ID",
    required: true,
});
(__VLS_ctx.form.productId);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    min: "0",
    placeholder: "预警阈值",
    required: true,
});
(__VLS_ctx.form.warningThreshold);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "home-message" },
});
(__VLS_ctx.message);
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['admin-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['home-message']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppLayout: AppLayout,
            form: form,
            message: message,
            submit: submit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
