<template>
  <van-popup
    :show="visible"
    position="bottom"
    round
    :style="{ height: popupHeight }"
    class="staff-chat-popup"
    @update:show="onVisibleChange"
  >
    <!-- 拖拽条 -->
    <div class="drag-handle-bar">
      <div class="drag-handle"></div>
    </div>

    <!-- 顶部标题栏 -->
    <div class="popup-header">
      <span class="popup-title">对话消息</span>
      <div class="popup-actions">
        <span class="view-all" @click="onViewAll">
          查看全部对话
          <van-icon name="arrow" />
        </span>
        <van-icon name="cross" class="popup-close" @click="onClose" />
      </div>
    </div>

    <!-- 对话列表 -->
    <div class="popup-conversation-list" v-if="conversations.length > 0">
      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="popup-conversation-card"
        @click="onSelect(conv.id)"
      >
        <!-- 左侧头像 -->
        <van-image
          round
          width="44"
          height="44"
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
            <span class="user-name">{{ conv.userName }}</span>
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
    <van-empty v-else description="暂无对话" image="search" class="popup-empty" />
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { TagType } from 'vant'
import type { Conversation } from '@/types/conversation'
import { formatTime } from '@/utils/time'

const props = defineProps<{
  visible: boolean
  conversations: Conversation[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  select: [conversationId: string]
}>()

const router = useRouter()
const isExpanded = ref(false)

const popupHeight = computed(() => (isExpanded.value ? '92vh' : '60vh'))

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      isExpanded.value = false
    }
  },
)

function onVisibleChange(val: boolean) {
  emit('update:visible', val)
}

function onClose() {
  emit('update:visible', false)
}

function onSelect(id: string) {
  emit('select', id)
}

function onViewAll() {
  emit('update:visible', false)
  router.push('/staff/conversations')
}

function getStatusType(status: Conversation['status']): TagType {
  const map: Record<Conversation['status'], TagType> = {
    ai_serving: 'primary',
    pending_staff: 'warning',
    staff_serving: 'success',
    closed: 'default',
  }
  return map[status]
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
.staff-chat-popup {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 拖拽条 */
.drag-handle-bar {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 10px 0 6px;
}

.drag-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #D9D9D9;
}

/* 顶部标题栏 */
.popup-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 12px;
  border-bottom: 1px solid #F0F0F0;
}

.popup-title {
  font-size: 17px;
  font-weight: 600;
  color: #1B1B1B;
}

.popup-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-all {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: #2563EB;
  cursor: pointer;
}

.popup-close {
  font-size: 18px;
  color: #8C8C8C;
  padding: 4px;
  margin-left: 4px;
  cursor: pointer;
}

.popup-close:active {
  opacity: 0.7;
}

/* 对话列表 */
.popup-conversation-list {
  flex: 1;
  overflow-y: auto;
  background: #fff;
}

.popup-conversation-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #F0F0F0;
  background: #fff;
  cursor: pointer;
  min-height: 76px;
  box-sizing: border-box;
  transition: background 0.15s;
}

.popup-conversation-card:active {
  background: #F5F5F5;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-fallback {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  font-size: 18px;
  font-weight: 600;
}

.card-middle {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

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

.msg-time {
  color: #BFBFBF;
  font-size: 12px;
  flex-shrink: 0;
  margin-left: 8px;
}

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

.status-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  margin-left: 8px;
  gap: 4px;
}

.status-tag {
  font-size: 11px !important;
}

.unread-badge {
  align-self: flex-end;
}

.popup-empty {
  flex: 1;
}
</style>
