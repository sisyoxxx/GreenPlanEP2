import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../../core/auth/useAuthStore';
const router = useRouter();
const auth = useAuthStore();
function goLogin() {
    router.push('/login');
}
function logout() {
    auth.logout();
    router.push('/login');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link-active']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['router-link-active']} */ ;
/** @type {__VLS_StyleScopedClasses['top-header']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['user-bar-right']} */ ;
/** @type {__VLS_StyleScopedClasses['top-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['top-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "top-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-wrap" },
});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "/",
    ...{ class: "brand" },
}));
const __VLS_2 = __VLS_1({
    to: "/",
    ...{ class: "brand" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
    ...{ class: "top-nav top-nav-centered" },
});
const __VLS_4 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    to: "/",
    ...{ class: "nav-link" },
    exactActiveClass: "nav-link-active",
}));
const __VLS_6 = __VLS_5({
    to: "/",
    ...{ class: "nav-link" },
    exactActiveClass: "nav-link-active",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
var __VLS_7;
if (__VLS_ctx.auth.user?.role === 'BUYER') {
    const __VLS_8 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        to: "/profile",
        ...{ class: "nav-link" },
        activeClass: "nav-link-active",
    }));
    const __VLS_10 = __VLS_9({
        to: "/profile",
        ...{ class: "nav-link" },
        activeClass: "nav-link-active",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    var __VLS_11;
}
const __VLS_12 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    to: "/products",
    ...{ class: "nav-link" },
    activeClass: "nav-link-active",
}));
const __VLS_14 = __VLS_13({
    to: "/products",
    ...{ class: "nav-link" },
    activeClass: "nav-link-active",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
var __VLS_15;
const __VLS_16 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    to: "/orders",
    ...{ class: "nav-link" },
    activeClass: "nav-link-active",
}));
const __VLS_18 = __VLS_17({
    to: "/orders",
    ...{ class: "nav-link" },
    activeClass: "nav-link-active",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
var __VLS_19;
const __VLS_20 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    to: "/tutorial",
    ...{ class: "nav-link" },
    activeClass: "nav-link-active",
}));
const __VLS_22 = __VLS_21({
    to: "/tutorial",
    ...{ class: "nav-link" },
    activeClass: "nav-link-active",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
var __VLS_23;
const __VLS_24 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    to: "/planting-records",
    ...{ class: "nav-link" },
    activeClass: "nav-link-active",
}));
const __VLS_26 = __VLS_25({
    to: "/planting-records",
    ...{ class: "nav-link" },
    activeClass: "nav-link-active",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
var __VLS_27;
const __VLS_28 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    to: "/community",
    ...{ class: "nav-link" },
    activeClass: "nav-link-active",
}));
const __VLS_30 = __VLS_29({
    to: "/community",
    ...{ class: "nav-link" },
    activeClass: "nav-link-active",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
var __VLS_31;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-bar-right" },
});
if (__VLS_ctx.auth.user) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "user-name" },
    });
    (__VLS_ctx.auth.user.username);
    (__VLS_ctx.auth.user.role);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.logout) },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goLogin) },
    });
}
/** @type {__VLS_StyleScopedClasses['top-header']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['brand']} */ ;
/** @type {__VLS_StyleScopedClasses['top-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['top-nav-centered']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['user-bar-right']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RouterLink: RouterLink,
            auth: auth,
            goLogin: goLogin,
            logout: logout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
