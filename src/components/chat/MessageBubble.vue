<template>
  <div class="message-wrapper" :class="`message-${message.sender}`">
    <!-- 时间戳 -->
    <div v-if="showTimestamp" class="message-timestamp">
      {{ formatTime(message.timestamp) }}
    </div>

    <!-- 系统消息 -->
    <template v-if="message.sender === 'system'">
      <div class="system-message">
        <span>{{ message.content }}</span>
      </div>
    </template>

    <!-- 普通消息（user / ai / staff） -->
    <template v-else>
      <div class="message-row" :class="`row-${message.sender}`">
        <!-- 左侧头像（ai / staff） -->
        <div v-if="message.sender === 'ai' || message.sender === 'staff'" class="avatar">
          <span class="avatar-placeholder">{{ message.sender === 'ai' ? 'AI' : '店' }}</span>
        </div>

        <div class="bubble-column">
          <!-- 发送者标签 -->
          <div v-if="message.sender === 'ai'" class="sender-tag ai-sender-tag">
            <van-tag type="primary">{{ aiSenderLabel }}</van-tag>
          </div>
          <div v-if="message.sender === 'staff'" class="sender-tag">
            <van-tag type="success">人工回复</van-tag>
          </div>

          <!-- 气泡 -->
          <div class="bubble" :class="`bubble-${message.sender}`">
            {{ message.content }}
          </div>

          <!-- 知识库来源（仅 AI 消息 + showKnowledgeSource） -->
          <div
            v-if="showKnowledgeSource && message.sender === 'ai' && message.knowledgeSources && message.knowledgeSources.length > 0"
            class="knowledge-toggle"
          >
            <span class="toggle-link" @click="showSources = !showSources">
              {{ showSources ? '收起知识来源' : '查看知识来源' }}
            </span>
            <KnowledgeSourceCollapse
              v-if="showSources"
              :sources="message.knowledgeSources"
            />
          </div>
        </div>

        <!-- 右侧头像（user） -->
        <div v-if="message.sender === 'user'" class="avatar">
          <span class="avatar-placeholder">U</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Message } from '@/types/conversation'
import KnowledgeSourceCollapse from './KnowledgeSourceCollapse.vue'

withDefaults(defineProps<{
  message: Message
  showKnowledgeSource?: boolean
  showTimestamp?: boolean
  aiSenderLabel?: string
}>(), {
  aiSenderLabel: 'AI客服',
})

const showSources = ref(false)

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}
</script>

<style scoped>
.message-wrapper {
  padding: 0 12px;
  margin-bottom: 16px;
}

.message-timestamp {
  text-align: center;
  color: #BFBFBF;
  font-size: 13px;
  margin-bottom: 8px;
}

/* 系统消息 */
.system-message {
  display: flex;
  justify-content: center;
}

.system-message span {
  background: #F0F0F0;
  border-radius: 4px;
  padding: 8px 16px;
  color: #6A6A6A;
  font-size: 12px;
  max-width: 80%;
  text-align: center;
  word-break: break-word;
}

/* 消息行 */
.message-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.row-user {
  justify-content: flex-end;
}

.row-ai,
.row-staff {
  justify-content: flex-start;
}

/* 头像 */
.avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder {
  font-size: 12px;
  color: #6A6A6A;
  font-weight: 500;
}

/* 气泡列 */
.bubble-column {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.sender-tag {
  margin-bottom: 4px;
}

.ai-sender-tag {
  align-self: flex-end;
}

/* 气泡 */
.bubble {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}

.bubble-user {
  background: #FFFFFF;
  color: #333333;
}

.bubble-ai {
  background: #E7F1FF;
  color: #1B1B1B;
}

.bubble-staff {
  background: #FFFFFF;
  color: #333333;
}

/* 知识库来源切换 */
.knowledge-toggle {
  margin-top: 4px;
}

.toggle-link {
  color: #2563EB;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
}

.toggle-link:hover {
  text-decoration: underline;
}
</style>
