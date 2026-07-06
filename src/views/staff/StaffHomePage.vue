<template>
  <div class="staff-home">
    <!-- 状态栏 -->
    <div class="status-bar">
      <span class="status-time">18:51</span>
      <div class="status-icons">
        <van-icon name="bar-chart-o" class="signal-icon" />
        <van-icon name="wifi-o" class="wifi-icon" />
        <van-icon name="todo-list-o" class="battery-icon" />
      </div>
    </div>

    <!-- 顶部：切换店面 + 消息图标 -->
    <div class="home-header">
      <div class="store-switch">
        <span class="store-switch-text">切换店面</span>
        <van-icon name="arrow-down" class="store-switch-arrow" />
      </div>
      <div class="header-message" @click="goConversations">
        <van-badge :content="totalUnreadCount > 99 ? '99+' : totalUnreadCount" :show-zero="false">
          <van-icon name="chat-o" class="header-message-icon" />
        </van-badge>
      </div>
    </div>

    <!-- 店面信息卡片 -->
    <div class="store-card">
      <div class="store-card-header">
        <div class="store-avatar">L</div>
        <div class="store-info">
          <div class="store-name">智店通-城市专卖店-授权-D00000001</div>
          <div class="store-subtitle">隶属于：智店通经销商</div>
        </div>
      </div>
      <div class="store-info-bar">
        <div class="store-address">
          <span class="info-label">店面地址:</span>
          <span class="info-value">智店通-城市专卖店-授权-D00000001</span>
        </div>
        <div class="store-detail-link">
          <span>查看详情</span>
          <van-icon name="arrow" />
        </div>
      </div>
      <div class="store-meta">
        <span class="meta-item">城市级别:--</span>
        <span class="meta-divider">|</span>
        <span class="meta-item">商圈属性:--</span>
        <span class="meta-divider">|</span>
        <span class="meta-item">店铺面积:--m²</span>
        <span class="meta-divider">|</span>
        <span class="meta-item">人员:<span class="meta-highlight">4名</span></span>
      </div>
    </div>

    <!-- 轮播 Banner -->
    <div class="banner-card">
      <div class="banner-swiper">
        <div class="banner-slide">
          <van-image
            class="banner-image"
            src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
            fit="cover"
          />
        </div>
        <div class="banner-indicators">
          <span class="indicator active"></span>
          <span class="indicator"></span>
        </div>
      </div>
    </div>

    <!-- 消息提醒条 -->
    <div class="notice-bar" @click="goConversations">
      <div class="notice-left">
        <span class="notice-title">消息提醒</span>
        <span class="notice-divider">|</span>
        <span class="notice-code">061701</span>
        <van-tag color="#FF4D4F" text-color="#fff" class="notice-tag">未读</van-tag>
      </div>
      <van-icon name="arrow" class="notice-arrow" />
    </div>

    <!-- 功能网格 -->
    <div class="feature-grid-card">
      <div class="feature-grid">
        <!-- AI接待入口 -->
        <div class="feature-item feature-item-ai" @click="goConversations">
          <van-badge :content="totalUnreadCount > 99 ? '99+' : totalUnreadCount" :show-zero="false">
            <div class="feature-icon feature-icon-ai">
              <van-icon name="chat-o" />
            </div>
          </van-badge>
          <span class="feature-name">AI接待</span>
        </div>
        <div v-for="item in featureList" :key="item.name" class="feature-item">
          <div class="feature-icon" :style="{ background: item.bg, color: item.color }">
            <van-icon :name="item.icon" />
          </div>
          <span class="feature-name">{{ item.name }}</span>
        </div>
      </div>
      <div class="grid-indicators">
        <span class="indicator active"></span>
        <span class="indicator"></span>
      </div>
    </div>

    <!-- 我的销售看板 -->
    <div class="sales-board">
      <div class="sales-board-header">
        <div class="sales-board-title">
          <van-icon name="chart-trending-o" class="sales-board-icon" />
          <span>我的销售看板</span>
          <van-icon name="info-o" class="sales-info-icon" />
        </div>
        <div class="sales-update-time">数据更新至 {{ today }}</div>
      </div>
      <div class="sales-date-row">
        <div class="date-tabs">
          <span
            v-for="tab in dateTabs"
            :key="tab"
            class="date-tab"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </span>
        </div>
        <div class="current-date">
          <span>{{ today }}</span>
          <van-icon name="calendar-o" class="calendar-icon" />
        </div>
      </div>
      <div class="sales-metrics">
        <div class="metric-item">
          <div class="metric-label">销售额</div>
          <div class="metric-value">¥0.00</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">订单数</div>
          <div class="metric-value">0</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">客单价</div>
          <div class="metric-value">¥0.00</div>
        </div>
      </div>
    </div>

    <!-- 底部 TabBar -->
    <van-tabbar v-model="activeTabbar" fixed active-color="#2563EB" inactive-color="#999999">
      <van-tabbar-item icon="apps-o">工作台</van-tabbar-item>
      <van-tabbar-item icon="goods-collect-o">库存管理</van-tabbar-item>
      <van-tabbar-item icon="desktop-o">联想POS</van-tabbar-item>
      <van-tabbar-item icon="user-o">个人中心</van-tabbar-item>
      <van-tabbar-item icon="chat-o">AI助手</van-tabbar-item>
    </van-tabbar>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chatStore'

const router = useRouter()
const chatStore = useChatStore()
const { totalUnreadCount } = storeToRefs(chatStore)

