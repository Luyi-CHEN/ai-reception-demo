<template>
  <div class="user-chat-page">
    <van-nav-bar
      class="chat-nav-bar"
      title="联想体验店"
      :left-arrow="false"
      :border="true"
      fixed
      placeholder
    />

    <div ref="messageListRef" class="message-list">
      <MessageBubble
        v-for="(message, index) in messages"
        :key="message.id"
        :message="message"
        :show-timestamp="shouldShowTimestamp(index)"
        :show-knowledge-source="false"
      />
      <div v-if="isTyping" class="typing-hint">AI正在输入...</div>
    </div>

    <InputBar
      class="chat-input-bar"
      placeholder="输入您想咨询的问题..."
      @send="handleSend"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import MessageBubble from '@/components/chat/MessageBubble.vue'
import InputBar from '@/components/chat/InputBar.vue'

const chatStore = useChatStore()

const messages = computed(() => chatStore.userConversation.messages)
const isTyping = ref(false)
const isTransferred = computed(() => chatStore.userConversation.status !== 'ai_serving')
const messageListRef = ref<HTMLDivElement>()

const FIVE_MINUTES = 5 * 60 * 1000

function shouldShowTimestamp(index: number): boolean {
  if (index === 0) return true
  const current = messages.value[index]
  const prev = messages.value[index - 1]
  return current.timestamp - prev.timestamp >= FIVE_MINUTES
}

function scrollToBottom() {
  nextTick(() => {
    const el = messageListRef.value
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

async function handleSend(content: string) {
  if (isTransferred.value) {
    await chatStore.sendUserMessage(content)
    chatStore.userConversation.messages.push({
      id: generateId(),
      sender: 'system',
      content: '已转接人工，请耐心等待店员回复',
      timestamp: Date.now(),
    })
    scrollToBottom()
    return
  }

  isTyping.value = true
  scrollToBottom()

  await chatStore.sendUserMessage(content)

  isTyping.value = false
  scrollToBottom()
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.user-chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #EDF4FF;
}

.chat-nav-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  --van-nav-bar-background: #FFFFFF;
  --van-nav-bar-border-color: #DCDEE0;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  padding-bottom: 70px;
  background: #EDF4FF;
}

.typing-hint {
  text-align: center;
  color: #999999;
  font-size: 12px;
  margin-bottom: 12px;
}

.chat-input-bar {
  flex-shrink: 0;
}
</style>
