import { ref } from 'vue'
import { aiChat, type AiChatMessage } from '../api'

export type ChatRole = 'user' | 'assistant'
export type ChatMsg = { id: number; role: ChatRole; content: string }

export function useTutorialChat() {
  const chatSending = ref(false)
  const chatMessages = ref<ChatMsg[]>([])

  async function sendChat(text: string) {
    if (!text || chatSending.value) return

    const idBase = Date.now()
    chatMessages.value.push({ id: idBase, role: 'user', content: text })
    chatSending.value = true
    try {
      const payload: AiChatMessage[] = [
        {
          role: 'system',
          content: '你是家庭种植助手，请给出简洁且可执行的步骤建议。'
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
    }
  }

  function clearChat() {
    chatMessages.value = []
  }

  return {
    chatSending,
    chatMessages,
    sendChat,
    clearChat
  }
}
