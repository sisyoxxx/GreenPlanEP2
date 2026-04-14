<template>
  <AppLayout>
    <div class="home-shell">
      <HomeCategorySidebar />

      <section class="home-center">
        <div class="hero-banner page-lite">
          <div class="hero-content">
            <p class="hero-tag">新人专享 · 春播季</p>
            <h1>绿植种子与家庭园艺一站式购物</h1>
            <p class="hero-subtitle">匿名可浏览首页与商品，登录后即可加购、下单、查看订单与收藏。</p>
            <div class="hero-actions">
              <button @click="goProducts">立即选购</button>
              <button class="secondary-btn" @click="goCommunity">浏览社区</button>
            </div>
          </div>
          <div class="hero-highlight">
            <div class="highlight-card">
              <div class="highlight-label">本周热销</div>
              <div class="highlight-title">家庭番茄种植套装</div>
              <div class="highlight-desc">发芽率高，附新手播种步骤。</div>
            </div>
          </div>
        </div>

        <div class="featured-grid">
          <article class="featured-product page-lite" v-for="item in products" :key="item.id">
            <div class="product-thumb">{{ item.category }}</div>
            <h3>{{ item.name }}</h3>
            <p class="product-desc">{{ item.description }}</p>
            <div class="product-meta">
              <span>¥{{ item.price }}</span>
              <span>库存 {{ item.onlineStock }}</span>
            </div>
            <div class="product-actions">
              <button @click="addToCart(item)">加入购物车</button>
              <button class="secondary-btn" @click="goProducts">查看详情</button>
            </div>
          </article>
        </div>

        <div v-if="cart.length > 0" class="cart-strip page-lite">
          <div>
            <strong>已选商品 {{ cart.length }} 件</strong>
            <p class="sidebar-item-desc">可继续添加，或直接去下单。</p>
          </div>
          <div class="cart-strip-actions">
            <button class="secondary-btn" @click="clearCart">清空</button>
            <button @click="submitOrder">立即下单</button>
          </div>
        </div>

        <section class="bottom-sections">
          <div class="bottom-section page-lite">
            <div class="section-head">
              <h2>商品卡片</h2>
              <button class="secondary-btn" @click="goProducts">更多商品</button>
            </div>
            <div class="bottom-card-grid">
              <article class="bottom-card" v-for="item in products" :key="`product-${item.id}`">
                <div class="bottom-card-tag">商品</div>
                <h3>{{ item.name }}</h3>
                <p>{{ item.description }}</p>
              </article>
            </div>
          </div>

          <div class="bottom-section page-lite">
            <div class="section-head">
              <h2>教程卡片</h2>
              <button class="secondary-btn" @click="goTutorial">更多教程</button>
            </div>
            <div class="bottom-card-grid">
              <article class="bottom-card" v-for="item in tutorials" :key="item.title">
                <div class="bottom-card-tag">教程</div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.desc }}</p>
              </article>
            </div>
          </div>

          <div class="bottom-section page-lite">
            <div class="section-head">
              <h2>社区卡片</h2>
              <button class="secondary-btn" @click="goCommunity">更多社区</button>
            </div>
            <div class="bottom-card-grid">
              <article class="bottom-card" v-for="item in communityPosts" :key="item.title">
                <div class="bottom-card-tag">社区</div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.desc }}</p>
              </article>
            </div>
          </div>
        </section>

        <div v-if="totalCardCount > 20" class="overflow-actions page-lite">
          <button @click="goProducts">跳转商品页</button>
          <button class="secondary-btn" @click="goTutorial">跳转教程页</button>
          <button class="secondary-btn" @click="goCommunity">跳转社区页</button>
        </div>

        <p v-if="message" class="home-message">{{ message }}</p>
      </section>

      <HomeRecommendationRail />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import { createOrder, fetchProducts, type Product } from '../api'
import HomeCategorySidebar from '../components/HomeCategorySidebar.vue'
import HomeRecommendationRail from '../components/HomeRecommendationRail.vue'

const router = useRouter()
const auth = useAuthStore()
const products = ref<Product[]>([])
const cart = ref<Array<Product & { quantity: number }>>([])
const message = ref('')

const tutorials = [
  { title: '播种前的种子处理方法', desc: '了解浸种、催芽与播前准备。' },
  { title: '家庭阳台种植光照指南', desc: '不同作物需要的光照强度与摆放建议。' },
  { title: '浇水频率怎么判断', desc: '避免积水烂根和长期缺水。' },
  { title: '新手营养肥料搭配技巧', desc: '肥料比例与盆栽通气性建议。' },
  { title: '幼苗期常见问题排查', desc: '徒长、黄叶、倒伏的处理思路。' },
  { title: '家庭病虫害预防方案', desc: '低风险、易上手的园艺防护方法。' },
  { title: '四季适合播种的品种', desc: '按季节筛选更容易成功的作物。' }
]

