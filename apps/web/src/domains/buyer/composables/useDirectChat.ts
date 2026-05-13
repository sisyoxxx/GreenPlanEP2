import { computed, ref, type Ref } from 'vue'

export type ChatSender = 'me' | 'other'

export type DirectChatMessage = {
  id: number
  sender: ChatSender
  text: string
  time: string
}

export type DirectConversation = {
  id: number
  partner: string
  preview: string
  updatedAt: string
  unread: number
  messages: DirectChatMessage[]
}

const DIRECT_CHAT_STORAGE_KEY = 'gp2_buyer_direct_chats'

function formatNow() {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function defaultConversations(): DirectConversation[] {
  return [
    {
      id: 1,
      partner: '阳台番茄达人',
      preview: '你昨天问的补光灯型号我发你了。',
      updatedAt: '刚刚',
      unread: 1,
      messages: [
        { id: 101, sender: 'other', text: '你昨天问的补光灯型号我发你了。', time: '刚刚' }
      ]
    },
    {
      id: 2,
      partner: '厨房花园君',
      preview: '薄荷打顶后恢复很快，记得两天后追肥。',
      updatedAt: '今天',
      unread: 0,
      messages: [
        { id: 201, sender: 'other', text: '薄荷打顶后恢复很快，记得两天后追肥。', time: '今天' }
      ]
    }
  ]
}

function normalizeConversation(raw: any): DirectConversation | null {
  const id = Number(raw?.id)
  if (!Number.isFinite(id)) return null
  const messagesRaw = Array.isArray(raw?.messages) ? raw.messages : []
  const messages = messagesRaw
    .map((msg: any) => {
      const msgId = Number(msg?.id)
      if (!Number.isFinite(msgId)) return null
      const sender: ChatSender = msg?.sender === 'other' ? 'other' : 'me'
      return {
        id: msgId,
        sender,
        text: String(msg?.text || ''),
        time: String(msg?.time || '')
      }
    })
    .filter((msg: DirectChatMessage | null): msg is DirectChatMessage => !!msg)

  return {
    id,
    partner: String(raw?.partner || '社区好友'),
    preview: String(raw?.preview || ''),
    updatedAt: String(raw?.updatedAt || ''),
    unread: Math.max(0, Number(raw?.unread) || 0),
    messages
  }
}

function loadDirectConversations(): DirectConversation[] {
  const raw = safeParse<any[]>(localStorage.getItem(DIRECT_CHAT_STORAGE_KEY), [])
  if (!Array.isArray(raw) || raw.length === 0) return defaultConversations()

  const normalized = raw.map((item) => normalizeConversation(item)).filter((item): item is DirectConversation => !!item)
  if (normalized.length === 0) return defaultConversations()
  return normalized
}

export function useDirectChat(keywordRef: Ref<string>) {
  const activeConversationId = ref<number | null>(null)
  const chatDraft = ref('')
  const directConversations = ref<DirectConversation[]>(loadDirectConversations())

  const directConversationCount = computed(() => directConversations.value.length)
  const activeConversation = computed(
    () => directConversations.value.find((item) => item.id === activeConversationId.value) || null
  )
  const filteredConversations = computed(() => {
    const kw = keywordRef.value.trim().toLowerCase()
    if (!kw) return directConversations.value
    return directConversations.value.filter((item) => {
      const msgText = item.messages.map((msg) => msg.text).join(' ')
      return [item.partner, item.preview, item.updatedAt, msgText].some((text) => text.toLowerCase().includes(kw))
    })
  })

  function persistDirectConversations() {
    localStorage.setItem(DIRECT_CHAT_STORAGE_KEY, JSON.stringify(directConversations.value))
  }

  function moveConversationToTop(conversationId: number) {
    const target = directConversations.value.find((item) => item.id === conversationId)
    if (!target) return
    directConversations.value = [target, ...directConversations.value.filter((item) => item.id !== conversationId)]
  }

  function openDirectChat(conversationId: number) {
    activeConversationId.value = conversationId
    const target = directConversations.value.find((item) => item.id === conversationId)
    if (!target) return
    target.unread = 0
    persistDirectConversations()
  }

  function backToInboxList() {
    activeConversationId.value = null
  }

  function sendDirectMessage() {
    const text = chatDraft.value.trim()
    const conversation = activeConversation.value
    if (!text || !conversation) return

    conversation.messages.push({
      id: Date.now(),
      sender: 'me',
      text,
      time: formatNow()
    })
    conversation.preview = text
    conversation.updatedAt = formatNow()
    conversation.unread = 0
    moveConversationToTop(conversation.id)
    persistDirectConversations()
    chatDraft.value = ''
  }

  function appendConversationMessage(partner: string, text: string, sender: ChatSender) {
    let conversation = directConversations.value.find((item) => item.partner === partner)
    if (!conversation) {
      conversation = {
        id: Date.now(),
        partner,
        preview: '',
        updatedAt: formatNow(),
        unread: 0,
        messages: []
      }
      directConversations.value = [conversation, ...directConversations.value]
    }

    conversation.messages.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      sender,
      text,
      time: formatNow()
    })
    conversation.preview = text
    conversation.updatedAt = formatNow()
    if (sender === 'other') conversation.unread += 1
    moveConversationToTop(conversation.id)
    persistDirectConversations()
    return conversation.id
  }

  return {
    activeConversationId,
    chatDraft,
    directConversations,
    directConversationCount,
    activeConversation,
    filteredConversations,
    openDirectChat,
    backToInboxList,
    sendDirectMessage,
    appendConversationMessage
  }
}
