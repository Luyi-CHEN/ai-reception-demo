# 智店通 AI 接待 POC 可交互 Demo

基于 Vue 3 + TypeScript + Vite 构建的 AI 智能客服与店员工作台单页应用，模拟用户-机器人-人工转接的完整对话流程。本 Demo 为纯前端实现，无后端依赖，所有数据均为 Mock。

## 在线体验

- **用户端（C 端 H5 对话页）**：https://luyi-chen.github.io/ai-reception-demo/#/user/chat
- **店员端（B 端工作台）**：https://luyi-chen.github.io/ai-reception-demo/#/staff/list

> 建议以移动端（375px 宽度）或 Chrome DevTools 设备模拟器打开。

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Vue 3.5（Composition API + `<script setup>`） |
| 语言 | TypeScript 6 |
| 构建 | Vite 8 |
| 状态管理 | Pinia 3 |
| 路由 | Vue Router 4（Hash 模式） |
| UI 组件库 | Vant 4（按需自动导入） |
| 自动导入 | unplugin-auto-import + unplugin-vue-components |

## 项目结构

```
demo/
├── .github/workflows/
│   └── deploy.yml                 # GitHub Pages 自动部署
├── public/                        # 静态资源
├── src/
│   ├── components/
│   │   └── chat/
│   │       ├── InputBar.vue             # 底部输入栏（复用）
│   │       ├── IntentTagBar.vue         # 意图识别标签栏
│   │       ├── KnowledgeSourceCollapse.vue  # 知识来源折叠面板
│   │       └── MessageBubble.vue        # 消息气泡（支持多角色）
│   ├── mock/
│   │   ├── conversations.ts       # Mock 对话数据（5 条完整对话）
│   │   └── knowledge.ts           # 知识库数据（产品参数 + 使用安装 FAQ）
│   ├── router/
│   │   └── index.ts               # 路由配置（Hash 模式）
│   ├── stores/
│   │   └── chatStore.ts           # Pinia Store（核心业务逻辑）
│   ├── types/
│   │   └── conversation.ts        # 数据模型定义
│   ├── utils/
│   │   └── time.ts                # 时间格式化工具
│   ├── views/
│   │   ├── user/
│   │   │   └── UserChatPage.vue   # 用户端 - H5 对话页
│   │   └── staff/
│   │       ├── StaffHomePage.vue  # 店员端 - 零售通 APP 首页
│   │       ├── StaffChatList.vue  # 店员端 - 对话列表页
│   │       └── StaffChatDetail.vue # 店员端 - 对话详情页
│   ├── App.vue                    # 根组件
│   ├── main.ts                    # 入口文件
│   └── style.css                  # 全局样式
├── index.html
├── package.json
├── vite.config.ts                 # Vite 构建配置
└── tsconfig*.json                 # TypeScript 配置
```

## 路由配置

| 路径 | 名称 | 页面 |
|------|------|------|
| `/` | — | 重定向至 `/user/chat` |
| `/user/chat` | `userChat` | 用户端对话页 |
| `/staff/list` | `staffHome` | 店员端首页（零售通 APP 复刻） |
| `/staff/conversations` | `staffConversations` | 对话列表页 |
| `/staff/detail/:chatId` | `staffDetail` | 对话详情页 |

## 核心功能

### 用户端（C 端）

- **移动 H5 对话界面**：仿微信式聊天交互，消息气泡自动滚动
- **AI 自动回复**：基于意图识别 + 知识库检索，800~1500ms 模拟延迟
- **知识库匹配**：关键词同义词扩展 + 评分排序，返回最佳匹配内容及知识来源
- **转人工机制**：满足条件后自动转接，展示系统提示话术

### 店员端（B 端）

- **零售通 APP 首页复刻**：状态栏、店面信息卡片、轮播 Banner、消息提醒条、功能网格（金刚区）、销售看板、底部 TabBar
- **金刚区 AI 接待入口**：功能网格首位蓝色高亮图标，点击进入对话列表
- **对话列表页**：
  - IM 平台标识（美团 / 京东 / 企微，彩色标签）
  - 对话状态标签（AI接待中 / 待人工处理 / 人工接待中 / 已完结）
  - 未读消息角标
  - 智能排序（按状态优先级 + 同状态时间升序）
- **对话详情页**：
  - 意图识别标签栏（支持多意图跃迁）
  - 转人工原因通知条
  - 完整对话历史（含知识来源折叠面板）
  - 店员回复输入框（发送后 AI 自动暂停）

