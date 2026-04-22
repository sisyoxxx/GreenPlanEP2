<template>
  <aside class="home-sidebar right-sidebar page-lite">
    <section class="sidebar-section chat-card">
      <div class="chat-head">
        <div>
          <h3 class="sidebar-title">AI 聊天助手</h3>
          <p class="sidebar-item-desc">可收起的小窗助手，帮你解答种植和养护问题。</p>
        </div>
        <button type="button" class="collapse-btn" @click="chatCollapsed = !chatCollapsed">
          {{ chatCollapsed ? '展开' : '收起' }}
        </button>
      </div>

      <div v-if="!chatCollapsed" class="chat-panel">
        <div ref="chatBodyRef" class="chat-body">
          <div v-if="chatMessages.length === 0" class="chat-empty">
            <p>你好，我是你的种植助手。输入问题即可获得可执行建议。</p>
          </div>
          <div v-else class="chat-thread">
            <div v-for="msg in chatMessages" :key="msg.id" class="chat-row" :class="msg.role">
              <div class="chat-bubble" :class="msg.role">
                {{ msg.content }}
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input-row">
          <input
            v-model.trim="chatInput"
            type="text"
            class="chat-input"
            placeholder="例如：番茄叶片发黄怎么办？"
            :disabled="chatSending"
            @keydown.enter.prevent="sendChat"
          />
          <button class="chat-send-btn" :disabled="chatSending || !chatInput" @click="sendChat">
            {{ chatSending ? '发送中...' : '发送' }}
          </button>
        </div>
      </div>
    </section>

    <section class="sidebar-section">
      <h3 class="sidebar-title">智能推荐</h3>
      <div class="recommend-list">
        <article v-for="item in recommendations" :key="item.title" class="recommend-item">
          <div class="recommend-title">{{ item.title }}</div>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section class="sidebar-section">
      <h3 class="sidebar-title">种植贴士</h3>
      <ul class="tips-list">
        <li v-for="tip in tips" :key="tip">{{ tip }}</li>
      </ul>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { aiChat, type AiChatMessage } from '../api'

type ChatRole = 'user' | 'assistant'
type ChatMsg = { id: number; role: ChatRole; content: string }

type CityProfile = {
  cityText: string
  climateHint: string
  careHint: string
  cropHint: string
}

const cityProfiles: Record<string, CityProfile> = {
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
}

const defaultProfile: CityProfile = {
  cityText: '你所在地区',
  climateHint: '优先选择抗逆性高、养护简单的品种。',
  careHint: '先建立稳定浇水和通风节奏，再逐步加肥。',
  cropHint: '叶菜和香草类适合分批补种，持续采收。'
}

const chatCollapsed = ref(false)
const chatInput = ref('')
const chatSending = ref(false)
const chatMessages = ref<ChatMsg[]>([])
const chatBodyRef = ref<HTMLElement | null>(null)
const currentLocation = ref(localStorage.getItem('gp2_buyer_location') || '')

const month = computed(() => new Date().getMonth() + 1)
const seasonLabel = computed(() => {
  if (month.value >= 3 && month.value <= 5) return '春季'
  if (month.value >= 6 && month.value <= 8) return '夏季'
  if (month.value >= 9 && month.value <= 11) return '秋季'
  return '冬季'
})

const cityProfile = computed(() => {
  return cityProfiles[currentLocation.value] || defaultProfile
})

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
  ]
})

const tips = computed(() => {
  const base = [
    '播种前先浸种 4-8 小时，提升发芽稳定性。',
    '盆土保持微湿不积水，避免闷根和烂根。',
    '每周固定巡查黄叶与虫害，及早处理。'
  ]

  if (seasonLabel.value === '夏季') {
    return [...base, '夏季中午避免施肥，建议早晚补水并适度遮阴。']
  }
  if (seasonLabel.value === '冬季') {
    return [...base, '冬季注意保温和补光，浇水频率可适当降低。']
  }
  if (seasonLabel.value === '春季') {
    return [...base, '春季生长快，建议每 7-10 天补一次薄肥。']
  }
  return [...base, '秋季温差增大，夜间注意防寒并逐步控水。']
})

onMounted(() => {
  window.addEventListener('storage', syncLocation)
  window.addEventListener('gp2-location-change', syncLocation)
})

onUnmounted(() => {
  window.removeEventListener('storage', syncLocation)
  window.removeEventListener('gp2-location-change', syncLocation)
})

function syncLocation() {
  currentLocation.value = localStorage.getItem('gp2_buyer_location') || ''
}

async function sendChat() {
  const question = chatInput.value.trim()
  if (!question || chatSending.value) return

  const idBase = Date.now()
  chatMessages.value.push({ id: idBase, role: 'user', content: question })
  chatInput.value = ''
  await nextTick()
  scrollChatToBottom()

  chatSending.value = true
  try {
    const payload: AiChatMessage[] = [
      {
        role: 'system',
        content: `你是家庭种植助手，请给出简洁、可执行、分步骤建议。当前城市：${cityProfile.value.cityText}；当前季节：${seasonLabel.value}。`
      },
      ...chatMessages.value.map((m) => ({ role: m.role, content: m.content } as AiChatMessage))
    ]
    const res = await aiChat(payload)
    chatMessages.value.push({ id: idBase + 1, role: 'assistant', content: res.content })
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'AI 请求失败'
    chatMessages.value.push({ id: idBase + 1, role: 'assistant', content: `提示：${msg}` })
  } finally {
    chatSending.value = false
    await nextTick()
    scrollChatToBottom()
  }
}

function scrollChatToBottom() {
  const el = chatBodyRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}
</script>

<style scoped>
.home-sidebar {
  display: grid;
  gap: 12px;
}

.sidebar-section {
  display: grid;
  gap: 10px;
}

.chat-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  color: #1f7a41;
}

.sidebar-item-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
}

.collapse-btn {
  border: 1px solid #d6e7da;
  background: #f4faf5;
  color: #1f7a41;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
  cursor: pointer;
}

.chat-panel {
  display: grid;
  gap: 10px;
}

.chat-body {
  min-height: 130px;
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid #e2efe5;
  border-radius: 14px;
  background: linear-gradient(180deg, #f8fcf8, #f2f8f3);
  padding: 10px;
}

.chat-empty p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.chat-thread {
  display: grid;
  gap: 8px;
}

.chat-row {
  display: flex;
}

.chat-row.user {
  justify-content: flex-end;
}

.chat-row.assistant {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 88%;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.55;
  word-break: break-word;
}

.chat-bubble.assistant {
  background: #fff;
  color: #374151;
  border: 1px solid #e7ece8;
}

.chat-bubble.user {
  background: #1f7a41;
  color: #fff;
}

.chat-input-row {
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  min-width: 0;
  border-radius: 10px;
  font-size: 13px;
}

.chat-send-btn {
  border: none;
  border-radius: 10px;
  background: #1f7a41;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 12px;
  cursor: pointer;
  white-space: nowrap;
}

.chat-send-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.recommend-list {
  display: grid;
  gap: 8px;
}

.recommend-item {
  border: 1px solid #e4efe6;
  border-radius: 12px;
  background: #f8fcf8;
  padding: 10px;
}

.recommend-title {
  color: #1f2937;
  font-size: 13px;
  font-weight: 700;
}

.recommend-item p {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.6;
}

.tips-list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
}

.tips-list li {
  color: #4b5563;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 905px) {
  .right-sidebar {
    display: none;
  }
}
</style>
