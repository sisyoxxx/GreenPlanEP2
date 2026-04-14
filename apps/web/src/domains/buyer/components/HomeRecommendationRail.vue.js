import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../../../core/auth/useAuthStore';
import { fetchProducts } from '../api';
const auth = useAuthStore();
const chatInput = ref('');
const products = ref([]);
const matchedRegion = ref('');
const locationStatus = ref('idle');
const locationCoords = ref(null);
const chatMessages = ref([]);
const diaryEntries = [
    { id: 1, title: '番茄育苗第7天', plantName: '番茄', date: '2026-04-10', note: '已出芽，保持通风和散射光。' },
    { id: 2, title: '月季播种第3天', plantName: '月季', date: '2026-04-11', note: '土壤湿润度正常，等待发芽。' },
    { id: 3, title: '罗勒修剪记录', plantName: '罗勒', date: '2026-04-12', note: '顶部摘心后侧芽开始生长，适合继续控水。' }
];
const contentRecommendations = [
    { title: '春播家庭指南', desc: '结合地区温度与空间条件，挑选更容易成活的品类。' },
    { title: '阳台种植避坑清单', desc: '适合新手快速了解光照、浇水和通风的关键细节。' },
    { title: '小空间种植灵感', desc: '适合阳台、窗台和室内角落的内容推荐。' }
];
const locationTitle = computed(() => {
    if (locationStatus.value === 'loading')
        return '正在获取定位...';
    if (locationStatus.value === 'success')
        return locationCoords.value ? `已定位到附近区域（${locationCoords.value.latitude.toFixed(2)}, ${locationCoords.value.longitude.toFixed(2)}）` : '已完成定位';
    if (locationStatus.value === 'denied')
        return '定位权限已拒绝';
    if (locationStatus.value === 'unsupported')
        return '当前浏览器不支持定位';
    if (locationStatus.value === 'error')
        return '定位失败';
    return '等待定位授权';
});
const locationDescription = computed(() => {
    if (locationStatus.value === 'success')
        return matchedRegion.value ? `已按 ${matchedRegion.value} 优先推荐适合你的商品。` : '已获取定位，但暂未匹配到明确地区，将展示默认推荐。';
    if (locationStatus.value === 'denied')
        return '你可以稍后重新授权定位，也可以先浏览默认推荐。';
    if (locationStatus.value === 'unsupported')
        return '请更换支持定位的浏览器或设备。';
    if (locationStatus.value === 'error')
        return '定位不可用，当前展示默认推荐。';
    if (locationStatus.value === 'loading')
        return '授权后将根据地理位置推荐商品。';
    return '登录前会主动请求定位，并根据区域展示商品推荐。';
});
const regionalRecommendations = computed(() => {
    if (!products.value.length)
        return [];
    if (!matchedRegion.value)
        return products.value.slice(0, 3);
    const matched = products.value.filter((item) => item.suitableRegion?.includes(matchedRegion.value));
    return (matched.length ? matched : products.value).slice(0, 3);
});
onMounted(async () => {
    products.value = await fetchProducts();
    if (!auth.isLoggedIn)
        requestLocation();
});
function requestLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        locationStatus.value = 'unsupported';
        return;
    }
    locationStatus.value = 'loading';
    navigator.geolocation.getCurrentPosition((position) => {
        locationCoords.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        matchedRegion.value = mapCoordsToRegion(position.coords.latitude, position.coords.longitude);
        locationStatus.value = 'success';
    }, (error) => {
        locationStatus.value = error.code === error.PERMISSION_DENIED ? 'denied' : 'error';
        matchedRegion.value = '';
    }, { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 });
}
function mapCoordsToRegion(latitude, longitude) {
    if (longitude >= 118 && latitude >= 20 && latitude <= 36)
        return '华东';
    if (longitude >= 108 && longitude < 118 && latitude >= 20 && latitude <= 30)
        return '华南';
    if (longitude >= 112 && longitude <= 123 && latitude > 36)
        return '华北';
    if (longitude >= 104 && longitude < 112 && latitude >= 25 && latitude <= 34)
        return '华中';
    if (longitude < 104 && latitude >= 23 && latitude <= 34)
        return '西南';
    if (longitude < 110 && latitude > 34)
        return '西北';
    return '东北';
}
function sendChat() {
    const text = chatInput.value.trim();
    if (!text)
        return;
    chatMessages.value.push({ id: Date.now(), role: 'user', text });
    chatMessages.value.push({
        id: Date.now() + 1,
        role: 'assistant',
        text: matchedRegion.value
            ? `结合你当前匹配到的${matchedRegion.value}地区，我建议优先关注耐热或适合当季播种的商品，也可以先看看右侧推荐卡片。`
            : '可以先授权定位，我会优先按地区推荐；如果暂不定位，也可以根据阳台光照和季节先选基础蔬菜或香草类商品。'
    });
    chatInput.value = '';
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-window']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-window']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-message']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-message']} */ ;
/** @type {__VLS_StyleScopedClasses['is-user']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input-row']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "home-sidebar right-sidebar page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section smart-header-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "sidebar-item-desc" },
});
if (!__VLS_ctx.auth.isLoggedIn) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.requestLocation) },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section status-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-item-title" },
});
(__VLS_ctx.locationTitle);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-item-desc" },
});
(__VLS_ctx.locationDescription);
if (__VLS_ctx.matchedRegion) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "region-chip" },
    });
    (__VLS_ctx.matchedRegion);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "recommend-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.regionalRecommendations))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "recommend-card" },
        key: (item.id),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "recommend-badge" },
    });
    (item.suitableRegion || '通用推荐');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-item-title" },
    });
    (item.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-item-desc" },
    });
    (item.description);
}
if (!__VLS_ctx.auth.isLoggedIn) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "sidebar-section ai-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "section-subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-item-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-window" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-bubble assistant" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.chatMessages))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.id),
            ...{ class: "chat-message" },
            ...{ class: (item.role === 'user' ? 'is-user' : 'is-assistant') },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chat-bubble" },
        });
        (item.text);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-input-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onKeyup: (__VLS_ctx.sendChat) },
        value: (__VLS_ctx.chatInput),
        type: "text",
        placeholder: "例如：适合华南阳台种植什么？",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.sendChat) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "sidebar-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "section-subtitle" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.contentRecommendations))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            ...{ class: "notice-card" },
            key: (item.title),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "sidebar-item-title" },
        });
        (item.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "sidebar-item-desc" },
        });
        (item.desc);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "sidebar-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "section-subtitle" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.diaryEntries))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            ...{ class: "notice-card diary-card" },
            key: (item.id),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "sidebar-item-title" },
        });
        (item.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "diary-meta" },
        });
        (item.plantName);
        (item.date);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "sidebar-item-desc" },
        });
        (item.note);
    }
}
/** @type {__VLS_StyleScopedClasses['home-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['right-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['smart-header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['status-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['region-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend-list']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend-card']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-window']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['assistant']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-message']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input-row']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-card']} */ ;
/** @type {__VLS_StyleScopedClasses['diary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['diary-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            auth: auth,
            chatInput: chatInput,
            matchedRegion: matchedRegion,
            chatMessages: chatMessages,
            diaryEntries: diaryEntries,
            contentRecommendations: contentRecommendations,
            locationTitle: locationTitle,
            locationDescription: locationDescription,
            regionalRecommendations: regionalRecommendations,
            requestLocation: requestLocation,
            sendChat: sendChat,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