## AI 回复逻辑

```
用户发送消息
    ↓
意图识别（正则匹配）
    ├── 售后与保修 → 直接转人工
    ├── 明确要求转人工 → 直接转人工
    ├── 产品咨询 → 产品知识库检索
    │       ├── 命中 → 返回知识库内容 + 知识来源
    │       ├── 第1次未命中 → 尝试性回复（引导用户补充信息）
    │       └── 第2次未命中 → 转人工
    ├── 使用与安装 → 使用安装知识库检索
    │       ├── 命中 → 返回知识库内容 + 知识来源
    │       ├── 第1次未命中 → 尝试性回复
    │       └── 第2次未命中 → 转人工
    └── 未识别 → 转人工
```

知识库检索采用**关键词同义词扩展 + 标题/内容加权评分**机制，先在意图对应知识库中搜索，无匹配时回退到全量知识库。

## 数据模型

### Message（消息）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 消息唯一 ID |
| `sender` | `'user' \| 'ai' \| 'staff' \| 'system'` | 发送者角色 |
| `content` | `string` | 消息内容 |
| `timestamp` | `number` | 时间戳 |
| `intentTag?` | `string` | 意图标签 |
| `knowledgeSources?` | `KnowledgeSource[]` | 知识来源列表 |
| `transferReason?` | `string` | 转人工原因 |

### Conversation（对话）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 对话 ID |
| `userId` | `string` | 用户 ID |
| `userName` | `string` | 用户昵称 |
| `userAvatar` | `string` | 用户头像 URL |
| `storeName` | `string` | 门店名称 |
| `platform` | `IMPlatform` | IM 来源平台 |
| `status` | `'ai_serving' \| 'pending_staff' \| 'staff_serving' \| 'closed'` | 对话状态 |
| `messages` | `Message[]` | 消息列表 |
| `intentTags` | `IntentTag[]` | 意图标签列表 |
| `transferReason?` | `string` | 转人工原因 |
| `unreadCount` | `number` | 未读消息数 |
| `lastMessage` | `string` | 最后一条消息 |
| `lastMessageTime` | `number` | 最后消息时间 |

### IntentTag（意图标签）

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 意图名称 |
| `order` | `number` | 出现顺序 |
| `confidence` | `number` | 置信度 |

### KnowledgeSource（知识来源）

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 知识标题 |
| `similarity` | `number` | 相似度评分 |

### IMPlatform（IM 来源平台）

```typescript
type IMPlatform = 'meituan' | 'jd' | 'wecom'
```

| 值 | 显示名 | 颜色 |
|------|------|------|
| `meituan` | 美团 | `#FF9500`（橙色） |
| `jd` | 京东 | `#FF4D4F`（红色） |
| `wecom` | 企微 | `#52C41A`（绿色） |

## 对话排序规则

对话列表采用**状态优先级 + 同状态时间升序**的排序策略：

| 优先级 | 状态 | 说明 |
|--------|------|------|
| 0（最高） | `pending_staff` | 待人工处理 |
| 1 | `staff_serving` | 人工处理中 |
| 2 | `ai_serving` | AI 接待中 |
| 3（最低） | `closed` | 已完结 |

同一状态下按 `lastMessageTime` 升序排列（等待越久排越靠前）。

## 本地开发

```bash
cd demo
npm install
npm run dev
```

启动后访问终端输出的本地地址即可预览，无需任何后端服务。

## 构建部署

项目通过 **GitHub Actions** 自动部署到 **GitHub Pages**：

- 推送至 `main` 分支即触发自动构建和部署
- 构建命令：`npm run build`
- 部署产物目录：`./dist`
- 基础路径：`/ai-reception-demo/`
- 工作流配置：`.github/workflows/deploy.yml`

## Mock 数据说明

本项目**无任何后端依赖**，所有数据均为前端 Mock：

- **对话数据**（`src/mock/conversations.ts`）：预置 5 条完整对话，覆盖产品咨询、使用安装、知识库未匹配转人工、售后直接转人工、意图跃迁等场景
- **知识库数据**（`src/mock/knowledge.ts`）：包含 4 条产品参数知识 + 5 条使用安装 FAQ，分为产品知识库、使用知识库和全量知识库三个层级
- **用户端实时对话**：用户发送消息后由 `chatStore` 内的 AI 回复引擎实时生成回复，同步更新到店员端对话列表
# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
