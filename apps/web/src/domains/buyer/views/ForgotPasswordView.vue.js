import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const username = ref('');
const email = ref('');
const message = ref('');
function submit() {
    message.value = `已收到 ${username.value} 的找回申请，后续可接入真实邮件找回流程。`;
}
function goLogin() {
    router.push('/login');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-page-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-card page-lite auth-card-animated" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "auth-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.submit) },
    ...{ class: "panel auth-form" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "请输入用户名",
    required: true,
});
(__VLS_ctx.username);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "请输入邮箱（演示用）",
    required: true,
});
(__VLS_ctx.email);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "auth-switch-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.goLogin) },
    type: "button",
    ...{ class: "text-link" },
});
if (__VLS_ctx.message) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "home-message" },
    });
    (__VLS_ctx.message);
}
/** @type {__VLS_StyleScopedClasses['auth-page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card-animated']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-title']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-form']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-switch-text']} */ ;
/** @type {__VLS_StyleScopedClasses['text-link']} */ ;
/** @type {__VLS_StyleScopedClasses['home-message']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            username: username,
            email: email,
            message: message,
            submit: submit,
            goLogin: goLogin,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
