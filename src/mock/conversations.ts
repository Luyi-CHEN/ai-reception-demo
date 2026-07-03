import type { Conversation } from '../types/conversation'

/** 转人工统一话术 */
const TRANSFER_MESSAGE =
  '系统正在为您加急转接人工中，请稍后，门店高峰期店员可能无法及时回答，您也可以直接电话联系哈，谢谢。'

/** 门店名称 */
const STORE_NAME = '联想体验店'

/**
 * Mock对话数据 - 5条完整对话
 * 覆盖场景：产品咨询、使用安装、匹配不到转人工、售后直接转人工、意图跃迁
 */
export const mockConversations: Conversation[] = [
  // ==================== 对话1：产品咨询 → AI正常回复 ====================
  {
    id: 'conv001',
    userId: 'u1001',
    userName: '张伟',
    userAvatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    storeName: STORE_NAME,
    status: 'ai_serving',
    messages: [
      {
        id: 'conv001-msg1',
        sender: 'user',
        content: '你好，这款联想小新Pro16能玩游戏吗？',
        timestamp: 1751277600000,
        intentTag: '产品咨询',
      },
      {
        id: 'conv001-msg2',
        sender: 'ai',
        content:
          '您好！联想小新Pro16 2024款搭载AMD锐龙7 7840H处理器，可选配RTX 4050独立显卡，16GB DDR5内存。可以流畅运行英雄联盟、CS2、原神等主流网游；对于大型3A游戏如赛博朋克2077，在中低画质下也能获得不错的帧率。如果您对游戏性能要求较高，推荐选择带RTX 4050独显的版本。',
        timestamp: 1751277655000,
        intentTag: '产品咨询',
        knowledgeSources: [
          { title: '联想小新Pro16配置参数', similarity: 0.91 },
        ],
      },
      {
        id: 'conv001-msg3',
        sender: 'user',
        content: '那它的屏幕素质怎么样？分辨率高吗？',
        timestamp: 1751277780000,
        intentTag: '产品咨询',
      },
      {
        id: 'conv001-msg4',
        sender: 'ai',
        content:
          '联想小新Pro16配备16英寸2.5K分辨率IPS屏幕，120Hz高刷新率，100% sRGB色域，350nit亮度。屏幕素质在同价位中非常出色，无论是游戏画面的流畅度还是色彩还原度都能满足日常和创作需求。同时还支持DC调光，长时间使用也不容易疲劳。',
        timestamp: 1751277840000,
        intentTag: '产品咨询',
        knowledgeSources: [
          { title: '联想小新Pro16配置参数', similarity: 0.88 },
        ],
      },
    ],
    intentTags: [{ name: '产品咨询', order: 1, confidence: 0.92 }],
    unreadCount: 0,
    lastMessage:
      '联想小新Pro16配备16英寸2.5K分辨率IPS屏幕，120Hz高刷新率，100% sRGB色域，350nit亮度。屏幕素质在同价位中非常出色，无论是游戏画面的流畅度还是色彩还原度都能满足日常和创作需求。同时还支持DC调光，长时间使用也不容易疲劳。',
    lastMessageTime: 1751277840000,
  },

  // ==================== 对话2：使用与安装 → AI回复+知识库命中 ====================
  {
    id: 'conv002',
    userId: 'u1002',
    userName: '李娜',
    userAvatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/leaf.jpeg',
    storeName: STORE_NAME,
    status: 'ai_serving',
    messages: [
      {
        id: 'conv002-msg1',
        sender: 'user',
        content: '刚买的联想小新Air14，怎么连蓝牙耳机啊？',
        timestamp: 1751378400000,
        intentTag: '使用与安装',
      },
      {
        id: 'conv002-msg2',
        sender: 'ai',
        content:
          '您好！连接蓝牙耳机很简单，请按以下步骤操作：\n1. 点击屏幕右下角通知栏，确保蓝牙开关已打开；\n2. 将蓝牙耳机设为配对模式（通常长按耳机电源键3-5秒，指示灯快闪表示进入配对模式）；\n3. 进入「设置 → 蓝牙和其他设备」，点击「添加设备」；\n4. 在列表中选择您的蓝牙耳机，点击连接；\n5. 如需输入PIN码，通常为0000或1234；\n6. 连接成功后状态显示「已连接」即可使用。',
        timestamp: 1751378448000,
        intentTag: '使用与安装',
        knowledgeSources: [
          { title: '蓝牙连接教程', similarity: 0.94 },
          { title: '无线网络连接设置', similarity: 0.71 },
        ],
      },
      {
        id: 'conv002-msg3',
        sender: 'user',
        content: '好的，我试试看，谢谢！',
        timestamp: 1751378520000,
        intentTag: '使用与安装',
      },
    ],
    intentTags: [{ name: '使用与安装', order: 1, confidence: 0.95 }],
    unreadCount: 0,
    lastMessage: '好的，我试试看，谢谢！',
    lastMessageTime: 1751378520000,
  },

  // ==================== 对话3：产品咨询 → 匹配不到 → 转人工 ====================
  {
    id: 'conv003',
    userId: 'u1003',
    userName: '王芳',
    userAvatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/sand.jpeg',
    storeName: STORE_NAME,
    status: 'pending_staff',
    messages: [
      {
        id: 'conv003-msg1',
        sender: 'user',
        content: '这款电脑支持雷电4接口吗？能外接显卡坞吗？具体兼容哪些型号的显卡坞？',
        timestamp: 1751466600000,
        intentTag: '产品咨询',
      },
      {
        id: 'conv003-msg2',
        sender: 'ai',
        content:
          '抱歉，您的问题涉及雷电4接口和外接显卡坞的详细兼容性信息，这暂时超出了我的知识范围，我无法为您提供准确的解答。已为您转接人工客服，由专业店员为您详细解答，请稍候。',
        timestamp: 1751466645000,
        intentTag: '产品咨询',
        transferReason: 'AI无法匹配知识库，问题超出知识范围',
      },
      {
        id: 'conv003-msg3',
        sender: 'system',
        content: TRANSFER_MESSAGE,
        timestamp: 1751466675000,
        transferReason: 'AI无法匹配知识库，问题超出知识范围',
      },
    ],
    intentTags: [{ name: '产品咨询', order: 1, confidence: 0.42 }],
    transferReason: 'AI无法匹配知识库，问题超出知识范围',
    unreadCount: 1,
    lastMessage: TRANSFER_MESSAGE,
    lastMessageTime: 1751466675000,
  },

  // ==================== 对话4：售后与保修 → 直接转人工 ====================
  {
    id: 'conv004',
    userId: 'u1004',
    userName: '刘洋',
    userAvatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg',
    storeName: STORE_NAME,
    status: 'staff_serving',
    messages: [
      {
        id: 'conv004-msg1',
        sender: 'user',
        content: '我要退货，买的电脑有质量问题。',
        timestamp: 1751548800000,
        intentTag: '售后与保修',
      },
      {
        id: 'conv004-msg2',
        sender: 'ai',
        content:
          '您好，非常抱歉您遇到了质量问题。退货属于售后保修服务，需要人工客服为您核实处理，正在为您转接门店客服。',
        timestamp: 1751548820000,
        intentTag: '售后与保修',
        transferReason: '售后意图直接转人工',
      },
      {
        id: 'conv004-msg3',
        sender: 'system',
        content: TRANSFER_MESSAGE,
        timestamp: 1751548850000,
        transferReason: '售后意图直接转人工',
      },
      {
        id: 'conv004-msg4',
        sender: 'staff',
        content:
          '您好，我是联想体验店客服小王。非常抱歉给您带来不便，关于退货事宜请您放心，我们提供7天无理由退换和15天内质量问题免费换机服务。请问您能提供一下订单号和具体的质量问题描述吗？我马上为您处理。',
        timestamp: 1751548950000,
      },
    ],
    intentTags: [{ name: '售后与保修', order: 1, confidence: 0.98 }],
    transferReason: '售后意图直接转人工',
    unreadCount: 0,
    lastMessage:
      '您好，我是联想体验店客服小王。非常抱歉给您带来不便，关于退货事宜请您放心，我们提供7天无理由退换和15天内质量问题免费换机服务。请问您能提供一下订单号和具体的质量问题描述吗？我马上为您处理。',
    lastMessageTime: 1751548950000,
  },

  // ==================== 对话5：意图跃迁场景 ====================
  {
    id: 'conv005',
    userId: 'u1005',
    userName: '陈静',
    userAvatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple.jpeg',
    storeName: STORE_NAME,
    status: 'closed',
    messages: [
      {
        id: 'conv005-msg1',
        sender: 'user',
        content: '联想拯救者Y7000P的显卡是什么型号？性能怎么样？',
        timestamp: 1751559600000,
        intentTag: '产品咨询',
      },
      {
        id: 'conv005-msg2',
        sender: 'ai',
        content:
          '您好！联想拯救者Y7000P 2024款搭载NVIDIA RTX 4060独立显卡，140W满功耗释放，支持独显直连技术。RTX 4060性能强劲，可以流畅运行市面上绝大多数3A大作，如《黑神话：悟空》《赛博朋克2077》等，在2.5K分辨率下高画质也能保持60帧以上。',
        timestamp: 1751559660000,
        intentTag: '产品咨询',
        knowledgeSources: [
          { title: '联想拯救者Y7000P配置参数', similarity: 0.93 },
        ],
      },
      {
        id: 'conv005-msg3',
        sender: 'user',
        content: '那平时用的话需要一直插电吗？电池能撑多久？怎么保养电池？',
        timestamp: 1751559750000,
        intentTag: '使用与安装',
      },
      {
        id: 'conv005-msg4',
        sender: 'ai',
        content:
          '联想拯救者Y7000P配备80Wh大容量电池，日常办公浏览网页续航约4-5小时，观看视频约3-4小时。建议游戏时连接电源适配器以获得最佳性能。电池保养方面：1. 尽量保持在20%-80%电量区间使用；2. 长期插电时建议在联想电脑管家内开启电池保养模式；3. 避免高温环境下使用；4. 每月进行一次完整充放电循环。',
        timestamp: 1751559810000,
        intentTag: '使用与安装',
        knowledgeSources: [
          { title: '电池保养指南', similarity: 0.90 },
          { title: '联想拯救者Y7000P配置参数', similarity: 0.72 },
        ],
      },
      {
        id: 'conv005-msg5',
        sender: 'user',
        content: '明白了。对了，我上个月在这买的拯救者屏幕有个坏点，能换吗？',
        timestamp: 1751559900000,
        intentTag: '售后与保修',
      },
      {
        id: 'conv005-msg6',
        sender: 'ai',
        content:
          '了解到您遇到了屏幕坏点的问题，非常抱歉给您带来困扰。屏幕坏点属于质量售后问题，需要人工客服为您核实购买时间和质保情况后处理，正在为您转接门店客服。',
        timestamp: 1751559930000,
        intentTag: '售后与保修',
        transferReason: '意图跃迁至售后与保修，触发转人工',
      },
      {
        id: 'conv005-msg7',
        sender: 'system',
        content: TRANSFER_MESSAGE,
        timestamp: 1751559960000,
        transferReason: '意图跃迁至售后与保修，触发转人工',
      },
      {
        id: 'conv005-msg8',
        sender: 'staff',
        content:
          '您好，我是联想体验店店长李姐。关于屏幕坏点问题，根据联想质保政策，屏幕出现坏点属于质量问题，我们提供15天内质量问题换机服务。您提到上个月购买，可能已超过15天换机期，但仍在整机2年质保期内，我们可以为您安排免费更换屏幕。请携带电脑和购买凭证到门店，我们安排工程师检测后为您处理换屏，预计1-2个工作日完成。',
        timestamp: 1751560140000,
      },
    ],
    intentTags: [
      { name: '产品咨询', order: 1, confidence: 0.90 },
      { name: '使用与安装', order: 2, confidence: 0.88 },
      { name: '售后与保修', order: 3, confidence: 0.95 },
    ],
    transferReason: '意图跃迁至售后与保修，触发转人工',
    unreadCount: 0,
    lastMessage:
      '您好，我是联想体验店店长李姐。关于屏幕坏点问题，根据联想质保政策，屏幕出现坏点属于质量问题，我们提供15天内质量问题换机服务。您提到上个月购买，可能已超过15天换机期，但仍在整机2年质保期内，我们可以为您安排免费更换屏幕。请携带电脑和购买凭证到门店，我们安排工程师检测后为您处理换屏，预计1-2个工作日完成。',
    lastMessageTime: 1751560140000,
  },
]
