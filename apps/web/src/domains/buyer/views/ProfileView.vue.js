import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '../../../layouts/AppLayout.vue';
import { useAuthStore } from '../../../core/auth/useAuthStore';
import { useBuyerCartStore } from '../stores/useBuyerCartStore';
import { useBuyerFavoritesStore } from '../stores/useBuyerFavoritesStore';
import { createMyAddress, deleteMyAddress, fetchMyAddresses, fetchMyOrders, fetchMyProfile, updateMyAddress, updateMyProfile } from '../api';
const router = useRouter();
const auth = useAuthStore();
const cartStore = useBuyerCartStore();
const favoritesStore = useBuyerFavoritesStore();
const activeTab = ref('basic');
const quickPanel = ref('none');
const loadingProfile = ref(false);
const savingProfile = ref(false);
const profileTip = ref('');
const loadingAddresses = ref(false);
const addingAddress = ref(false);
const addressTip = ref('');
const profile = ref(null);
const addresses = ref([]);
const form = reactive({
    nickname: '',
    gender: '',
    phone: '',
    avatarDataUrl: ''
});
const avatarPreview = computed(() => form.avatarDataUrl || '');
const displayName = computed(() => (form.nickname || '').trim() || auth.user?.username || '用户');
const favoriteTutorialCount = computed(() => favoritesStore.tutorialIds.length);
const favoritePostCount = computed(() => favoritesStore.posts.length);
const quickOrderKeyword = ref('');
const quickOrders = ref([]);
const quickOrdersLoading = ref(false);
const quickOrdersLoaded = ref(false);
const quickOrdersError = ref('');
const quickPlants = [
    { name: '番茄', icon: '🍅', status: '育苗中' },
    { name: '薄荷', icon: '🌿', status: '生长旺盛' },
    { name: '草莓', icon: '🍓', status: '开花中' },
    { name: '罗勒', icon: '🌱', status: '已定植' }
];
const quickPanelTitle = computed(() => {
    if (quickPanel.value === 'orders')
        return '快捷订单';
    if (quickPanel.value === 'records')
        return '种植记录预览';
    if (quickPanel.value === 'cart')
        return '购物车预览';
    if (quickPanel.value === 'favorites')
        return '收藏预览';
    return '';
});
const quickPanelDesc = computed(() => {
    if (quickPanel.value === 'orders')
        return '在这里快速搜索订单，点击后再进入订单详情页。';
    if (quickPanel.value === 'records')
        return '只读展示你当前在种的植物进度。';
    if (quickPanel.value === 'cart')
        return '显示最近加入购物车的商品摘要。';
    if (quickPanel.value === 'favorites')
        return '展示教程与帖子收藏数量。';
    return '';
});
const quickFilteredOrders = computed(() => {
    const keyword = quickOrderKeyword.value.trim().toLowerCase();
    if (!keyword)
        return quickOrders.value;
    return quickOrders.value.filter((order) => order.orderNo.toLowerCase().includes(keyword) ||
        order.items.some((item) => item.productName.toLowerCase().includes(keyword)));
});
const newAddressText = ref('');
const newAddressDefault = ref(false);
const editingId = ref(null);
const editAddressText = ref('');
const editAddressDefault = ref(false);
const savingEdit = ref(false);
const deletingId = ref(null);
const avatarViewerOpen = ref(false);
onMounted(async () => {
    await loadProfile();
    await loadAddresses();
});
watch(activeTab, async (tab) => {
    if (tab === 'addresses' && addresses.value.length === 0) {
        await loadAddresses();
    }
});
async function reloadAll() {
    profileTip.value = '';
    addressTip.value = '';
    quickOrdersLoaded.value = false;
    await Promise.all([loadProfile(), loadAddresses()]);
    if (quickPanel.value === 'orders') {
        await loadQuickOrders(true);
    }
}
async function loadProfile() {
    if (loadingProfile.value)
        return;
    loadingProfile.value = true;
    profileTip.value = '';
    try {
        const data = await fetchMyProfile();
        profile.value = data;
        form.nickname = data.nickname || '';
        form.gender = data.gender || '';
        form.phone = data.phone || '';
        form.avatarDataUrl = data.avatarDataUrl || '';
        auth.syncUserProfile({
            nickname: data.nickname || null,
            avatarDataUrl: data.avatarDataUrl || null
        });
    }
    catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
            profileTip.value = '后端未启动个人资料接口，请重启后端服务后再试';
        }
        else {
            profileTip.value = err?.response?.data?.message || '个人信息加载失败';
        }
    }
    finally {
        loadingProfile.value = false;
    }
}
async function saveProfile() {
    if (savingProfile.value)
        return;
    savingProfile.value = true;
    profileTip.value = '';
    try {
        const saved = await updateMyProfile({
            nickname: (form.nickname || '').trim() || null,
            gender: (form.gender || '').trim() || null,
            phone: (form.phone || '').trim() || null,
            avatarDataUrl: form.avatarDataUrl || null
        });
        profile.value = saved;
        auth.syncUserProfile({
            nickname: saved.nickname || null,
            avatarDataUrl: saved.avatarDataUrl || null
        });
        profileTip.value = '已保存';
    }
    catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
            profileTip.value = '保存失败：后端未启动个人资料接口，请重启后端服务';
        }
        else {
            profileTip.value = err?.response?.data?.message || '保存失败';
        }
    }
    finally {
        savingProfile.value = false;
    }
}
function clearAvatar() {
    form.avatarDataUrl = '';
    profileTip.value = '已移除头像，点击保存生效';
}
async function onAvatarChange(e) {
    const input = e.target;
    const file = input?.files?.[0];
    if (!file)
        return;
    profileTip.value = '';
    const reader = new FileReader();
    reader.onload = () => {
        const result = String(reader.result || '');
        form.avatarDataUrl = result;
        profileTip.value = '头像已选择，点击保存生效';
    };
    reader.onerror = () => {
        profileTip.value = '头像读取失败，请重试';
    };
    reader.readAsDataURL(file);
}
function openAvatarViewer() {
    avatarViewerOpen.value = true;
}
function closeAvatarViewer() {
    avatarViewerOpen.value = false;
}
function openQuickPanel(panel) {
    quickPanel.value = quickPanel.value === panel ? 'none' : panel;
    if (quickPanel.value === 'orders') {
        loadQuickOrders();
    }
}
async function loadQuickOrders(force = false) {
    if (quickOrdersLoading.value)
        return;
    if (!force && quickOrdersLoaded.value)
        return;
    quickOrdersLoading.value = true;
    quickOrdersError.value = '';
    try {
        quickOrders.value = await fetchMyOrders();
        quickOrdersLoaded.value = true;
    }
    catch (err) {
        quickOrdersError.value = err?.response?.data?.message || '订单加载失败';
    }
    finally {
        quickOrdersLoading.value = false;
    }
}
function goOrderDetail(order) {
    router.push(`/orders?focus=${order.id}`);
}
function statusLabel(status) {
    const map = {
        PENDING: '待支付',
        PAID: '待发货',
        SHIPPED: '运输中',
        DELIVERED: '已签收'
    };
    return map[status] || status;
}
function formatDateTime(value) {
    if (!value)
        return '时间未记录';
    return value.replace('T', ' ').slice(0, 16);
}
async function loadAddresses() {
    if (loadingAddresses.value)
        return;
    loadingAddresses.value = true;
    addressTip.value = '';
    try {
        addresses.value = await fetchMyAddresses();
    }
    catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
            addressTip.value = '后端未启动地址接口，请重启后端服务后再试';
        }
        else {
            addressTip.value = err?.response?.data?.message || '地址加载失败';
        }
    }
    finally {
        loadingAddresses.value = false;
    }
}
async function addAddress() {
    const text = newAddressText.value.trim();
    if (!text || addingAddress.value)
        return;
    addingAddress.value = true;
    addressTip.value = '';
    try {
        await createMyAddress({ addressText: text, isDefault: newAddressDefault.value });
        newAddressText.value = '';
        newAddressDefault.value = false;
        await loadAddresses();
        addressTip.value = '已新增地址';
    }
    catch (err) {
        addressTip.value = err?.response?.data?.message || '新增失败';
    }
    finally {
        addingAddress.value = false;
    }
}
function startEdit(addr) {
    editingId.value = addr.id;
    editAddressText.value = addr.addressText;
    editAddressDefault.value = !!addr.isDefault;
    addressTip.value = '';
}
function cancelEdit() {
    editingId.value = null;
    editAddressText.value = '';
    editAddressDefault.value = false;
}
async function saveEdit(id) {
    if (savingEdit.value)
        return;
    const text = editAddressText.value.trim();
    if (!text) {
        addressTip.value = '地址内容不能为空';
        return;
    }
    savingEdit.value = true;
    addressTip.value = '';
    try {
        await updateMyAddress(id, { addressText: text, isDefault: editAddressDefault.value });
        await loadAddresses();
        cancelEdit();
        addressTip.value = '已保存';
    }
    catch (err) {
        addressTip.value = err?.response?.data?.message || '保存失败';
    }
    finally {
        savingEdit.value = false;
    }
}
async function removeAddress(id) {
    if (deletingId.value)
        return;
    deletingId.value = id;
    addressTip.value = '';
    try {
        await deleteMyAddress(id);
        await loadAddresses();
        if (editingId.value === id)
            cancelEdit();
        addressTip.value = '已删除';
    }
    catch (err) {
        addressTip.value = err?.response?.data?.message || '删除失败';
    }
    finally {
        deletingId.value = null;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-order-item']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-order-item']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-status']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-status']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-status']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-status']} */ ;
