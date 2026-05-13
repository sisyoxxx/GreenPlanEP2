import { computed, ref, type Ref } from 'vue'

export type InboxType = 'message' | 'reply' | 'like'
export type InboxItem = { id: number; text: string; time: string }

export function useCommunityInbox(keywordRef: Ref<string>, activeInboxRef: Ref<InboxType>) {
  const replyNotifications = ref<InboxItem[]>([
    { id: 1, text: '阳台番茄达人 回复了你：先补光，再适当降温。', time: '刚刚' }
  ])
  const likeNotifications = ref<InboxItem[]>([
    { id: 1, text: '你的帖子《第一次播种成功发芽了》新增 3 个赞。', time: '今天' }
  ])

  const activeInboxItems = computed(() => {
    let list: InboxItem[] = activeInboxRef.value === 'reply' ? replyNotifications.value : likeNotifications.value
    const kw = keywordRef.value.trim().toLowerCase()
    if (!kw) return list
    return list.filter((item) => item.text.toLowerCase().includes(kw) || item.time.toLowerCase().includes(kw))
  })

  const inboxTitle = computed(() =>
    activeInboxRef.value === 'message' ? '私信消息' : activeInboxRef.value === 'reply' ? '评论回复' : '点赞消息'
  )

  const inboxHint = computed(() => {
    if (activeInboxRef.value === 'message') return '点击一条私信可在当前窗口进入聊天框，消息临时保存在浏览器本地。'
    if (activeInboxRef.value === 'reply') return '这里显示帖子回复。'
    return '这里显示点赞动态。'
  })

  function addReplyNotification(text: string) {
    replyNotifications.value.unshift({ id: Date.now(), text, time: '刚刚' })
  }

  function addLikeNotification(text: string) {
    likeNotifications.value.unshift({ id: Date.now(), text, time: '刚刚' })
  }

  return {
    replyNotifications,
    likeNotifications,
    activeInboxItems,
    inboxTitle,
    inboxHint,
    addReplyNotification,
    addLikeNotification
  }
}
