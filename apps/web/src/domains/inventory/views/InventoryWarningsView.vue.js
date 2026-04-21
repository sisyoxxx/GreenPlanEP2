import { onMounted, reactive, ref } from 'vue';
import InventoryLayout from '../components/InventoryLayout.vue';
import { fetchInventoryWarnings, updateWarningThreshold } from '../api';
const loading = ref(false);
const error = ref('');
const message = ref('');
const rows = ref([]);
const thresholdEdits = reactive({});
const submittingId = ref(null);
async function reload() {
    loading.value = true;
    error.value = '';
    message.value = '';
    try {
        rows.value = (await fetchInventoryWarnings()) || [];
        for (const r of rows.value) {
            const pid = String(r.productId);
            if (thresholdEdits[pid] == null)
                thresholdEdits[pid] = Number(r.warningThreshold ?? 5);
        }
    }
    catch (e) {
        error.value = e?.response?.data?.message || '加载失败';
    }
    finally {
        loading.value = false;
    }
}
async function saveThreshold(row) {
    const productId = Number(row.productId);
    if (!Number.isFinite(productId))
        return;
    const val = Number(thresholdEdits[String(productId)]);
    if (!Number.isFinite(val) || val < 0) {
        error.value = '预警阈值必须为非负数';
        return;
    }
    submittingId.value = productId;
    error.value = '';
    message.value = '';
    try {
        await updateWarningThreshold(productId, val);
        message.value = '预警阈值已更新';
        await reload();
    }
    catch (e) {
        error.value = e?.response?.data?.message || '更新失败';
    }
    finally {
        submittingId.value = null;
    }
}
onMounted(reload);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['thead']} */ ;
/** @type {__VLS_StyleScopedClasses['trow']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof InventoryLayout, typeof InventoryLayout, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(InventoryLayout, new InventoryLayout({
    title: "库存预警",
    subtitle: "查看预警商品并调整阈值",
}));
const __VLS_1 = __VLS_0({
    title: "库存预警",
    subtitle: "查看预警商品并调整阈值",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
{
    const { actions: __VLS_thisSlot } = __VLS_2.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.reload) },
        ...{ class: "secondary-btn" },
        disabled: (__VLS_ctx.loading),
    });
    (__VLS_ctx.loading ? '加载中…' : '刷新');
    const __VLS_4 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ class: "text-link" },
        to: "/inventory/procurement",
    }));
    const __VLS_6 = __VLS_5({
        ...{ class: "text-link" },
        to: "/inventory/procurement",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    var __VLS_7;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "sub" },
});
(__VLS_ctx.rows.length);
if (__VLS_ctx.rows.length === 0 && !__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "thead" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "right" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "right" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "right" },
    });
    for (const [r] of __VLS_getVForSourceType((__VLS_ctx.rows))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "trow" },
            key: (r.productId),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "name" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "title" },
        });
        (r.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "sub" },
        });
        (r.productId);
        (r.sku || '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "right" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
            ...{ class: "stock" },
        });
        (r.onlineStock);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "right" },
        });
        (r.warningThreshold);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "right formcell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ class: "tiny" },
            type: "number",
            min: "0",
        });
        (__VLS_ctx.thresholdEdits[String(r.productId)]);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.rows.length === 0 && !__VLS_ctx.loading))
                        return;
                    __VLS_ctx.saveThreshold(r);
                } },
            ...{ class: "secondary-btn" },
            disabled: (__VLS_ctx.submittingId === r.productId),
        });
        (__VLS_ctx.submittingId === r.productId ? '保存中…' : '保存');
    }
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
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['text-link']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['thead']} */ ;
/** @type {__VLS_StyleScopedClasses['right']} */ ;
/** @type {__VLS_StyleScopedClasses['right']} */ ;
/** @type {__VLS_StyleScopedClasses['right']} */ ;
/** @type {__VLS_StyleScopedClasses['trow']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
/** @type {__VLS_StyleScopedClasses['right']} */ ;
/** @type {__VLS_StyleScopedClasses['stock']} */ ;
/** @type {__VLS_StyleScopedClasses['right']} */ ;
/** @type {__VLS_StyleScopedClasses['right']} */ ;
/** @type {__VLS_StyleScopedClasses['formcell']} */ ;
/** @type {__VLS_StyleScopedClasses['tiny']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['home-message']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            InventoryLayout: InventoryLayout,
            loading: loading,
            error: error,
            message: message,
            rows: rows,
            thresholdEdits: thresholdEdits,
            submittingId: submittingId,
            reload: reload,
            saveThreshold: saveThreshold,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
