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

---

## 后续开发指南

本项目当前为纯前端Mock驱动的POC Demo，无真实后端。以下说明各角色工程师如何在此基础上继续开发。

### 环境准备（通用）

```bash
# 克隆仓库
git clone https://github.com/Luyi-CHEN/ai-reception-demo.git
cd ai-reception-demo

# 安装依赖
npm install

# 启动本地开发服务器（热更新）
npm run dev

# 构建生产版本
npm run build
```

### 前端工程师

**扩展点：**

1. **新增页面/组件**
   - 在 `src/views/` 下按角色（user/staff）创建 `.vue` 文件
   - 在 `src/router/index.ts` 中注册路由（使用懒加载）
   - 共享组件放入 `src/components/chat/`
   - 使用 Vant 4 组件库，无需手动 import（自动按需导入）

2. **样式规范**
   - 使用 `<style scoped>` 隔离组件样式
   - 颜色使用 CSS 变量（定义在 `src/style.css` 的 `:root`）
   - 主色 `#2563EB`，背景 `#EDF4FF`，参考设计规范文档

3. **状态管理**
   - 核心逻辑集中在 `src/stores/chatStore.ts`（Pinia Composition API 风格）
   - 新增业务状态建议创建独立 store 文件

4. **对接真实API**
   - 在 `src/stores/chatStore.ts` 中找到 `getAIReply()` 方法
   - 将内部的关键词匹配逻辑替换为 HTTP 请求（如 `fetch` 或 `axios`）
   - 建议创建 `src/api/` 目录统一管理接口调用

### 后端工程师

**当前Mock逻辑 → 真实API的替换路径：**

1. **对话消息API**
   - 当前：`chatStore.ts` 中 `sendUserMessage()` 直接调用本地 `getAIReply()`
   - 替换为：`POST /api/chat/send` → 后端处理意图识别+知识库检索 → 返回AI回复
   - 接口建议格式：
     ```json
     // Request
     { "conversationId": "string", "message": "string", "platform": "meituan|jd|wecom" }
     // Response
     { "reply": "string", "intent": "string", "sources": [...], "shouldTransfer": boolean }
     ```

2. **对话列表API**
   - 当前：`chatStore.ts` 中 `conversations` 为本地 reactive 数组
   - 替换为：`GET /api/conversations` → 返回对话列表（含状态、平台、最后消息等）

3. **知识库检索API**
   - 当前：`chatStore.ts` 中 `searchKnowledge()` 为本地关键词匹配
   - 替换为：`POST /api/knowledge/search` → 后端向量检索或ES全文搜索

4. **转人工逻辑**
   - 当前：前端根据规则判断是否转人工
   - 替换为：后端统一决策，返回 `shouldTransfer: true` 时前端切换状态

5. **WebSocket（可选）**
   - 店员端实时接收新消息/状态变更，建议用 WebSocket 替代轮询

### 算法工程师

**当前意图识别逻辑 → 算法服务的替换路径：**

1. **意图识别**
   - 当前实现：`chatStore.ts` 中 `getAIReply()` 使用正则关键词匹配
   - 支持的意图：产品咨询、使用与安装、售后与保修、明确转人工、未识别
   - 替换为：NLU模型服务（如 BERT/GPT 意图分类）
   - 接口建议：`POST /api/nlu/classify` → `{ "intent": "product_consult", "confidence": 0.95 }`

2. **知识库检索**
   - 当前实现：`mock/knowledge.ts` 中硬编码9条产品/FAQ数据 + 关键词同义词扩展匹配
   - 替换为：RAG（检索增强生成）
     - 向量数据库存储产品文档/FAQ
     - Embedding模型将用户问题向量化
     - Top-K 检索 + LLM 生成回复

3. **转人工决策**
   - 当前规则：售后→直接转；未识别→直接转；知识库无匹配→转；同一问题第2次→转
   - 优化方向：基于对话上下文的多轮判断、用户情绪识别、置信度阈值动态调整

4. **回复生成**
   - 当前：直接返回知识库原文
   - 优化为：LLM 基于检索结果生成自然语言回复（RAG模式）

### 协作开发流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  前端工程师   │     │  后端工程师   │     │  算法工程师   │
│             │     │             │     │             │
│ Vue组件开发  │◄───►│ API接口开发  │◄───►│ NLU/RAG服务  │
│ 页面交互优化  │     │ 数据库设计   │     │ 意图识别模型  │
│ UI/UX迭代   │     │ WebSocket   │     │ 知识库检索   │
└─────────────┘     └─────────────┘     └─────────────┘
        │                   │                   │
        └───────────────────┴───────────────────┘
                            │
                     API Contract
                    (统一接口约定)
```

### 关键文件索引

| 文件 | 用途 | 替换/扩展说明 |
|------|------|-------------|
| `src/stores/chatStore.ts` | 核心业务逻辑 | AI回复、转人工判断替换为API调用 |
| `src/mock/knowledge.ts` | 知识库数据 | 替换为后端知识库服务 |
| `src/mock/conversations.ts` | 对话Mock数据 | 替换为数据库持久化 |
| `src/types/conversation.ts` | 数据模型定义 | 前后端共享的接口契约 |
| `src/views/user/UserChatPage.vue` | 用户端对话页 | 前端UI迭代 |
| `src/views/staff/StaffChatDetail.vue` | 店员端详情页 | 前端UI迭代 |
| `vite.config.ts` | 构建配置 | 添加API代理（proxy）配置 |

### Git 工作流建议

1. 从 `main` 分支创建特性分支：`git checkout -b feature/xxx`
2. 开发完成后提交 PR，触发 CI 构建验证
3. Code Review 通过后合并到 `main`，自动部署到 GitHub Pages

