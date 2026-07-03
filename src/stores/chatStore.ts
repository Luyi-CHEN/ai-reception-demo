import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Conversation, Message, KnowledgeSource } from '@/types/conversation'
import { mockConversations } from '@/mock/conversations'
import { knowledgeBase, productKnowledge, usageKnowledge } from '@/mock/knowledge'

/** 转人工统一话术 */
const TRANSFER_MESSAGE =
  '系统正在为您加急转接人工中，请稍后，门店高峰期店员可能无法及时回答，您也可以直接电话联系哈，谢谢。'

/** 门店名称 */
const STORE_NAME = '联想体验店'

/** 消息ID计数器 */
let msgIdCounter = 0
function nextMsgId() {
  return `msg-${Date.now()}-${++msgIdCounter}`
}

/** 意图识别规则 */
const INTENT_RULES: { pattern: RegExp; intent: string; action: 'transfer' | 'knowledge' }[] = [
  { pattern: /退货|退款|坏了|碎了|质量|维修|售后/, intent: '售后与保修', action: 'transfer' },
  { pattern: /人工|客服|投诉|店长/, intent: '明确要求转人工', action: 'transfer' },
  { pattern: /蓝牙|连接|安装|系统|重装|卡|卡顿|慢|怎么用|怎么装|怎么连|怎么设置|wifi|无线|网络/i, intent: '使用与安装', action: 'knowledge' },
  {
    pattern: /配置|能玩|玩游戏|打游戏|性能|内存|处理器|推荐|哪款|多大|屏幕|电池|能够玩|够玩|够不够|适合|合适|续航|分辨率|像素|摄像头|显卡|存储|硬盘|预算|价格多少|多少钱/,
    intent: '产品咨询',
    action: 'knowledge',
  },
]