const communityPosts = [
  { title: '番茄从发芽到开花记录', desc: '分享阳台番茄完整生长过程。' },
  { title: '如何让薄荷长得更旺盛', desc: '社区热议的修剪与浇水经验。' },
  { title: '春季阳台花园布置灵感', desc: '适合小空间的花卉搭配方案。' },
  { title: '新手入门买哪些工具', desc: '大家推荐的实用园艺工具清单。' },
  { title: '我家的草莓终于结果了', desc: '从播种到采收的经验总结。' },
  { title: '家庭堆肥小技巧', desc: '厨余再利用与土壤改良心得。' },
  { title: '夏季浇水避坑经验', desc: '高温阶段如何减少闷根与蒸腾损伤。' },
  { title: '香草植物适合厨房窗边吗', desc: '关于罗勒、迷迭香、薄荷的讨论。' }
]

const totalCardCount = computed(() => products.value.length + tutorials.length + communityPosts.length)

onMounted(async () => {
  products.value = (await fetchProducts()).slice(0, 8)
})

function goProducts() {
  router.push('/products')
}

function goTutorial() {
  router.push('/tutorial')
}

function goCommunity() {
  router.push('/community')
}

function requireBuyerLogin(actionText: string): boolean {
  if (!auth.isLoggedIn || auth.role !== 'BUYER') {
    message.value = `${actionText}前请先登录买家账号`
    router.push('/login')
    return false
  }
  return true
}

function addToCart(item: Product) {
  if (!requireBuyerLogin('加入购物车')) return
  const existed = cart.value.find((c) => c.id === item.id)
  if (existed) existed.quantity += 1
  else cart.value.push({ ...item, quantity: 1 })
  message.value = `${item.name} 已加入购物车`
}

function clearCart() {
  cart.value = []
  message.value = '购物车已清空'
}

async function submitOrder() {
  if (!requireBuyerLogin('下单')) return
  if (cart.value.length === 0) return
  const payload = cart.value.map((item) => ({ productId: item.id, quantity: item.quantity }))
  try {
    const res = await createOrder(payload) as any
    message.value = `下单成功，订单号：${res.data.orderNo}`
    cart.value = []
    products.value = (await fetchProducts()).slice(0, 8)
  } catch (e: any) {
    message.value = e?.response?.data?.message || '下单失败'
  }
}
</script>

<style scoped>
.home-shell {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 290px;
  gap: 12px;
  align-items: start;
}

.home-center {
  display: grid;
  gap: 18px;
}

.hero-banner {
  min-height: 300px;
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 16px;
  background: linear-gradient(135deg, #edf9ef, #f7fbf7);
}

.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.hero-content h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  color: #16351f;
}

.hero-actions,
.cart-strip-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-highlight {
  display: flex;
  align-items: center;
  justify-content: center;
}

.highlight-card {
  width: 100%;
  border-radius: 18px;
  background: rgba(31, 122, 65, 0.95);
  color: #fff;
  padding: 20px;
}

.highlight-label {
  font-size: 12px;
  opacity: 0.85;
  margin-bottom: 10px;
}

.highlight-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}

.highlight-desc {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.92;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.featured-product {
  display: grid;
  gap: 10px;
}

.product-thumb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 90px;
  border-radius: 14px;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  color: #1f7a41;
  font-weight: 700;
}

.featured-product h3 {
  margin: 0;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: #1f2937;
}

.cart-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.bottom-sections {
  display: grid;
  gap: 18px;
}

.bottom-section {
  display: grid;
  gap: 14px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.section-head h2 {
  margin: 0;
  font-size: 22px;
  color: #1f2937;
}

.bottom-card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.bottom-card {
  padding: 14px;
  border-radius: 14px;
  background: #f8fcf8;
  border: 1px solid #e0ece3;
  display: grid;
  gap: 10px;
}

.bottom-card h3 {
  margin: 0;
  font-size: 16px;
}

.bottom-card p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
  font-size: 13px;
}

.bottom-card-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dff4e4;
  color: #1f7a41;
  font-size: 12px;
  font-weight: 700;
}

.overflow-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 1500px) {
  .home-shell {
    grid-template-columns: 220px minmax(0, 1fr) 260px;
    gap: 12px;
  }

  .bottom-card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1200px) {
  .home-shell {
    grid-template-columns: 210px minmax(0, 1fr) 240px;
    gap: 10px;
  }

  .bottom-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 950px) {
  .home-shell {
    grid-template-columns: 220px minmax(0, 1fr) 240px;
    gap: 10px;
  }

  .hero-banner {
    grid-template-columns: 1fr;
  }

  .featured-grid {
    grid-template-columns: 1fr;
  }

  .cart-strip {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 905px) {
  .home-shell {
    grid-template-columns: 220px minmax(0, 1fr);
  }
}

@media (max-width: 485px) {
  .home-shell {
    grid-template-columns: 1fr;
  }
}
</style>

