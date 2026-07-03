<template>
  <div v-if="!conversation" class="empty-page">
    <van-empty description="对话不存在" image="search" />
  </div>

  <div v-else class="staff-chat-detail">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      class="chat-nav-bar"
      :title="conversation.userName"
      left-arrow
      :border="true"
      @click-left="router.back()"
    >
      <template #right>
        <span class="status-text">{{ getStatusText(conversation.status) }}</span>
      </template>
    </van-nav-bar>

    <!-- 转人工原因标记 -->
    <van-notice-bar
      v-if="conversation.transferReason"
      class="transfer-notice"
      left-icon="info-o"
      color="#FF4D4F"
      background="#FFF1F0"
      :text="`触发原因：${conversation.transferReason}`"
      wrapable
    />

    <!-- 意图识别标签栏 -->
    <div v-if="conversation.intentTags && conversation.intentTags.length > 0" class="intent-area">
      <IntentTagBar :tags="conversation.intentTags" />
    </div>

    <!-- 完整对话历史 -->
    <div ref="messageListRef" class="message-list">
      <MessageBubble
        v-for="(message, index) in conversation.messages"
        :key="message.id"
        :message="message"
        :show-timestamp="shouldShowTimestamp(index)"
        :show-knowledge-source="true"
        ai-sender-label="AI回复"
      />
    </div>

    <!-- 底部回复输入框 -->
    <div class="input-area">
      <InputBar placeholder="回复用户消息..." @send="handleSend" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import type { Conversation } from '@/types/conversation'
import { useChatStore } from '@/stores/chatStore'
import MessageBubble from '@/components/chat/MessageBubble.vue'
import IntentTagBar from '@/components/chat/IntentTagBar.vue'
import InputBar from '@/components/chat/InputBar.vue'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()

const messageListRef = ref<HTMLDivElement>()
const chatId = String(route.params.chatId ?? '')
const conversation = computed(() => chatStore.getConversationById(chatId) ?? null)

const FIVE_MINUTES = 5 * 60 * 1000

onMounted(() => {
  const conv = chatStore.getConversationById(chatId)
  if (conv) {
    conv.unreadCount = 0
  }
  scrollToBottom()
})

function shouldShowTimestamp(index: number): boolean {
  if (!conversation.value) return false
  if (index === 0) return true
  const current = conversation.value.messages[index]
  const prev = conversation.value.messages[index - 1]
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

let hasPausedNoticeShown = false

function handleSend(content: string) {
  if (!conversation.value) return

  chatStore.sendStaffMessage(chatId, content)

  scrollToBottom()

  if (!hasPausedNoticeShown) {
    showToast('已发送，AI已暂停自动回复')
    hasPausedNoticeShown = true
  }
}

function getStatusText(status: Conversation['status']): string {
  const map: Record<Conversation['status'], string> = {
    ai_serving: 'AI接待中',
    pending_staff: '待人工处理',
    staff_serving: '人工接待中',
    closed: '已完结',
  }
  return map[status]
}
</script>

<style scoped>
.staff-chat-detail {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #EDF4FF;
}

.chat-nav-bar {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
  --van-nav-bar-background: #FFFFFF;
  --van-nav-bar-border-color: #DCDEE0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

:deep(.chat-nav-bar .van-nav-bar) {
  height: 45px;
}

.transfer-notice {
  flex-shrink: 0;
}

.intent-area {
  flex-shrink: 0;
  background: #FFFFFF;
  border-bottom: 1px solid #E8E8E8;
}

:deep(.intent-area .intent-tag-bar) {
  background: #FFFFFF;
  padding-left: 16px;
  padding-right: 16px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  padding-bottom: 70px;
  background: #EDF4FF;
}

.input-area {
  flex-shrink: 0;
  position: relative;
}

:deep(.input-area .input-bar) {
  position: relative;
  left: auto;
  right: auto;
  bottom: auto;
  z-index: 1;
}

.status-text {
  color: #6A6A6A;
  font-size: 13px;
}

.empty-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F7F8FA;
}
</style>
