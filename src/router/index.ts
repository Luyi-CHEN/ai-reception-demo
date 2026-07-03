import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/user/chat' },
  { path: '/user/chat', name: 'userChat', component: () => import('@/views/user/UserChatPage.vue') },
  { path: '/staff/list', name: 'staffHome', component: () => import('@/views/staff/StaffHomePage.vue') },
  { path: '/staff/conversations', name: 'staffConversations', component: () => import('@/views/staff/StaffChatList.vue') },
  { path: '/staff/detail/:chatId', name: 'staffDetail', component: () => import('@/views/staff/StaffChatDetail.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
