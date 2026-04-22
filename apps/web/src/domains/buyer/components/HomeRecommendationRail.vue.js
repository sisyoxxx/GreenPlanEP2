import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { aiChat } from '../api';
const cityProfiles = {
    北京: {
        cityText: '北京',
        climateHint: '昼夜温差较大，早晚注意保温和防风。',
        careHint: '中午光照强时可短时遮阴，避免幼苗失水。',
        cropHint: '生菜、菠菜、小番茄更容易稳定出苗。'
    },
    上海: {
        cityText: '上海',
        climateHint: '湿度偏高，盆土宁干勿湿，防止闷根。',
        careHint: '梅雨季加强通风，降低霉菌和黑腐风险。',
        cropHint: '罗勒、薄荷、空心菜在温暖季表现更好。'
    },
    广州: {
        cityText: '广州',
        climateHint: '高温高湿时优先选耐热品种并控水。',
        careHint: '暴雨后及时排水，避免积水导致根系缺氧。',
        cropHint: '秋葵、空心菜、辣椒更适配本地气候。'
    },
    深圳: {
        cityText: '深圳',
        climateHint: '长夏型气候，优先耐热快生长期品种。',
        careHint: '阳台种植建议早晚浇水，减少日灼。',
        cropHint: '香草类和叶菜类可采用少量多次轮播。'
    },
    杭州: {
        cityText: '杭州',
        climateHint: '梅雨与高温交替，重点做通风和排水。',
        careHint: '温差变化时逐步调整浇水，避免骤增骤减。',
        cropHint: '小番茄、罗勒、樱桃萝卜上手更友好。'
    },
    成都: {
        cityText: '成都',
        climateHint: '光照偏弱时可补充反光板或补光灯。',
        careHint: '阴雨连续天减少浇水频次，防烂根。',
        cropHint: '生菜、香菜、豌豆苗适合持续轮播。'
    },
    武汉: {
        cityText: '武汉',
        climateHint: '夏季闷热，需重点关注遮阴与通风。',
        careHint: '中午高温时段避免施肥，防止肥害。',
        cropHint: '耐热叶菜和辣椒类更容易稳定生长。'
    },
    南京: {
        cityText: '南京',
        climateHint: '四季分明，建议按季切换播种清单。',
        careHint: '换季时逐步调整光照时长和浇水量。',
        cropHint: '春秋可优先叶菜，夏季加大耐热品种比例。'
    },
    西安: {
        cityText: '西安',
        climateHint: '气候偏干燥，土壤需保持轻微湿润。',
        careHint: '建议采用覆盖保湿，减少水分蒸发过快。',
        cropHint: '番茄、辣椒、香草类在光照足时表现稳定。'
    },
    重庆: {
        cityText: '重庆',
        climateHint: '高温高湿且连续阴雨，防闷根优先。',
        careHint: '雨季缩短浇水间隔并加强病害巡查。',
        cropHint: '空心菜、苋菜等耐热品种更省心。'
    }
};
const defaultProfile = {
    cityText: '你所在地区',
    climateHint: '优先选择抗逆性高、养护简单的品种。',
    careHint: '先建立稳定浇水和通风节奏，再逐步加肥。',
    cropHint: '叶菜和香草类适合分批补种，持续采收。'
};
const chatCollapsed = ref(false);
const chatInput = ref('');
const chatSending = ref(false);
const chatMessages = ref([]);
const chatBodyRef = ref(null);
const currentLocation = ref(localStorage.getItem('gp2_buyer_location') || '');
const month = computed(() => new Date().getMonth() + 1);
const seasonLabel = computed(() => {
    if (month.value >= 3 && month.value <= 5)
        return '春季';
    if (month.value >= 6 && month.value <= 8)
        return '夏季';
    if (month.value >= 9 && month.value <= 11)
        return '秋季';
    return '冬季';
});
const cityProfile = computed(() => {
    return cityProfiles[currentLocation.value] || defaultProfile;
});
const recommendations = computed(() => {
    return [
        {
            title: `${cityProfile.value.cityText} · ${seasonLabel.value}当季优选`,
            desc: cityProfile.value.climateHint
        },
        {
            title: `${month.value} 月养护重点`,
            desc: cityProfile.value.careHint
        },
        {
            title: '补种与复购建议',
            desc: cityProfile.value.cropHint
        }
    ];
});
const tips = computed(() => {
    const base = [
        '播种前先浸种 4-8 小时，提升发芽稳定性。',
        '盆土保持微湿不积水，避免闷根和烂根。',
        '每周固定巡查黄叶与虫害，及早处理。'
    ];
    if (seasonLabel.value === '夏季') {
        return [...base, '夏季中午避免施肥，建议早晚补水并适度遮阴。'];
    }
    if (seasonLabel.value === '冬季') {
        return [...base, '冬季注意保温和补光，浇水频率可适当降低。'];
    }
    if (seasonLabel.value === '春季') {
        return [...base, '春季生长快，建议每 7-10 天补一次薄肥。'];
    }
    return [...base, '秋季温差增大，夜间注意防寒并逐步控水。'];
});
onMounted(() => {
    window.addEventListener('storage', syncLocation);
    window.addEventListener('gp2-location-change', syncLocation);
});
onUnmounted(() => {
    window.removeEventListener('storage', syncLocation);
    window.removeEventListener('gp2-location-change', syncLocation);
});
function syncLocation() {
    currentLocation.value = localStorage.getItem('gp2_buyer_location') || '';
}
async function sendChat() {
    const question = chatInput.value.trim();
    if (!question || chatSending.value)
        return;
    const idBase = Date.now();
    chatMessages.value.push({ id: idBase, role: 'user', content: question });
    chatInput.value = '';
    await nextTick();
    scrollChatToBottom();
    chatSending.value = true;
    try {
        const payload = [
            {
                role: 'system',
                content: `你是家庭种植助手，请给出简洁、可执行、分步骤建议。当前城市：${cityProfile.value.cityText}；当前季节：${seasonLabel.value}。`
            },
            ...chatMessages.value.map((m) => ({ role: m.role, content: m.content }))
        ];
        const res = await aiChat(payload);
        chatMessages.value.push({ id: idBase + 1, role: 'assistant', content: res.content });
    }
    catch (err) {
        const msg = err?.response?.data?.message || err?.message || 'AI 请求失败';
        chatMessages.value.push({ id: idBase + 1, role: 'assistant', content: `提示：${msg}` });
    }
    finally {
        chatSending.value = false;
        await nextTick();
        scrollChatToBottom();
    }
}
function scrollChatToBottom() {
    const el = chatBodyRef.value;
    if (!el)
        return;
    el.scrollTop = el.scrollHeight;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['chat-row']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-row']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['assistant']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['tips-list']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "home-sidebar right-sidebar page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section chat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "sidebar-item-desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.chatCollapsed = !__VLS_ctx.chatCollapsed;
        } },
    type: "button",
    ...{ class: "collapse-btn" },
});
(__VLS_ctx.chatCollapsed ? '展开' : '收起');
if (!__VLS_ctx.chatCollapsed) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ref: "chatBodyRef",
        ...{ class: "chat-body" },
    });
    /** @type {typeof __VLS_ctx.chatBodyRef} */ ;
    if (__VLS_ctx.chatMessages.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chat-empty" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chat-thread" },
        });
        for (const [msg] of __VLS_getVForSourceType((__VLS_ctx.chatMessages))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (msg.id),
                ...{ class: "chat-row" },
                ...{ class: (msg.role) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "chat-bubble" },
                ...{ class: (msg.role) },
            });
            (msg.content);
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-input-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onKeydown: (__VLS_ctx.sendChat) },
        value: (__VLS_ctx.chatInput),
        type: "text",
        ...{ class: "chat-input" },
        placeholder: "例如：番茄叶片发黄怎么办？",
        disabled: (__VLS_ctx.chatSending),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.sendChat) },
        ...{ class: "chat-send-btn" },
        disabled: (__VLS_ctx.chatSending || !__VLS_ctx.chatInput),
    });
    (__VLS_ctx.chatSending ? '发送中...' : '发送');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "recommend-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.recommendations))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (item.title),
        ...{ class: "recommend-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "recommend-title" },
    });
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (item.desc);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "tips-list" },
});
for (const [tip] of __VLS_getVForSourceType((__VLS_ctx.tips))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (tip),
    });
    (tip);
}
/** @type {__VLS_StyleScopedClasses['home-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['right-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-head']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-body']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-thread']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-row']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input-row']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend-list']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tips-list']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            chatCollapsed: chatCollapsed,
            chatInput: chatInput,
            chatSending: chatSending,
            chatMessages: chatMessages,
            chatBodyRef: chatBodyRef,
            recommendations: recommendations,
            tips: tips,
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
