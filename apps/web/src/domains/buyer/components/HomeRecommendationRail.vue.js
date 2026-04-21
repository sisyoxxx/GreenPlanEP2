import { computed, ref, watch } from 'vue';
const STORAGE_KEY = 'gp2_buyer_location';
const locationOptions = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆'];
const status = ref('idle');
const hint = ref('');
const selectedLocation = ref(localStorage.getItem(STORAGE_KEY) || '');
const currentLocation = computed(() => selectedLocation.value);
watch(selectedLocation, (value) => {
    if (value) {
        localStorage.setItem(STORAGE_KEY, value);
        hint.value = `已切换为 ${value}，你可以随时再次修改。`;
    }
    else {
        localStorage.removeItem(STORAGE_KEY);
        hint.value = '';
    }
});
function locateUser() {
    if (!navigator.geolocation) {
        hint.value = '当前浏览器不支持定位，请手动选择地区。';
        status.value = 'error';
        return;
    }
    status.value = 'loading';
    hint.value = '';
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        selectedLocation.value = `已定位 (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
        hint.value = '定位成功，你也可以通过下拉框重新修改地区。';
        status.value = 'ok';
    }, () => {
        hint.value = '定位失败，请检查浏览器权限或直接手动选择地区。';
        status.value = 'error';
    }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['location-field']} */ ;
/** @type {__VLS_StyleScopedClasses['location-current']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-copy']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "home-sidebar right-sidebar page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section location-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "sidebar-item-desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.locateUser) },
    ...{ class: "secondary-btn" },
    disabled: (__VLS_ctx.status === 'loading'),
});
(__VLS_ctx.status === 'loading' ? '定位中...' : __VLS_ctx.currentLocation ? '重新定位' : '定位');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "location-current" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "location-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.currentLocation || '尚未设置');
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "location-field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.selectedLocation),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
});
for (const [option] of __VLS_getVForSourceType((__VLS_ctx.locationOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (option),
        value: (option),
    });
    (option);
}
if (__VLS_ctx.hint) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "location-hint" },
    });
    (__VLS_ctx.hint);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section ai-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "sidebar-item-desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "ai-badge" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-placeholder" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-orb" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-feature-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-feature-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-feature-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-feature-item" },
});
/** @type {__VLS_StyleScopedClasses['home-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['right-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['location-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['location-current']} */ ;
/** @type {__VLS_StyleScopedClasses['location-label']} */ ;
/** @type {__VLS_StyleScopedClasses['location-field']} */ ;
/** @type {__VLS_StyleScopedClasses['location-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-head']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-feature-list']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-feature-item']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-feature-item']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-feature-item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            locationOptions: locationOptions,
            status: status,
            hint: hint,
            selectedLocation: selectedLocation,
            currentLocation: currentLocation,
            locateUser: locateUser,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
