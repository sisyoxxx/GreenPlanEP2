import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '../../../layouts/AppLayout.vue';
import { useAuthStore } from '../../../core/auth/useAuthStore';
const router = useRouter();
const auth = useAuthStore();
const error = ref('');
const message = ref('');
const mode = ref('login');
const rememberSevenDays = ref(false);
const loginForm = reactive({ username: '', password: '' });
const registerForm = reactive({ username: '', password: '', roleCode: 'BUYER' });
function goRoleHome() {
    if (auth.role === 'ADMIN')
        router.push('/admin/dashboard');
    else if (auth.role === 'INVENTORY_MANAGER')
        router.push('/inventory/dashboard');
    else
        router.push('/profile');
}
function goForgotPassword() {
    router.push('/forgot-password');
}
async function submitLogin() {
    error.value = '';
    message.value = rememberSevenDays.value ? '已勾选七天自动登录' : '';
    try {
        await auth.login(loginForm);
        goRoleHome();
    }
    catch (e) {
        error.value = e?.response?.data?.message || '登录失败';
    }
}
async function submitRegister() {
    error.value = '';
    message.value = '';
    try {
        await auth.register(registerForm);
        goRoleHome();
    }
    catch (e) {
        error.value = e?.response?.data?.message || '注册失败';
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['remember-check']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppLayout, typeof AppLayout, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppLayout, new AppLayout({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-page-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-card page-lite auth-card-animated" },
});
if (__VLS_ctx.mode === 'login') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "auth-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
        ...{ onSubmit: (__VLS_ctx.submitLogin) },
        ...{ class: "panel auth-form" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "用户名",
        required: true,
    });
    (__VLS_ctx.loginForm.username);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "密码",
        type: "password",
        required: true,
    });
    (__VLS_ctx.loginForm.password);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "auth-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "remember-check" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "checkbox",
    });
    (__VLS_ctx.rememberSevenDays);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goForgotPassword) },
        type: "button",
        ...{ class: "text-link" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        type: "submit",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "auth-switch-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.mode === 'login'))
                    return;
                __VLS_ctx.mode = 'register';
            } },
        type: "button",
        ...{ class: "text-link" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "auth-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
        ...{ onSubmit: (__VLS_ctx.submitRegister) },
        ...{ class: "panel auth-form" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "用户名",
        required: true,
    });
    (__VLS_ctx.registerForm.username);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "密码",
        type: "password",
        required: true,
    });
    (__VLS_ctx.registerForm.password);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.registerForm.roleCode),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "BUYER",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "ADMIN",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "INVENTORY_MANAGER",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        type: "submit",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "auth-switch-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.mode === 'login'))
                    return;
                __VLS_ctx.mode = 'login';
            } },
        type: "button",
        ...{ class: "text-link" },
    });
}
if (__VLS_ctx.message) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "home-message" },
    });
    (__VLS_ctx.message);
}
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "error" },
    });
    (__VLS_ctx.error);
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['auth-page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card-animated']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-title']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-form']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-row']} */ ;
/** @type {__VLS_StyleScopedClasses['remember-check']} */ ;
/** @type {__VLS_StyleScopedClasses['text-link']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-switch-text']} */ ;
/** @type {__VLS_StyleScopedClasses['text-link']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-title']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-form']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-switch-text']} */ ;
/** @type {__VLS_StyleScopedClasses['text-link']} */ ;
/** @type {__VLS_StyleScopedClasses['home-message']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppLayout: AppLayout,
            error: error,
            message: message,
            mode: mode,
            rememberSevenDays: rememberSevenDays,
            loginForm: loginForm,
            registerForm: registerForm,
            goForgotPassword: goForgotPassword,
            submitLogin: submitLogin,
            submitRegister: submitRegister,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
