import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '../../../layouts/AppLayout.vue';
import { useAuthStore } from '../../../core/auth/useAuthStore';
import { fetchProducts } from '../api';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
const router = useRouter();
const auth = useAuthStore();
const products = ref([]);
const keyword = ref('');
const message = ref('');
const selectedCategory = ref('全部');
const selectedMonth = ref('全部');
const selectedRegion = ref('全部');
const cart = ref([]);
const categoryFilters = [
    { label: '全部', icon: '🛍️' },
    { label: '蔬菜种子', icon: '🌱' },
    { label: '花卉种子', icon: '🌸' },
    { label: '香草种子', icon: '🌿' },
    { label: '营养肥料', icon: '🍀' },
    { label: '园艺工具', icon: '🧰' }
];
const monthFilters = ['全部', '春播', '夏播', '秋播', '冬季'];
const regionFilters = ['全部', '华东', '华南', '华北', '华中', '西南', '西北', '东北'];
const slides = [
    { tag: '春播推荐', title: '新手阳台蔬菜专区', desc: '从番茄、生菜到香草，适合家庭园艺快速入门。' },
    { tag: '花园灵感', title: '打造清新田园花境', desc: '花卉、香草与观叶植物组合，提升庭院与阳台氛围。' },
    { tag: '家庭种植', title: '一站式选购种子与工具', desc: '种子、喷壶、营养肥料搭配选购更方便。' }
];
const categoryLabelMap = {
    VEGETABLE: '蔬菜种子',
    FLOWER: '花卉种子',
    HERB: '香草种子',
    FRUIT: '营养肥料',
    TOOL: '园艺工具'
};
onMounted(async () => {
    products.value = await fetchProducts();
});
function goDetail(id) {
    router.push(`/products/${id}`);
}
function requireBuyerLogin(actionText) {
    if (!auth.isLoggedIn || auth.role !== 'BUYER') {
        message.value = `${actionText}前请先登录买家账号`;
        router.push('/login');
        return false;
    }
    return true;
}
function addToCart(item) {
    if (!requireBuyerLogin('加入购物车'))
        return;
    const existed = cart.value.find((c) => c.id === item.id);
    if (existed)
        existed.quantity += 1;
    else
        cart.value.push({ ...item, quantity: 1 });
    message.value = `${item.name} 已加入购物车`;
}
const filteredProducts = computed(() => {
    return products.value.filter((item) => {
        const categoryText = categoryLabelMap[item.category] ?? item.category;
        const monthText = item.plantingMonth || '未设置';
        const regionText = item.suitableRegion || '未设置';
        const matchKeyword = !keyword.value || [item.name, categoryText, item.description, monthText, regionText].some((text) => text.toLowerCase().includes(keyword.value.toLowerCase()));
        const matchCategory = selectedCategory.value === '全部' || categoryText === selectedCategory.value;
        const matchMonth = selectedMonth.value === '全部' || monthText === selectedMonth.value;
        const matchRegion = selectedRegion.value === '全部' || regionText === selectedRegion.value;
        return matchKeyword && matchCategory && matchMonth && matchRegion;
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper']} */ ;
/** @type {__VLS_StyleScopedClasses['no-products']} */ ;
/** @type {__VLS_StyleScopedClasses['product-title-link']} */ ;
/** @type {__VLS_StyleScopedClasses['product-list-content']} */ ;
/** @type {__VLS_StyleScopedClasses['products-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['products-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['products-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper-slide']} */ ;
/** @type {__VLS_StyleScopedClasses['products-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['products-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['products-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['products-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper-slide']} */ ;
/** @type {__VLS_StyleScopedClasses['products-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['category-chip-group']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppLayout, typeof AppLayout, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppLayout, new AppLayout({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "products-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "products-sidebar page-lite" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section category-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-chip-group category-chip-group" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.categoryFilters))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectedCategory = item.label;
            } },
        key: (item.label),
        ...{ class: "filter-chip category-chip" },
        ...{ class: ({ active: __VLS_ctx.selectedCategory === item.label }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "category-chip-icon" },
    });
    (item.icon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "category-chip-label" },
    });
    (item.label);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-chip-group" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.monthFilters))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectedMonth = item;
            } },
        key: (item),
        ...{ class: "filter-chip" },
        ...{ class: ({ active: __VLS_ctx.selectedMonth === item }) },
    });
    (item);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "sidebar-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-chip-group" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.regionFilters))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectedRegion = item;
            } },
        key: (item),
        ...{ class: "filter-chip" },
        ...{ class: ({ active: __VLS_ctx.selectedRegion === item }) },
    });
    (item);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "products-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-lite products-swiper-wrap" },
});
const __VLS_4 = {}.Swiper;
/** @type {[typeof __VLS_components.Swiper, typeof __VLS_components.Swiper, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    modules: ([__VLS_ctx.Autoplay, __VLS_ctx.Pagination, __VLS_ctx.EffectCoverflow]),
    effect: "coverflow",
    slidesPerView: ('auto'),
    centeredSlides: (true),
    loop: (true),
    autoplay: ({ delay: 3200 }),
    pagination: ({ clickable: true }),
    coverflowEffect: ({
        rotate: 0,
        stretch: -42,
        depth: 180,
        scale: 0.88,
        modifier: 1,
        slideShadows: false
    }),
    ...{ class: "products-swiper" },
}));
const __VLS_6 = __VLS_5({
    modules: ([__VLS_ctx.Autoplay, __VLS_ctx.Pagination, __VLS_ctx.EffectCoverflow]),
    effect: "coverflow",
    slidesPerView: ('auto'),
    centeredSlides: (true),
    loop: (true),
    autoplay: ({ delay: 3200 }),
    pagination: ({ clickable: true }),
    coverflowEffect: ({
        rotate: 0,
        stretch: -42,
        depth: 180,
        scale: 0.88,
        modifier: 1,
        slideShadows: false
    }),
    ...{ class: "products-swiper" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
for (const [slide] of __VLS_getVForSourceType((__VLS_ctx.slides))) {
    const __VLS_8 = {}.SwiperSlide;
    /** @type {[typeof __VLS_components.SwiperSlide, typeof __VLS_components.SwiperSlide, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (slide.title),
        ...{ class: "products-swiper-slide" },
    }));
    const __VLS_10 = __VLS_9({
        key: (slide.title),
        ...{ class: "products-swiper-slide" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "products-banner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "hero-tag" },
    });
    (slide.tag);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    (slide.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "hero-subtitle" },
    });
    (slide.desc);
    var __VLS_11;
}
var __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-lite products-search-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    value: (__VLS_ctx.keyword),
    type: "text",
    placeholder: "搜索商品名称、分类、简介",
});
if (__VLS_ctx.filteredProducts.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-lite no-products" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "product-desc" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "products-card-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredProducts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            ...{ class: "product-list-card page-lite" },
            key: (item.id),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.filteredProducts.length === 0))
                        return;
                    __VLS_ctx.goDetail(item.id);
                } },
            ...{ class: "product-cover clickable" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "product-thumb" },
        });
        (item.imageUrl || (__VLS_ctx.categoryLabelMap[item.category] ?? item.category));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "product-list-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "product-list-top" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.filteredProducts.length === 0))
                        return;
                    __VLS_ctx.goDetail(item.id);
                } },
            ...{ class: "clickable product-title-link" },
        });
        (item.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "product-list-price" },
        });
        (item.price);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "product-desc" },
        });
        (item.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "product-extra-meta" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.plantingMonth || '未设置');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.suitableRegion || '未设置');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.onlineStock);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "product-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.filteredProducts.length === 0))
                        return;
                    __VLS_ctx.addToCart(item);
                } },
        });
    }
}
if (__VLS_ctx.message) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "home-message" },
    });
    (__VLS_ctx.message);
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['products-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['products-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['category-section']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip-group']} */ ;
/** @type {__VLS_StyleScopedClasses['category-chip-group']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['category-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['category-chip-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['category-chip-label']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip-group']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip-group']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['products-main']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper']} */ ;
/** @type {__VLS_StyleScopedClasses['products-swiper-slide']} */ ;
/** @type {__VLS_StyleScopedClasses['products-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['products-search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['no-products']} */ ;
/** @type {__VLS_StyleScopedClasses['product-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['products-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['product-list-card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-lite']} */ ;
/** @type {__VLS_StyleScopedClasses['product-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['product-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['product-list-content']} */ ;
/** @type {__VLS_StyleScopedClasses['product-list-top']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['product-title-link']} */ ;
/** @type {__VLS_StyleScopedClasses['product-list-price']} */ ;
/** @type {__VLS_StyleScopedClasses['product-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['product-extra-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['product-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['home-message']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppLayout: AppLayout,
            Swiper: Swiper,
            SwiperSlide: SwiperSlide,
            Autoplay: Autoplay,
            Pagination: Pagination,
            EffectCoverflow: EffectCoverflow,
            keyword: keyword,
            message: message,
            selectedCategory: selectedCategory,
            selectedMonth: selectedMonth,
            selectedRegion: selectedRegion,
            categoryFilters: categoryFilters,
            monthFilters: monthFilters,
            regionFilters: regionFilters,
            slides: slides,
            categoryLabelMap: categoryLabelMap,
            goDetail: goDetail,
            addToCart: addToCart,
            filteredProducts: filteredProducts,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