export const useChatStore = defineStore('chat', () => {
  // ==================== State ====================
  const conversations = ref<Conversation[]>([])
  const userConversation = ref<Conversation>({
    id: 'user-chat-1',
    userId: 'current-user',
    userName: '当前用户',
    userAvatar: '',
    storeName: STORE_NAME,
    status: 'ai_serving',
    messages: [],
    intentTags: [],
    unreadCount: 0,
    lastMessage: '',
    lastMessageTime: 0,
  })
  const aiModeMap = ref<Record<string, boolean>>({})

  /** 未识别次数跟踪 */
  let unrecognizedCount = 0

  /** 产品咨询知识库未匹配次数跟踪 */
  let productNoMatchCount = 0

  // ==================== Getters ====================
  const totalUnreadCount = computed(() => {
    return conversations.value.reduce((sum, c) => sum + c.unreadCount, 0)
  })

  const sortedConversations = computed(() => {
    return [...conversations.value].sort((a, b) => b.lastMessageTime - a.lastMessageTime)
  })

  function getConversationById(id: string): Conversation | undefined {
    return conversations.value.find((c) => c.id === id)
  }

  // ==================== Actions ====================

  /** 初始化Store */
  function initStore() {
    conversations.value = JSON.parse(JSON.stringify(mockConversations))

    conversations.value.forEach((c) => {
      aiModeMap.value[c.id] = true
    })

    const now = Date.now()
    const welcomeMsg: Message = {
      id: nextMsgId(),
      sender: 'ai',
      content: '您好！我是联想体验店AI客服，有什么可以帮您的？',
      timestamp: now,
    }
    userConversation.value = {
      id: 'user-chat-1',
      userId: 'current-user',
      userName: '当前用户',
      userAvatar: '',
      storeName: STORE_NAME,
      status: 'ai_serving',
      messages: [welcomeMsg],
      intentTags: [],
      unreadCount: 0,
      lastMessage: welcomeMsg.content,
      lastMessageTime: now,
    }
    unrecognizedCount = 0
    productNoMatchCount = 0
  }

  // ==================== 知识库匹配 ====================

  /** 关键词同义词扩展映射 */
  const KEYWORD_SYNONYMS: Record<string, string[]> = {
    '游戏': ['能玩', '帧率', '3A', '大作', '玩游戏', '打游戏', '显卡', 'RTX', '独显', '独立显卡'],
    '玩游戏': ['游戏', '能玩', '帧率', '3A', '大作', '显卡', 'RTX', '独显', '独立显卡'],
    '显卡': ['RTX', '独显', '独立显卡', '图形卡', '游戏'],
    '屏幕': ['分辨率', '色域', '刷新率', '显示', '像素'],
    '电池': ['续航', '充电', '电量'],
    '内存': ['RAM', '存储', 'DDR'],
    '存储': ['硬盘', 'SSD', '容量'],
    '硬盘': ['SSD', '存储', '容量'],
    '蓝牙': ['无线', '耳机', '配对'],
    '卡': ['卡顿', '慢', '流畅', '性能'],
    '退货': ['退款', '退换', '换货'],
    '质量': ['坏点', '故障', '损坏'],
  }

  function expandKeywords(keywords: string[]): string[] {
    const expanded = new Set(keywords)
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase()
      for (const [key, synonyms] of Object.entries(KEYWORD_SYNONYMS)) {
        if (key === kwLower || synonyms.some((s) => kwLower.includes(s) || s.includes(kwLower))) {
          expanded.add(key)
          synonyms.forEach((s) => expanded.add(s))
        }
      }
    }
    return [...expanded].filter((k) => k.length > 1)
  }

  type KnowledgeItem = (typeof knowledgeBase)[0]

  function searchInPool(
    pool: KnowledgeItem[],
    keywords: string[],
  ): { item: KnowledgeItem; score: number }[] {
    return pool
      .map((item) => {
        let score = 0
        const titleLower = item.title.toLowerCase()
        const contentLower = item.content.toLowerCase()

        for (const kw of keywords) {
          const kwLower = kw.toLowerCase()
          if (titleLower.includes(kwLower)) score += 3
          if (contentLower.includes(kwLower)) score += 1
        }
        return { item, score }
      })
      .filter((r) => r.score >= 2)
      .sort((a, b) => b.score - a.score)
  }

  function searchKnowledge(
    query: string,
    intent: string,
  ): { content: string; sources: KnowledgeSource[] } | null {
    // 根据意图选择对应知识库
    let primaryPool: KnowledgeItem[] = knowledgeBase
    if (intent === '产品咨询') {
      primaryPool = productKnowledge
    } else if (intent === '使用与安装') {
      primaryPool = usageKnowledge
    }

    // 提取并扩展查询关键词
    const rawKeywords = query
      .replace(/[？?！!。，,、\n]/g, ' ')
      .split(/\s+/)
      .filter((k) => k.length > 1)
    const keywords = expandKeywords(rawKeywords)

    // 先在意图对应池中搜索
    let scored = searchInPool(primaryPool, keywords)

    // 如果主池无匹配，回退到全量知识库搜索
    if (scored.length === 0 && primaryPool !== knowledgeBase) {
      scored = searchInPool(knowledgeBase, keywords)
    }

    if (scored.length === 0) return null

    // 取最佳匹配的内容作为回复，同时返回多个匹配源
    const best = scored[0]
    const sources: KnowledgeSource[] = scored.slice(0, 3).map((r) => ({
      title: r.item.title,
      similarity: Math.min(0.99, 0.6 + r.score * 0.08),
    }))

    return {
      content: best.item.content,
      sources,
    }
  }

  // ==================== 转人工逻辑 ====================

  /** 根据转人工原因生成上下文相关的AI解释回复 */
  function getTransferReply(reason: string, intent: string): string {
    if (reason === '售后与保修' || intent === '售后与保修') {
      return '您好，非常抱歉给您带来不便。您提到的问题属于售后保修服务范畴，需要人工客服为您核实处理，正在为您转接门店客服。'
    }
    if (reason === '明确要求转人工') {
      return '好的，已为您转接人工客服，请稍候。'
    }
    if (reason.startsWith('AI无法匹配')) {
      return '抱歉，您的问题暂时超出了我的知识范围，无法为您提供准确的解答。已为您转接人工客服，由专业店员为您详细解答，请稍候。'
    }
    if (reason.startsWith('多次未识别')) {
      return '抱歉，我暂时无法准确理解您的需求，已为您转接人工客服，由专业店员为您服务，请稍候。'
    }
    if (intent) {
      return `了解到您遇到了${intent}相关的问题，这需要人工客服为您处理，正在为您转接门店客服。`
    }
    return '好的，正在为您转接人工客服，请稍候。'
  }

  function handleTransfer(reason: string, intent?: string) {
    const now = Date.now()
    const currentIntent = intent || reason

    updateIntentTags(currentIntent)

    const aiMsg: Message = {
      id: nextMsgId(),
      sender: 'ai',
      content: getTransferReply(reason, currentIntent),
      timestamp: now,
      intentTag: currentIntent,
      transferReason: reason,
    }

    const sysMsg: Message = {
      id: nextMsgId(),
      sender: 'system',
      content: TRANSFER_MESSAGE,
      timestamp: now + 100,
      transferReason: reason,
    }

    userConversation.value.messages.push(aiMsg, sysMsg)
    userConversation.value.status = 'pending_staff'
    userConversation.value.transferReason = reason
    userConversation.value.lastMessage = TRANSFER_MESSAGE
    userConversation.value.lastMessageTime = now + 100

    const existingConv = conversations.value.find((c) => c.id === userConversation.value.id)
    if (existingConv) {
      existingConv.messages.push(aiMsg, sysMsg)
      existingConv.status = 'pending_staff'
      existingConv.transferReason = reason
      existingConv.lastMessage = TRANSFER_MESSAGE
      existingConv.lastMessageTime = now + 100
      existingConv.unreadCount += 2
      existingConv.intentTags = [...userConversation.value.intentTags]
    } else {
      const newConv: Conversation = {
        id: userConversation.value.id,
        userId: userConversation.value.userId,
        userName: userConversation.value.userName,
        userAvatar:
          userConversation.value.userAvatar ||
          'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        storeName: STORE_NAME,
        status: 'pending_staff',
        messages: [...userConversation.value.messages],
        intentTags: [...userConversation.value.intentTags],
        transferReason: reason,
        unreadCount: userConversation.value.messages.filter((m) => m.sender === 'user').length,
        lastMessage: TRANSFER_MESSAGE,
        lastMessageTime: now + 100,
      }
      conversations.value.push(newConv)
    }
  }

  // ==================== AI回复逻辑 ====================

  function getAIReply(userMessage: string): Promise<void> {
    const delay = 800 + Math.floor(Math.random() * 700)

    return new Promise((resolve) => {
      setTimeout(() => {
        const now = Date.now()

        // 意图识别
        let matchedIntent: string | null = null
        let matchedAction: 'transfer' | 'knowledge' | null = null

        for (const rule of INTENT_RULES) {
          if (rule.pattern.test(userMessage)) {
            matchedIntent = rule.intent
            matchedAction = rule.action
            break
          }
        }

        // 处理转人工意图
        if (matchedAction === 'transfer') {
          handleTransfer(matchedIntent!, matchedIntent ?? undefined)
          resolve()
          return
        }

        // 处理知识库查询
        if (matchedAction === 'knowledge' && matchedIntent) {
          const result = searchKnowledge(userMessage, matchedIntent)

          if (result) {
            productNoMatchCount = 0
            const aiMsg: Message = {
              id: nextMsgId(),
              sender: 'ai',
              content: result.content,
              timestamp: now,
              intentTag: matchedIntent,
              knowledgeSources: result.sources,
            }
            userConversation.value.messages.push(aiMsg)
            userConversation.value.lastMessage = result.content
            userConversation.value.lastMessageTime = now

            updateIntentTags(matchedIntent)
            syncToConversations(aiMsg)
            resolve()
            return
          } else {
            productNoMatchCount++

            if (productNoMatchCount === 1) {
              // 第一次未匹配：基于通用产品信息给尝试性回复
              const tryReply =
                '您好，您咨询的产品问题比较具体，我暂时没有找到完全匹配的信息。建议您提供具体型号或需求，方便我进一步为您查找。'
              const aiMsg: Message = {
                id: nextMsgId(),
                sender: 'ai',
                content: tryReply,
                timestamp: now,
                intentTag: matchedIntent,
              }
              userConversation.value.messages.push(aiMsg)
              userConversation.value.lastMessage = tryReply
              userConversation.value.lastMessageTime = now

              updateIntentTags(matchedIntent)
              syncToConversations(aiMsg)
              resolve()
              return
            }

            // 第二次及以上未匹配：直接转人工
            handleTransfer('触发原因：知识库未匹配到相关内容', matchedIntent)
            resolve()
            return
          }
        }

        // ==================== 未识别意图 - 直接转人工 ====================
        unrecognizedCount++
        handleTransfer('触发原因：未识别到用户意图', '未识别')
        resolve()
      }, delay)
    })
  }

  /** 更新意图标签 */
  function updateIntentTags(intentName: string) {
    const existing = userConversation.value.intentTags.find((t) => t.name === intentName)
    if (!existing) {
      const maxOrder = userConversation.value.intentTags.reduce(
        (max, t) => Math.max(max, t.order),
        0,
      )
      userConversation.value.intentTags.push({
        name: intentName,
        order: maxOrder + 1,
        confidence: 0.85,
      })
    }
  }

  /** 同步消息到店员端对话列表 */
  function syncToConversations(msg: Message) {
    const convId = userConversation.value.id
    const existingConv = conversations.value.find((c) => c.id === convId)
    if (existingConv) {
      existingConv.messages.push(msg)
      existingConv.lastMessage = msg.content
      existingConv.lastMessageTime = msg.timestamp
      existingConv.unreadCount += 1
      existingConv.intentTags = [...userConversation.value.intentTags]
    } else {
      const newConv: Conversation = {
        id: convId,
        userId: userConversation.value.userId,
        userName: userConversation.value.userName,
        userAvatar:
          userConversation.value.userAvatar ||
          'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        storeName: STORE_NAME,
        status: 'ai_serving',
        messages: [...userConversation.value.messages],
        intentTags: [...userConversation.value.intentTags],
        unreadCount: userConversation.value.messages.filter((m) => m.sender === 'user').length,
        lastMessage: msg.content,
        lastMessageTime: msg.timestamp,
      }
      conversations.value.push(newConv)
    }
  }

  // ==================== 用户发消息 ====================

  function sendUserMessage(content: string): Promise<void> {
    const now = Date.now()
    const userMsg: Message = {
      id: nextMsgId(),
      sender: 'user',
      content,
      timestamp: now,
    }

    userConversation.value.messages.push(userMsg)
    userConversation.value.lastMessage = content
    userConversation.value.lastMessageTime = now

    syncToConversations(userMsg)

    // 已转人工时不再触发AI回复
    if (userConversation.value.status !== 'ai_serving') {
      return Promise.resolve()
    }

    return getAIReply(content)
  }

  // ==================== 店员发消息 ====================

  function sendStaffMessage(conversationId: string, content: string) {
    const now = Date.now()
    let conv = conversations.value.find((c) => c.id === conversationId)

    if (!conv) {
      const uc = userConversation.value
      conv = {
        id: conversationId,
        userId: uc.userId,
        userName: uc.userName,
        userAvatar: uc.userAvatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        storeName: uc.storeName,
        status: 'pending_staff',
        messages: [...uc.messages],
        intentTags: [...uc.intentTags],
        transferReason: uc.transferReason,
        unreadCount: uc.messages.filter((m) => m.sender === 'user').length,
        lastMessage: uc.lastMessage,
        lastMessageTime: uc.lastMessageTime,
      }
      conversations.value.push(conv)
    }

    const staffMsg: Message = {
      id: nextMsgId(),
      sender: 'staff',
      content,
      timestamp: now,
    }

    conv.messages.push(staffMsg)
    conv.status = 'staff_serving'
    conv.lastMessage = content
    conv.lastMessageTime = now
    aiModeMap.value[conversationId] = false

    if (conversationId === userConversation.value.id) {
      userConversation.value.messages.push(staffMsg)
      userConversation.value.status = 'staff_serving'
      userConversation.value.lastMessage = content
      userConversation.value.lastMessageTime = now
    }
  }

  // ==================== 切换AI模式 ====================

  function switchToAIMode(conversationId: string) {
    aiModeMap.value[conversationId] = true
    const conv = conversations.value.find((c) => c.id === conversationId)
    if (conv) {
      conv.status = 'ai_serving'
    }

    if (conversationId === userConversation.value.id) {
      const now = Date.now()
      const welcomeMsg: Message = {
        id: nextMsgId(),
        sender: 'ai',
        content: '您好！我是联想体验店AI客服，有什么可以帮您的？',
        timestamp: now,
      }
      userConversation.value.messages.push(welcomeMsg)
      userConversation.value.status = 'ai_serving'
      userConversation.value.lastMessage = welcomeMsg.content
      userConversation.value.lastMessageTime = now
    }
  }

  // ==================== 清除用户对话 ====================

  function clearUserChat() {
    const now = Date.now()
    const welcomeMsg: Message = {
      id: nextMsgId(),
      sender: 'ai',
      content: '您好！我是联想体验店AI客服，有什么可以帮您的？',
      timestamp: now,
    }
    userConversation.value = {
      id: 'user-chat-1',
      userId: 'current-user',
      userName: '当前用户',
      userAvatar: '',
      storeName: STORE_NAME,
      status: 'ai_serving',
      messages: [welcomeMsg],
      intentTags: [],
      unreadCount: 0,
      lastMessage: welcomeMsg.content,
      lastMessageTime: now,
    }
    unrecognizedCount = 0
    productNoMatchCount = 0
  }

  // ==================== 暴露接口 ====================
  return {
    conversations,
    userConversation,
    aiModeMap,
    totalUnreadCount,
    sortedConversations,
    getConversationById,
    initStore,
    sendUserMessage,
    sendStaffMessage,
    switchToAIMode,
    clearUserChat,
  }
})
