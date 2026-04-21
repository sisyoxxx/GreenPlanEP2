import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../core/auth/useAuthStore';
import { useBuyerCartStore } from '../../domains/buyer/stores/useBuyerCartStore';
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const cartStore = useBuyerCartStore();
const showDropdown = ref(false);
let hideTimer = null;
const showTopNav = computed(() => !route.path.startsWith('/admin') && !route.path.startsWith('/inventory'));
const showRoleUsername = computed(() => auth.role === 'INVENTORY_MANAGER' && route.path.startsWith('/inventory'));
const cartCount = computed(() => cartStore.itemCount);
const cartBadgeText = computed(() => (cartCount.value > 99 ? '...' : String(cartCount.value)));
function onAvatarEnter() {
    if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
    showDropdown.value = true;
}
function onAvatarLeave() {
    hideTimer = setTimeout(() => {
        showDropdown.value = false;
    }, 150);
}
function goLogin() {
    router.push('/login');
}
function goProfile() {
    showDropdown.value = false;
    router.push('/profile');
}
function goCart() {
    router.push('/cart');
}
function logout() {
    showDropdown.value = false;
    auth.logout();
    cartStore.clear();
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
/** @type {__VLS_StyleScopedClasses['cart-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-logout']} */ ;
/** @type {__VLS_StyleScopedClasses['top-header']} */ ;
/** @type {__VLS_StyleScopedClasses['top-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['top-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-label']} */ ;
/** @type {__VLS_StyleScopedClasses['top-header']} */ ;
/** @type {__VLS_StyleScopedClasses['user-bar-right']} */ ;
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
if (__VLS_ctx.showTopNav) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
        ...{ class: "top-nav" },
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
    const __VLS_8 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        to: "/products",
        ...{ class: "nav-link" },
        activeClass: "nav-link-active",
    }));
    const __VLS_10 = __VLS_9({
        to: "/products",
        ...{ class: "nav-link" },
        activeClass: "nav-link-active",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    var __VLS_11;
    const __VLS_12 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        to: "/tutorial",
        ...{ class: "nav-link" },
        activeClass: "nav-link-active",
    }));
    const __VLS_14 = __VLS_13({
        to: "/tutorial",
        ...{ class: "nav-link" },
        activeClass: "nav-link-active",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    var __VLS_15;
    const __VLS_16 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        to: "/planting-records",
        ...{ class: "nav-link" },
        activeClass: "nav-link-active",
    }));
    const __VLS_18 = __VLS_17({
        to: "/planting-records",
        ...{ class: "nav-link" },
        activeClass: "nav-link-active",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    var __VLS_19;
    const __VLS_20 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        to: "/community",
        ...{ class: "nav-link" },
        activeClass: "nav-link-active",
    }));
    const __VLS_22 = __VLS_21({
        to: "/community",
        ...{ class: "nav-link" },
        activeClass: "nav-link-active",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    var __VLS_23;
    const __VLS_24 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        to: "/orders",
        ...{ class: "nav-link" },
        activeClass: "nav-link-active",
    }));
    const __VLS_26 = __VLS_25({
        to: "/orders",
        ...{ class: "nav-link" },
        activeClass: "nav-link-active",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    var __VLS_27;
    if (__VLS_ctx.auth.role === 'ADMIN') {
        const __VLS_28 = {}.RouterLink;
        /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            to: "/admin/dashboard",
            ...{ class: "nav-link" },
            activeClass: "nav-link-active",
        }));
        const __VLS_30 = __VLS_29({
            to: "/admin/dashboard",
            ...{ class: "nav-link" },
            activeClass: "nav-link-active",
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        var __VLS_31;
    }
    if (__VLS_ctx.auth.role === 'INVENTORY_MANAGER') {
        const __VLS_32 = {}.RouterLink;
        /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            to: "/inventory/dashboard",
            ...{ class: "nav-link" },
            activeClass: "nav-link-active",
        }));
        const __VLS_34 = __VLS_33({
            to: "/inventory/dashboard",
            ...{ class: "nav-link" },
            activeClass: "nav-link-active",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        var __VLS_35;
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-bar-right" },
});
if (__VLS_ctx.showTopNav) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goCart) },
        type: "button",
        ...{ class: "cart-entry" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "cart-icon" },
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "cart-label" },
    });
    if (__VLS_ctx.cartCount > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "cart-badge" },
        });
        (__VLS_ctx.cartBadgeText);
    }
}
if (__VLS_ctx.auth.user) {
    if (__VLS_ctx.showRoleUsername) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "header-username" },
        });
        (__VLS_ctx.auth.user.username);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMouseenter: (__VLS_ctx.onAvatarEnter) },
        ...{ onMouseleave: (__VLS_ctx.onAvatarLeave) },
        ...{ class: "avatar-wrap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.goProfile) },
        ...{ class: "user-avatar" },
    });
    if (__VLS_ctx.auth.user.avatarDataUrl) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (__VLS_ctx.auth.user.avatarDataUrl),
            alt: "avatar",
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.auth.user.username?.charAt(0) || 'U');
    }
    if (__VLS_ctx.showDropdown) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "avatar-dropdown" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "dropdown-username" },
        });
        (__VLS_ctx.auth.user.username);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "dropdown-divider" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.goProfile) },
            ...{ class: "dropdown-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.logout) },
            ...{ class: "dropdown-item dropdown-logout" },
        });
    }
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
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['user-bar-right']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-label']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['header-username']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-username']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-logout']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RouterLink: RouterLink,
            auth: auth,
            showDropdown: showDropdown,
            showTopNav: showTopNav,
            showRoleUsername: showRoleUsername,
            cartCount: cartCount,
            cartBadgeText: cartBadgeText,
            onAvatarEnter: onAvatarEnter,
            onAvatarLeave: onAvatarLeave,
            goLogin: goLogin,
            goProfile: goProfile,
            goCart: goCart,
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
