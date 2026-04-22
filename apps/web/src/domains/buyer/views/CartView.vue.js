import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '../../../layouts/AppLayout.vue';
import { normalizeBuyerCategory } from '../categoryConfig';
import { useBuyerCartStore } from '../stores/useBuyerCartStore';
import { createOrder } from '../api';
const router = useRouter();
const cartStore = useBuyerCartStore();
const submitting = ref(false);
const message = ref('');
const keyword = ref('');
const selectedIds = ref(new Set());
const multiMode = ref(false);
const filteredItems = computed(() => {
    const value = keyword.value.trim().toLowerCase();
    if (!value)
        return cartStore.items;
    return cartStore.items.filter((item) => [item.name, normalizeCategory(item.category), item.description]
        .some((text) => text.toLowerCase().includes(value)));
});
const selectedItems = computed(() => cartStore.items.filter((item) => selectedIds.value.has(item.id)));
const selectedCount = computed(() => selectedItems.value.reduce((sum, item) => sum + item.quantity, 0));
const selectedAmount = computed(() => selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0));
const isAllFilteredSelected = computed(() => filteredItems.value.length > 0 && filteredItems.value.every((item) => selectedIds.value.has(item.id)));
watch(() => cartStore.items.map((item) => item.id), (ids) => {
    const next = new Set();
    ids.forEach((id) => {
        if (selectedIds.value.has(id))
            next.add(id);
    });
    selectedIds.value = next;
}, { immediate: true });
watch(multiMode, (enabled) => {
    if (!enabled)
        selectedIds.value = new Set();
});
function toggleMultiMode() {
    multiMode.value = !multiMode.value;
}
function toggleSelected(id) {
    const next = new Set(selectedIds.value);
    if (next.has(id))
        next.delete(id);
    else
        next.add(id);
    selectedIds.value = next;
}
function toggleSelectAll() {
    const next = new Set(selectedIds.value);
    if (isAllFilteredSelected.value) {
        filteredItems.value.forEach((item) => next.delete(item.id));
    }
    else {
        filteredItems.value.forEach((item) => next.add(item.id));
    }
    selectedIds.value = next;
}
async function submitAllOrder() {
    await submitOrder(cartStore.buildOrderPayload(), cartStore.items.map((item) => item.id));
}
async function submitSelectedOrder() {
    await submitOrder(selectedItems.value.map((item) => ({ productId: item.id, quantity: item.quantity })), selectedItems.value.map((item) => item.id));
}
async function submitOrder(payload, removeIds) {
    if (payload.length === 0 || submitting.value)
        return;
    submitting.value = true;
    message.value = '';
    try {
        const res = await createOrder(payload);
        removeIds.forEach((id) => cartStore.removeItem(id));
        selectedIds.value = new Set();
        message.value = `订单提交成功，订单号 ${res.data.orderNo}`;
        router.push(`/orders?focus=${res.data.id}`);
    }
    catch (err) {
        message.value = err?.response?.data?.message || '下单失败';
    }
    finally {
        submitting.value = false;
    }
}
function removeSelected() {
    if (selectedIds.value.size === 0)
        return;
    Array.from(selectedIds.value).forEach((id) => cartStore.removeItem(id));
    selectedIds.value = new Set();
    message.value = '已删除选中的商品。';
}
function updateQuantity(productId, event) {
    const target = event.target;
    cartStore.setQuantity(productId, Number(target.value) || 1);
}
function normalizeCategory(category) {
    return normalizeBuyerCategory(category);
}
function hasDisplayImage(url) {
    if (!url)
        return false;
    return /^https?:\/\//i.test(url);
}
function formatPrice(value) {
    return Number(value).toFixed(2);
}
function goProducts() {
    router.push('/products');
}
function goDetail(id) {
    router.push(`/products/${id}`);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['cart-page']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-card']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-stepper']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-stepper']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-stepper']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-head']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-line']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-line']} */ ;