/** @type {__VLS_StyleScopedClasses['file-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['address-add']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-content']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-content']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-page']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-page']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-content']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['content-head']} */ ;
/** @type {__VLS_StyleScopedClasses['address-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['viewer-body']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppLayout, typeof AppLayout, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppLayout, new AppLayout({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "profile-nav page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.openAvatarViewer) },
    ...{ class: "avatar clickable" },
    role: "button",
    tabindex: "0",
});
if (__VLS_ctx.avatarPreview) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.avatarPreview),
        alt: "avatar",
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    ((__VLS_ctx.displayName.charAt(0) || 'U').toUpperCase());
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-meta" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
    ...{ class: "display-name" },
});
(__VLS_ctx.displayName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "username" },
});
(__VLS_ctx.auth.user?.username || '-');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-items" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'basic';
        } },
    type: "button",
    ...{ class: "nav-btn" },
    ...{ class: ({ active: __VLS_ctx.activeTab === 'basic' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'addresses';
        } },
    type: "button",
    ...{ class: "nav-btn" },
    ...{ class: ({ active: __VLS_ctx.activeTab === 'addresses' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-links" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "nav-section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.openQuickPanel('cart');
        } },
    type: "button",
    ...{ class: "nav-link-btn" },
    ...{ class: ({ active: __VLS_ctx.quickPanel === 'cart' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.openQuickPanel('orders');
        } },
    type: "button",
    ...{ class: "nav-link-btn" },
    ...{ class: ({ active: __VLS_ctx.quickPanel === 'orders' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.openQuickPanel('records');
        } },
    type: "button",
    ...{ class: "nav-link-btn" },
    ...{ class: ({ active: __VLS_ctx.quickPanel === 'records' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.openQuickPanel('favorites');
        } },
    type: "button",
    ...{ class: "nav-link-btn" },
    ...{ class: ({ active: __VLS_ctx.quickPanel === 'favorites' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-foot" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.reloadAll) },
    type: "button",
    ...{ class: "secondary-btn" },
    disabled: (__VLS_ctx.loadingProfile || __VLS_ctx.savingProfile),
});
(__VLS_ctx.loadingProfile ? '刷新中...' : '刷新');
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "profile-content" },
});
if (__VLS_ctx.loadingProfile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-lite content-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "desc" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-stack" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "page-lite stats-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stats-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "stats-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "head-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loadingProfile))
                    return;
                __VLS_ctx.router.push('/products');
            } },
        type: "button",
        ...{ class: "secondary-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loadingProfile))
                    return;
                __VLS_ctx.router.push('/community');
            } },
        type: "button",
        ...{ class: "secondary-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stats-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-tile" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.cartStore.uniqueCount);
    (__VLS_ctx.cartStore.itemCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-tile" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.favoriteTutorialCount);
    (__VLS_ctx.favoritePostCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-tile" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.addresses.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-tile" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.auth.user?.username || '-');
    if (__VLS_ctx.quickPanel !== 'none') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            ...{ class: "page-lite quick-preview" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "content-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
        (__VLS_ctx.quickPanelTitle);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "desc" },
        });
        (__VLS_ctx.quickPanelDesc);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "head-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loadingProfile))
                        return;
                    if (!(__VLS_ctx.quickPanel !== 'none'))
                        return;
                    __VLS_ctx.quickPanel = 'none';
                } },
            type: "button",
            ...{ class: "secondary-btn" },
        });
        if (__VLS_ctx.quickPanel === 'orders') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "quick-search-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                value: (__VLS_ctx.quickOrderKeyword),
                type: "text",
                placeholder: "搜索订单号或商品名",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loadingProfile))
                            return;
                        if (!(__VLS_ctx.quickPanel !== 'none'))
                            return;
                        if (!(__VLS_ctx.quickPanel === 'orders'))
                            return;
                        __VLS_ctx.loadQuickOrders(true);
                    } },
                type: "button",
                ...{ class: "secondary-btn" },
                disabled: (__VLS_ctx.quickOrdersLoading),
            });
            (__VLS_ctx.quickOrdersLoading ? '加载中...' : '刷新');
            if (__VLS_ctx.quickOrdersLoading && __VLS_ctx.quickOrders.length === 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "empty" },
                });
            }
            else if (__VLS_ctx.quickOrdersError) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "empty" },
                });
                (__VLS_ctx.quickOrdersError);
            }
            else if (__VLS_ctx.quickFilteredOrders.length === 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "empty" },
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "quick-order-list" },
                });
                for (const [order] of __VLS_getVForSourceType((__VLS_ctx.quickFilteredOrders))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                        ...{ onClick: (...[$event]) => {
                                if (!!(__VLS_ctx.loadingProfile))
                                    return;
                                if (!(__VLS_ctx.quickPanel !== 'none'))
                                    return;
                                if (!(__VLS_ctx.quickPanel === 'orders'))
                                    return;
                                if (!!(__VLS_ctx.quickOrdersLoading && __VLS_ctx.quickOrders.length === 0))
                                    return;
                                if (!!(__VLS_ctx.quickOrdersError))
                                    return;
                                if (!!(__VLS_ctx.quickFilteredOrders.length === 0))
                                    return;
                                __VLS_ctx.goOrderDetail(order);
                            } },
                        key: (order.id),
                        ...{ class: "quick-order-item" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
                    (order.orderNo);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                        ...{ class: "sub" },
                    });
                    (__VLS_ctx.formatDateTime(order.createdAt));
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: (['quick-status', `status-${order.status}`]) },
                    });
                    (__VLS_ctx.statusLabel(order.status));
                }
            }
        }
        else if (__VLS_ctx.quickPanel === 'records') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "quick-plant-list" },
            });
            for (const [plant] of __VLS_getVForSourceType((__VLS_ctx.quickPlants))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                    key: (plant.name),
                    ...{ class: "quick-plant-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
                (plant.icon);
                (plant.name);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    ...{ class: "sub" },
                });
                (plant.status);
            }
        }
        else if (__VLS_ctx.quickPanel === 'cart') {
            if (__VLS_ctx.cartStore.items.length === 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "empty" },
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "quick-cart-list" },
                });
                for (const [item] of __VLS_getVForSourceType((__VLS_ctx.cartStore.items.slice(0, 6)))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                        key: (item.id),
                        ...{ class: "quick-cart-item" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
                    (item.name);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                        ...{ class: "sub" },
                    });
                    (item.quantity);
                    (item.price.toFixed(2));
                }
            }
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "quick-fav-summary" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stat-tile" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stat-label" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                ...{ class: "stat-value" },
            });
            (__VLS_ctx.favoriteTutorialCount);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stat-tile" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stat-label" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                ...{ class: "stat-value" },
            });
            (__VLS_ctx.favoritePostCount);
        }
    }
    if (__VLS_ctx.activeTab === 'basic') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            ...{ class: "page-lite content-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "content-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "desc" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "head-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.saveProfile) },
            type: "button",
            disabled: (__VLS_ctx.savingProfile),
        });
        (__VLS_ctx.savingProfile ? '保存中...' : '保存');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field span-2" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "avatar-editor" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (__VLS_ctx.openAvatarViewer) },
            ...{ class: "avatar large clickable" },
            role: "button",
            tabindex: "0",
        });
        if (__VLS_ctx.avatarPreview) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                src: (__VLS_ctx.avatarPreview),
                alt: "avatar",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            ((__VLS_ctx.displayName.charAt(0) || 'U').toUpperCase());
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "avatar-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "btn-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            ...{ class: "file-btn secondary-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onChange: (__VLS_ctx.onAvatarChange) },
            type: "file",
            accept: "image/*",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "hint" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            value: (__VLS_ctx.form.nickname),
            type: "text",
            placeholder: "未填写则默认使用账号名",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: (__VLS_ctx.form.gender),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: "",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: "男",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: "女",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field span-2" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            value: (__VLS_ctx.form.phone),
            type: "text",
            placeholder: "例如 13800000000",
        });
        if (__VLS_ctx.profileTip) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "tip" },
            });
            (__VLS_ctx.profileTip);
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            ...{ class: "page-lite content-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "content-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "desc" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "head-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.loadAddresses) },
            type: "button",
            ...{ class: "secondary-btn" },
            disabled: (__VLS_ctx.loadingAddresses),
        });
        (__VLS_ctx.loadingAddresses ? '刷新中...' : '刷新地址');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "address-add" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
            value: (__VLS_ctx.newAddressText),
            rows: "3",
            placeholder: "填写收货地址（可包含省市区、街道门牌等）",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "address-add-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            ...{ class: "check" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            type: "checkbox",
        });
        (__VLS_ctx.newAddressDefault);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "btn-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.addAddress) },
            type: "button",
            disabled: (__VLS_ctx.addingAddress || !__VLS_ctx.newAddressText.trim()),
        });
        (__VLS_ctx.addingAddress ? '新增中...' : '新增地址');
        if (__VLS_ctx.addresses.length === 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "empty" },
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "address-list" },
            });
            for (const [addr] of __VLS_getVForSourceType((__VLS_ctx.addresses))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                    key: (addr.id),
                    ...{ class: "address-card" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "address-main" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "address-tags" },
                });
                if (addr.isDefault) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "tag" },
                    });
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "sub" },
                });
                (addr.id);
                if (__VLS_ctx.editingId !== addr.id) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "address-text" },
                    });
                    (addr.addressText);
                }
                else {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "address-edit" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
                        value: (__VLS_ctx.editAddressText),
                        rows: "3",
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "check" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                        type: "checkbox",
                    });
                    (__VLS_ctx.editAddressDefault);
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "address-actions" },
                });
                if (__VLS_ctx.editingId !== addr.id) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                        ...{ onClick: (...[$event]) => {
                                if (!!(__VLS_ctx.loadingProfile))
                                    return;
                                if (!!(__VLS_ctx.activeTab === 'basic'))
                                    return;
                                if (!!(__VLS_ctx.addresses.length === 0))
                                    return;
                                if (!(__VLS_ctx.editingId !== addr.id))
                                    return;
                                __VLS_ctx.startEdit(addr);
                            } },
                        type: "button",
                        ...{ class: "secondary-btn" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                        ...{ onClick: (...[$event]) => {
                                if (!!(__VLS_ctx.loadingProfile))
                                    return;
                                if (!!(__VLS_ctx.activeTab === 'basic'))
                                    return;
                                if (!!(__VLS_ctx.addresses.length === 0))
                                    return;
                                if (!(__VLS_ctx.editingId !== addr.id))
                                    return;
                                __VLS_ctx.removeAddress(addr.id);
                            } },
                        type: "button",
                        ...{ class: "danger-btn" },
                        disabled: (__VLS_ctx.deletingId === addr.id),
                    });
                    (__VLS_ctx.deletingId === addr.id ? '删除中...' : '删除');
                }
                else {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                        ...{ onClick: (...[$event]) => {
                                if (!!(__VLS_ctx.loadingProfile))
                                    return;
                                if (!!(__VLS_ctx.activeTab === 'basic'))
                                    return;
                                if (!!(__VLS_ctx.addresses.length === 0))
                                    return;
                                if (!!(__VLS_ctx.editingId !== addr.id))
                                    return;
                                __VLS_ctx.saveEdit(addr.id);
                            } },
                        type: "button",
                        disabled: (__VLS_ctx.savingEdit),
                    });
                    (__VLS_ctx.savingEdit ? '保存中...' : '保存');
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                        ...{ onClick: (__VLS_ctx.cancelEdit) },
                        type: "button",
                        ...{ class: "secondary-btn" },
                    });
                }
            }
        }
        if (__VLS_ctx.addressTip) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "tip" },
            });
            (__VLS_ctx.addressTip);
        }
    }
}
const __VLS_4 = {}.Teleport;
/** @type {[typeof __VLS_components.Teleport, typeof __VLS_components.Teleport, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    to: "body",
}));
const __VLS_6 = __VLS_5({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
if (__VLS_ctx.avatarViewerOpen) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closeAvatarViewer) },
        ...{ class: "avatar-viewer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "avatar-viewer-card page-lite" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "viewer-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeAvatarViewer) },
        type: "button",
        ...{ class: "secondary-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "viewer-body" },
    });
    if (__VLS_ctx.avatarPreview) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (__VLS_ctx.avatarPreview),
            alt: "avatar large",
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "viewer-placeholder" },
        });
        ((__VLS_ctx.displayName.charAt(0) || 'U').toUpperCase());
    }
}
var __VLS_7;
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['profile-page']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-head']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-block']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['display-name']} */ ;
/** @type {__VLS_StyleScopedClasses['username']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-items']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-links']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-foot']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['content-card']} */ ;
/** @type {__VLS_StyleScopedClasses['desc']} */ ;
/** @type {__VLS_StyleScopedClasses['content-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-head']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-title']} */ ;
/** @type {__VLS_StyleScopedClasses['desc']} */ ;
/** @type {__VLS_StyleScopedClasses['head-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-tile']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-tile']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-tile']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-tile']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['content-head']} */ ;
/** @type {__VLS_StyleScopedClasses['desc']} */ ;
/** @type {__VLS_StyleScopedClasses['head-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-search-row']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-order-list']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-order-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-plant-list']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-plant-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-cart-list']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-cart-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-fav-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-tile']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-tile']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['content-card']} */ ;
/** @type {__VLS_StyleScopedClasses['content-head']} */ ;
/** @type {__VLS_StyleScopedClasses['desc']} */ ;
/** @type {__VLS_StyleScopedClasses['head-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['large']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-row']} */ ;
/** @type {__VLS_StyleScopedClasses['file-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tip']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['content-card']} */ ;
/** @type {__VLS_StyleScopedClasses['content-head']} */ ;
/** @type {__VLS_StyleScopedClasses['desc']} */ ;
/** @type {__VLS_StyleScopedClasses['head-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['address-add']} */ ;
/** @type {__VLS_StyleScopedClasses['address-add-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['check']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-row']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['address-list']} */ ;
/** @type {__VLS_StyleScopedClasses['address-card']} */ ;
/** @type {__VLS_StyleScopedClasses['address-main']} */ ;
/** @type {__VLS_StyleScopedClasses['address-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
/** @type {__VLS_StyleScopedClasses['address-text']} */ ;
/** @type {__VLS_StyleScopedClasses['address-edit']} */ ;
/** @type {__VLS_StyleScopedClasses['check']} */ ;
/** @type {__VLS_StyleScopedClasses['address-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tip']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-viewer']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-viewer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['viewer-head']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['viewer-body']} */ ;
/** @type {__VLS_StyleScopedClasses['viewer-placeholder']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppLayout: AppLayout,
            router: router,
            auth: auth,
            cartStore: cartStore,
            activeTab: activeTab,
            quickPanel: quickPanel,
            loadingProfile: loadingProfile,
            savingProfile: savingProfile,
            profileTip: profileTip,
            loadingAddresses: loadingAddresses,
            addingAddress: addingAddress,
            addressTip: addressTip,
            addresses: addresses,
            form: form,
            avatarPreview: avatarPreview,
            displayName: displayName,
            favoriteTutorialCount: favoriteTutorialCount,
            favoritePostCount: favoritePostCount,
            quickOrderKeyword: quickOrderKeyword,
            quickOrders: quickOrders,
            quickOrdersLoading: quickOrdersLoading,
            quickOrdersError: quickOrdersError,
            quickPlants: quickPlants,
            quickPanelTitle: quickPanelTitle,
            quickPanelDesc: quickPanelDesc,
            quickFilteredOrders: quickFilteredOrders,
            newAddressText: newAddressText,
            newAddressDefault: newAddressDefault,
            editingId: editingId,
            editAddressText: editAddressText,
            editAddressDefault: editAddressDefault,
            savingEdit: savingEdit,
            deletingId: deletingId,
            avatarViewerOpen: avatarViewerOpen,
            reloadAll: reloadAll,
            saveProfile: saveProfile,
            onAvatarChange: onAvatarChange,
            openAvatarViewer: openAvatarViewer,
            closeAvatarViewer: closeAvatarViewer,
            openQuickPanel: openQuickPanel,
            loadQuickOrders: loadQuickOrders,
            goOrderDetail: goOrderDetail,
            statusLabel: statusLabel,
            formatDateTime: formatDateTime,
            loadAddresses: loadAddresses,
            addAddress: addAddress,
            startEdit: startEdit,
            cancelEdit: cancelEdit,
            saveEdit: saveEdit,
            removeAddress: removeAddress,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
