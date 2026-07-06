<template>
  <div class="staff-chat-list-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="AI接待"
      left-arrow
      @click-left="router.back()"
      fixed
      placeholder
    />

    <!-- 对话列表 -->
    <div class="conversation-list" v-if="conversations.length > 0">
      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="conversation-card"
        @click="goDetail(conv.id)"
      >
        <!-- 左侧头像 -->
        <van-image
          round
          width="40"
          height="40"
          :src="conv.userAvatar"
          fit="cover"
          class="user-avatar"
        >
          <template #error>
            <div class="avatar-fallback">
              {{ conv.userName.charAt(0) }}
            </div>
          </template>
        </van-image>

        <!-- 中间内容 -->
        <div class="card-middle">
          <div class="card-row-top">
            <div class="name-platform">
              <span class="user-name">{{ conv.userName }}</span>
              <van-tag plain :color="getPlatformColor(conv.platform)">
                {{ getPlatformLabel(conv.platform) }}
              </van-tag>
            </div>
            <span class="msg-time">{{ formatTime(conv.lastMessageTime) }}</span>
          </div>
          <div class="card-row-bottom">
            <span class="last-message">{{ conv.lastMessage }}</span>
            <div class="status-area">
              <van-tag
                :type="getStatusType(conv.status)"
                :plain="conv.status === 'ai_serving'"
                size="medium"
                class="status-tag"
              >
                {{ getStatusText(conv.status) }}
              </van-tag>
              <van-badge
                v-if="conv.unreadCount > 0"
                :content="conv.unreadCount"
                class="unread-badge"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty
      v-else
      description="暂无对话"
      image="search"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import type { TagType } from 'vant'
import type { Conversation } from '@/types/conversation'
import { useChatStore } from '@/stores/chatStore'
import { formatTime } from '@/utils/time'

const router = useRouter()
const chatStore = useChatStore()
const { sortedConversations: conversations } = storeToRefs(chatStore)

// 跳转详情
function goDetail(id: string) {
  router.push('/staff/detail/' + id)
}

// 状态 → van-tag type 映射
function getStatusType(status: Conversation['status']): TagType {
  const map: Record<Conversation['status'], TagType> = {
    ai_serving: 'primary',
    pending_staff: 'warning',
    staff_serving: 'success',
    closed: 'default',
  }
  return map[status]
}

// 状态 → 标签文字映射
function getStatusText(status: Conversation['status']): string {
  const map: Record<Conversation['status'], string> = {
    ai_serving: 'AI接待中',
    pending_staff: '待人工处理',
    staff_serving: '人工接待中',
    closed: '已完结',
  }
  return map[status]
}

// IM平台 → 中文标签
function getPlatformLabel(platform: string) {
  const map: Record<string, string> = {
    meituan: '美团',
    jd: '京东',
    wecom: '企微',
  }
  return map[platform] || platform
}

// IM平台 → 标签颜色
function getPlatformColor(platform: string) {
  const map: Record<string, string> = {
    meituan: '#FF9500',
    jd: '#FF4D4F',
    wecom: '#52C41A',
  }
  return map[platform] || '#999'
}
</script>

<style scoped>
.staff-chat-list-page {
  min-height: 100vh;
  background: #F7F8FA;
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

/* NavBar 样式覆盖：高度 44px，白色背景 */
:deep(.van-nav-bar) {
  height: 44px;
  background: #fff;
}

/* 对话列表 */
.conversation-list {
  background: #fff;
}

/* 单条对话卡片 */
.conversation-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #F0F0F0;
  background: #fff;
  cursor: pointer;
  min-height: 72px;
  box-sizing: border-box;
  transition: background 0.15s;
}

.conversation-card:active {
  background: #F5F5F5;
}

/* 头像 */
.user-avatar {
  flex-shrink: 0;
}

.avatar-fallback {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  font-size: 16px;
  font-weight: 600;
}

/* 中间区域 */
.card-middle {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 上行 */
.card-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-name {
  color: #1B1B1B;
  font-size: 15px;
  font-weight: 500;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name-platform {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex-shrink: 1;
}

.msg-time {
  color: #BFBFBF;
  font-size: 12px;
  flex-shrink: 0;
  margin-left: 8px;
}

/* 下行 */
.card-row-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.last-message {
  color: #6A6A6A;
  font-size: 13px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右侧状态区 */
.status-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  margin-left: 8px;
  gap: 4px;
}

/* 状态标签字体大小 */
.status-tag {
  font-size: 11px !important;
}

/* 未读角标 */
.unread-badge {
  align-self: flex-end;
}
</style>
