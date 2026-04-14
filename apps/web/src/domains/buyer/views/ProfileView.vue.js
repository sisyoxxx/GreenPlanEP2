import { useRouter } from 'vue-router';
import AppLayout from '../../../layouts/AppLayout.vue';
import { useAuthStore } from '../../../core/auth/useAuthStore';
const router = useRouter();
const auth = useAuthStore();
const quickActions = [
    { icon: '🛍️', title: '逛商品', desc: '继续挑选适合你的种植商品', to: '/products' },
    { icon: '📦', title: '我的订单', desc: '查看已下单商品与订单状态', to: '/orders' },
    { icon: '🪴', title: '种植记录', desc: '查看和整理你的种植日记', to: '/planting-records' },
    { icon: '💬', title: '社区交流', desc: '浏览大家的种植经验分享', to: '/community' }
];
const diaryEntries = [
    { id: 1, title: '番茄育苗第7天', plantName: '番茄', date: '2026-04-10', note: '已出芽，保持通风和散射光。' },
    { id: 2, title: '月季播种第3天', plantName: '月季', date: '2026-04-11', note: '土壤湿润度正常，等待发芽。' },
    { id: 3, title: '罗勒修剪记录', plantName: '罗勒', date: '2026-04-12', note: '顶部摘心后侧芽开始生长，适合继续控水。' }
];
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['profile-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-card']} */ ;
/** @type {__VLS_StyleScopedClasses['journal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['journal-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['journal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['journal-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['journal-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppLayout, typeof AppLayout, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppLayout, new AppLayout({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "profile-overview page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-welcome" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "profile-tag" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(__VLS_ctx.auth.user?.username || '用户');
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "profile-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-meta-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meta-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "meta-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.auth.user?.username || '--');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meta-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "meta-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.auth.user?.role || '--');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meta-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "meta-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "profile-actions page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "quick-grid" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.quickActions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.router.push(item.to);
            } },
        key: (item.title),
        ...{ class: "quick-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "quick-icon" },
    });
    (item.icon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.desc);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "profile-journal page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.router.push('/planting-records');
        } },
    ...{ class: "secondary-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "journal-grid" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.diaryEntries))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "journal-card" },
        key: (item.id),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "journal-tag" },
    });
    (item.plantName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "journal-date" },
    });
    (item.date);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "journal-note" },
    });
    (item.note);
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['profile-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-welcome']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-label']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-label']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-label']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-journal']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['journal-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['journal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['journal-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['journal-date']} */ ;
/** @type {__VLS_StyleScopedClasses['journal-note']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppLayout: AppLayout,
            router: router,
            auth: auth,
            quickActions: quickActions,
            diaryEntries: diaryEntries,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
