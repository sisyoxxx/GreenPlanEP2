import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { BUYER_CATEGORY_DEFINITIONS } from '../categoryConfig';
const router = useRouter();
const STORAGE_KEY = 'gp2_buyer_location';
const locationOptions = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆'];
const status = ref('idle');
const hint = ref('');
const selectedLocation = ref(localStorage.getItem(STORAGE_KEY) || '');
const locationButtonText = computed(() => {
    if (status.value === 'loading')
        return '定位中...';
    return selectedLocation.value ? `📍 ${selectedLocation.value}` : '定位城市';
});
watch(selectedLocation, (value) => {
    if (value) {
        localStorage.setItem(STORAGE_KEY, value);
        window.dispatchEvent(new CustomEvent('gp2-location-change', { detail: value }));
        hint.value = `已切换到 ${value}，你可以继续修改。`;
    }
    else {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('gp2-location-change', { detail: '' }));
        hint.value = '';
    }
});
function goCategory(category) {
    router.push({
        path: '/products',
        query: { category }
    });
}
function locateUser() {
    if (!navigator.geolocation) {
        hint.value = '当前浏览器不支持定位，请手动选择城市。';
        status.value = 'error';
        return;
    }
    status.value = 'loading';
    hint.value = '';
    navigator.geolocation.getCurrentPosition((position) => {
        const city = findNearestCity(position.coords.latitude, position.coords.longitude);
        selectedLocation.value = city;
        hint.value = city ? `定位成功，已设置为 ${city}。` : '定位成功，请手动选择更精确的城市。';
        status.value = 'ok';
    }, () => {
        hint.value = '定位失败，请检查权限后重试，或手动选择城市。';
        status.value = 'error';
    }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 });
}
function findNearestCity(latitude, longitude) {
    const cityCoords = {
        北京: [39.9042, 116.4074],
        上海: [31.2304, 121.4737],
        广州: [23.1291, 113.2644],
        深圳: [22.5431, 114.0579],
        杭州: [30.2741, 120.1551],
        成都: [30.5728, 104.0668],
        武汉: [30.5928, 114.3055],
        南京: [32.0603, 118.7969],
        西安: [34.3416, 108.9398],
        重庆: [29.563, 106.5516]
    };
    let closestCity = '';
    let minDistance = Number.POSITIVE_INFINITY;
    for (const [city, [lat, lon]] of Object.entries(cityCoords)) {
        const distance = (latitude - lat) ** 2 + (longitude - lon) ** 2;
        if (distance < minDistance) {
            minDistance = distance;
            closestCity = city;
        }
    }
    return closestCity;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['location-current']} */ ;
/** @type {__VLS_StyleScopedClasses['location-field']} */ ;
/** @type {__VLS_StyleScopedClasses['location-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['location-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['location-field']} */ ;
/** @type {__VLS_StyleScopedClasses['location-current']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-city-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-grid-button']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['location-head']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['location-hint']} */ ;
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
/** @type {__VLS_StyleScopedClasses['quick-city-row']} */ ;
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-list sidebar-grid-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.BUYER_CATEGORY_DEFINITIONS))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.goCategory(item.label);
            } },
        key: (item.label),
        type: "button",
        ...{ class: "sidebar-list-item sidebar-grid-item sidebar-grid-button" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "sidebar-icon" },
        'aria-hidden': "true",
    });
    (item.icon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-grid-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-item-title" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-item-desc" },
    });
    (item.desc);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section location-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "location-head" },
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
    type: "button",
    ...{ class: "location-btn" },
    ...{ class: ({ active: Boolean(__VLS_ctx.selectedLocation) }) },
    disabled: (__VLS_ctx.status === 'loading'),
});
(__VLS_ctx.locationButtonText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "location-current" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "location-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.selectedLocation || '未设置');
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "quick-city-row" },
});
for (const [option] of __VLS_getVForSourceType((__VLS_ctx.locationOptions.slice(0, 6)))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectedLocation = option;
            } },
        key: (option),
        type: "button",
        ...{ class: "quick-city-btn" },
        ...{ class: ({ active: __VLS_ctx.selectedLocation === option }) },
    });
    (option);
}
if (__VLS_ctx.hint) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "location-hint" },
    });
    (__VLS_ctx.hint);
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
/** @type {__VLS_StyleScopedClasses['sidebar-grid-button']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-grid-text']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['location-section']} */ ;
/** @type {__VLS_StyleScopedClasses['location-head']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['location-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['location-current']} */ ;
/** @type {__VLS_StyleScopedClasses['location-label']} */ ;
/** @type {__VLS_StyleScopedClasses['location-field']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-city-row']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-city-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['location-hint']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BUYER_CATEGORY_DEFINITIONS: BUYER_CATEGORY_DEFINITIONS,
            locationOptions: locationOptions,
            status: status,
            hint: hint,
            selectedLocation: selectedLocation,
            locationButtonText: locationButtonText,
            goCategory: goCategory,
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