/** @type {__VLS_StyleScopedClasses['total']} */ ;
/** @type {__VLS_StyleScopedClasses['multi-bar-left']} */ ;
/** @type {__VLS_StyleScopedClasses['multi-bar-left']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-page']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-top']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-head']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-card']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-card']} */ ;
/** @type {__VLS_StyleScopedClasses['multi']} */ ;
/** @type {__VLS_StyleScopedClasses['select-box']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppLayout, typeof AppLayout, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppLayout, new AppLayout({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cart-page" },
    ...{ class: ({ 'has-multi-bar': __VLS_ctx.multiMode }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "cart-main page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cart-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cart-header-actions" },
});
if (!__VLS_ctx.cartStore.isEmpty) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleMultiMode) },
        ...{ class: "secondary-btn" },
    });
    (__VLS_ctx.multiMode ? '退出多选' : '多选');
}
if (!__VLS_ctx.cartStore.isEmpty) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.cartStore.isEmpty))
                    return;
                __VLS_ctx.cartStore.clear();
            } },
        ...{ class: "secondary-btn" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cart-toolbar page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    value: (__VLS_ctx.keyword),
    type: "text",
    placeholder: "筛选商品名称、分类或描述",
});
if (__VLS_ctx.multiMode) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toolbar-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleSelectAll) },
        ...{ class: "secondary-btn" },
        disabled: (__VLS_ctx.filteredItems.length === 0),
    });
    (__VLS_ctx.isAllFilteredSelected ? '取消全选' : '全选当前筛选结果');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.removeSelected) },
        ...{ class: "danger-btn" },
        disabled: (__VLS_ctx.selectedIds.size === 0),
    });
}
if (__VLS_ctx.cartStore.isEmpty) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goProducts) },
    });
}
else if (__VLS_ctx.filteredItems.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cart-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredItems))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (item.id),
            ...{ class: "cart-item-card" },
            ...{ class: ({ multi: __VLS_ctx.multiMode }) },
        });
        if (__VLS_ctx.multiMode) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                ...{ class: "select-box" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                ...{ onChange: (...[$event]) => {
                        if (!!(__VLS_ctx.cartStore.isEmpty))
                            return;
                        if (!!(__VLS_ctx.filteredItems.length === 0))
                            return;
                        if (!(__VLS_ctx.multiMode))
                            return;
                        __VLS_ctx.toggleSelected(item.id);
                    } },
                checked: (__VLS_ctx.selectedIds.has(item.id)),
                type: "checkbox",
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.cartStore.isEmpty))
                        return;
                    if (!!(__VLS_ctx.filteredItems.length === 0))
                        return;
                    __VLS_ctx.goDetail(item.id);
                } },
            ...{ class: "cart-item-cover" },
        });
        if (__VLS_ctx.hasDisplayImage(item.imageUrl)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                src: (item.imageUrl),
                alt: (item.name),
                loading: "lazy",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (item.name);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cart-item-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cart-item-top" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "cart-item-tag" },
        });
        (__VLS_ctx.normalizeCategory(item.category));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.cartStore.isEmpty))
                        return;
                    if (!!(__VLS_ctx.filteredItems.length === 0))
                        return;
                    __VLS_ctx.goDetail(item.id);
                } },
            ...{ class: "cart-item-title" },
        });
        (item.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
            ...{ class: "cart-item-price" },
        });
        (__VLS_ctx.formatPrice(item.price));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "cart-item-desc" },
        });
        (item.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cart-item-meta" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.plantingMonth || '未设置');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.suitableRegion || '未设置');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.onlineStock);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cart-item-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "qty-stepper" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.cartStore.isEmpty))
                        return;
                    if (!!(__VLS_ctx.filteredItems.length === 0))
                        return;
                    __VLS_ctx.cartStore.decrease(item.id);
                } },
            type: "button",
            ...{ class: "step-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onInput: (...[$event]) => {
                    if (!!(__VLS_ctx.cartStore.isEmpty))
                        return;
                    if (!!(__VLS_ctx.filteredItems.length === 0))
                        return;
                    __VLS_ctx.updateQuantity(item.id, $event);
                } },
            value: (item.quantity),
            type: "number",
            min: "1",
            max: (Math.max(1, item.onlineStock)),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.cartStore.isEmpty))
                        return;
                    if (!!(__VLS_ctx.filteredItems.length === 0))
                        return;
                    __VLS_ctx.cartStore.increase(item.id);
                } },
            type: "button",
            ...{ class: "step-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cart-item-side-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "line-total" },
        });
        (__VLS_ctx.formatPrice(item.price * item.quantity));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.cartStore.isEmpty))
                        return;
                    if (!!(__VLS_ctx.filteredItems.length === 0))
                        return;
                    __VLS_ctx.cartStore.removeItem(item.id);
                } },
            type: "button",
            ...{ class: "text-btn" },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "cart-bottom page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.cartStore.uniqueCount);
(__VLS_ctx.cartStore.itemCount);
if (__VLS_ctx.cartStore.isEmpty) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bottom-empty" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bottom-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.cartStore.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.id),
            ...{ class: "bottom-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "bottom-item-name" },
        });
        (item.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "bottom-item-meta" },
        });
        (item.quantity);
        (__VLS_ctx.formatPrice(item.price * item.quantity));
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "cart-summary page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-line" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.cartStore.uniqueCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-line" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.cartStore.itemCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-line total" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.formatPrice(__VLS_ctx.cartStore.totalAmount));
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.submitAllOrder) },
    disabled: (__VLS_ctx.submitting || __VLS_ctx.cartStore.isEmpty),
});
(__VLS_ctx.submitting ? '下单中...' : '全部付款');
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.goProducts) },
    ...{ class: "secondary-btn" },
});
if (__VLS_ctx.message) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "cart-message" },
    });
    (__VLS_ctx.message);
}
if (__VLS_ctx.multiMode) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "multi-bar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "multi-bar-left" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.selectedItems.length);
    (__VLS_ctx.selectedCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.formatPrice(__VLS_ctx.selectedAmount));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "multi-bar-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.removeSelected) },
        ...{ class: "danger-btn" },
        disabled: (__VLS_ctx.selectedIds.size === 0),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.submitSelectedOrder) },
        disabled: (__VLS_ctx.submitting || __VLS_ctx.selectedIds.size === 0),
    });
    (__VLS_ctx.submitting ? '下单中...' : '购买');
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['cart-page']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-main']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-list']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-card']} */ ;
/** @type {__VLS_StyleScopedClasses['select-box']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-top']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-price']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-stepper']} */ ;
/** @type {__VLS_StyleScopedClasses['step-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['step-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-side-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['line-total']} */ ;
/** @type {__VLS_StyleScopedClasses['text-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-head']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-item']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-item-name']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-item-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-line']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-line']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-line']} */ ;
/** @type {__VLS_StyleScopedClasses['total']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-message']} */ ;
/** @type {__VLS_StyleScopedClasses['multi-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['multi-bar-left']} */ ;
/** @type {__VLS_StyleScopedClasses['multi-bar-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppLayout: AppLayout,
            cartStore: cartStore,
            submitting: submitting,
            message: message,
            keyword: keyword,
            selectedIds: selectedIds,
            multiMode: multiMode,
            filteredItems: filteredItems,
            selectedItems: selectedItems,
            selectedCount: selectedCount,
            selectedAmount: selectedAmount,
            isAllFilteredSelected: isAllFilteredSelected,
            toggleMultiMode: toggleMultiMode,
            toggleSelected: toggleSelected,
            toggleSelectAll: toggleSelectAll,
            submitAllOrder: submitAllOrder,
            submitSelectedOrder: submitSelectedOrder,
            removeSelected: removeSelected,
            updateQuantity: updateQuantity,
            normalizeCategory: normalizeCategory,
            hasDisplayImage: hasDisplayImage,
            formatPrice: formatPrice,
            goProducts: goProducts,
            goDetail: goDetail,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