const activeTabbar = ref(0)
const activeTab = ref('日')

const today = computed(() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const dateTabs = ['日', '周', '月', '季']

const featureList = [
  { name: '伙伴商城', icon: 'shop-o', bg: '#FFF1F0', color: '#FF4D4F' },
  { name: 'YK_POS', icon: 'credit-pay', bg: '#FFF2E8', color: '#FA541C' },
  { name: '商品查询', icon: 'search', bg: '#E6F7FF', color: '#1890FF' },
  { name: '联想服务产品', icon: 'like-o', bg: '#FFF0F6', color: '#EB2F96' },
  { name: '卡券核销', icon: 'balance-pay', bg: '#F6FFED', color: '#52C41A' },
  { name: '全网营销', icon: 'point-gift-o', bg: '#FFF7E6', color: '#FA8C16' },
  { name: 'POSA卡', icon: 'printer-o', bg: '#F9F0FF', color: '#722ED1' },
  { name: '门店优惠核销', icon: 'qr', bg: '#F6FFED', color: '#52C41A' },
]

function goConversations() {
  router.push('/staff/conversations')
}
</script>

<style scoped>
.staff-home {
  max-width: 375px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(180deg, #EDF4FF 0%, #FFFFFF 320px);
  padding-bottom: calc(50px + env(safe-area-inset-bottom, 0px) + 16px);
  box-sizing: border-box;
  position: relative;
}

/* 状态栏 */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 4px;
  font-size: 14px;
  font-weight: 600;
  color: #1B1B1B;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.signal-icon {
  transform: rotate(90deg);
}

/* 顶部 */
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 12px;
}

.store-switch {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  font-weight: 600;
  color: #1B1B1B;
}

.store-switch-arrow {
  font-size: 12px;
  color: #666;
}

.header-message {
  position: relative;
  padding: 4px;
  cursor: pointer;
}

.header-message-icon {
  font-size: 24px;
  color: #1B1B1B;
}

/* 店面卡片 */
.store-card {
  margin: 0 12px 12px;
  padding: 16px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.store-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.store-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.store-info {
  flex: 1;
  min-width: 0;
}

.store-name {
  font-size: 15px;
  font-weight: 600;
  color: #1B1B1B;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-subtitle {
  font-size: 12px;
  color: #8C8C8C;
  margin-top: 4px;
}

.store-info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #EDF4FF;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
}

.store-address {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #1B1B1B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-label {
  color: #595959;
}

.store-detail-link {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: #595959;
  flex-shrink: 0;
  margin-left: 8px;
}

.store-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 0;
  font-size: 12px;
  color: #8C8C8C;
}

.meta-divider {
  margin: 0 6px;
  color: #D9D9D9;
}

.meta-highlight {
  color: #1B1B1B;
  font-weight: 500;
}

/* Banner */
.banner-card {
  margin: 0 12px 12px;
  padding: 12px;
  background: #FFE4E8;
  border-radius: 12px;
}

.banner-swiper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.banner-image {
  width: 100%;
  height: 130px;
  display: block;
}

.banner-indicators {
  position: absolute;
  left: 50%;
  bottom: 8px;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
}

.indicator.active {
  background: #2563EB;
}

/* 消息提醒条 */
.notice-bar {
  margin: 0 12px 12px;
  padding: 12px 14px;
  background: #FFFFFF;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.notice-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-title {
  font-size: 15px;
  font-weight: 600;
  color: #FF4D4F;
}

.notice-divider {
  color: #D9D9D9;
}

.notice-code {
  font-size: 14px;
  color: #1B1B1B;
}

.notice-tag {
  font-size: 11px !important;
  padding: 2px 8px !important;
}

.notice-arrow {
  font-size: 14px;
  color: #BFBFBF;
}

/* 功能网格 */
.feature-grid-card {
  margin: 0 12px 12px;
  padding: 16px 12px 12px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  row-gap: 18px;
  column-gap: 8px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.feature-name {
  font-size: 12px;
  color: #262626;
}

.grid-indicators {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
}

/* 销售看板 */
.sales-board {
  margin: 0 12px 12px;
  padding: 16px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.sales-board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.sales-board-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #1B1B1B;
}

.sales-board-icon {
  color: #2563EB;
  font-size: 18px;
}

.sales-info-icon {
  color: #BFBFBF;
  font-size: 14px;
}

.sales-update-time {
  font-size: 12px;
  color: #8C8C8C;
}

.sales-date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.date-tabs {
  display: flex;
  gap: 8px;
}

.date-tab {
  padding: 5px 14px;
  border-radius: 16px;
  font-size: 13px;
  color: #595959;
  background: #F5F5F5;
  cursor: pointer;
}

.date-tab.active {
  color: #2563EB;
  background: #EDF4FF;
  font-weight: 500;
}

.current-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #595959;
}

.calendar-icon {
  color: #2563EB;
}

.sales-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.metric-item {
  text-align: center;
}

.metric-label {
  font-size: 12px;
  color: #8C8C8C;
  margin-bottom: 6px;
}

.metric-value {
  font-size: 15px;
  font-weight: 600;
  color: #1B1B1B;
}

/* AI接待图标 */
.feature-item-ai {
  cursor: pointer;
}

.feature-icon-ai {
  background: #2563EB;
  color: #FFFFFF;
}

/* TabBar 高度适配 */
:deep(.van-tabbar) {
  height: 50px;
}
</style>
