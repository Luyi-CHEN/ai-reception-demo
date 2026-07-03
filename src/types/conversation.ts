export interface KnowledgeSource {
  title: string
  similarity: number
}

export interface IntentTag {
  name: string
  order: number
  confidence: number
}

export interface Message {
  id: string
  sender: 'user' | 'ai' | 'staff' | 'system'
  content: string
  timestamp: number
  intentTag?: string
  knowledgeSources?: KnowledgeSource[]
  transferReason?: string
}

export interface Conversation {
  id: string
  userId: string
  userName: string
  userAvatar: string
  storeName: string
  status: 'ai_serving' | 'pending_staff' | 'staff_serving' | 'closed'
  messages: Message[]
  intentTags: IntentTag[]
  transferReason?: string
  unreadCount: number
  lastMessage: string
  lastMessageTime: number
}
