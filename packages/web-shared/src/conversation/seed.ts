import type { ConversationSeedEntry, MessageRole } from "./types";

export const conversationSeed: ConversationSeedEntry[] = [
  {
    assistant: {
      id: "assistant-general",
      name: "通用助手",
      description: "处理日常协作、总结与多语言翻译任务。",
      avatar: "✨",
      color: "violet",
    },
    topics: [
      {
        id: "topic-standup",
        assistantId: "assistant-general",
        title: "产品站会纪要",
        createdAt: "2024-10-18T01:05:00.000Z",
        updatedAt: "2024-10-18T01:25:00.000Z",
        messages: [
          {
            id: "message-standup-1",
            topicId: "topic-standup",
            role: "user" as MessageRole,
            content: "帮我整理今日站会纪要，突出风险项与待跟进事项。",
            createdAt: "2024-10-18T01:05:00.000Z",
          },
          {
            id: "message-standup-2",
            topicId: "topic-standup",
            role: "assistant" as MessageRole,
            content:
              "已根据各小组汇报生成纪要草稿，并标注研发与设计的阻塞项。是否需要同步推送至知识库？",
            createdAt: "2024-10-18T01:25:00.000Z",
          },
        ],
      },
      {
        id: "topic-roadmap",
        assistantId: "assistant-general",
        title: "Roadmap 语言版本",
        createdAt: "2024-10-17T12:10:00.000Z",
        updatedAt: "2024-10-17T12:26:00.000Z",
        messages: [
          {
            id: "message-roadmap-1",
            topicId: "topic-roadmap",
            role: "user" as MessageRole,
            content: "把新版本特性整理成中英双语的发布说明。",
            createdAt: "2024-10-17T12:10:00.000Z",
          },
          {
            id: "message-roadmap-2",
            topicId: "topic-roadmap",
            role: "assistant" as MessageRole,
            content:
              "已输出两份版本说明，附带常见问答与升级步骤。需要同步到官网或扩展推送吗？",
            createdAt: "2024-10-17T12:26:00.000Z",
          },
        ],
      },
    ],
  },
  {
    assistant: {
      id: "assistant-engineer",
      name: "代码助手",
      description: "聚焦 TypeScript/Next.js 代码重构与测试。",
      avatar: "💻",
      color: "cyan",
    },
    topics: [
      {
        id: "topic-refactor-store",
        assistantId: "assistant-engineer",
        title: "Zustand 状态切片重构",
        createdAt: "2024-10-16T09:00:00.000Z",
        updatedAt: "2024-10-16T09:35:00.000Z",
        messages: [
          {
            id: "message-refactor-1",
            topicId: "topic-refactor-store",
            role: "user" as MessageRole,
            content: "把 Electron Redux store 中的助手、话题状态抽离到 Zustand。",
            createdAt: "2024-10-16T09:00:00.000Z",
          },
          {
            id: "message-refactor-2",
            topicId: "topic-refactor-store",
            role: "assistant" as MessageRole,
            content:
              "已完成状态切片设计，包含主题创建、消息追加与持久化策略说明，下一步联通 API。",
            createdAt: "2024-10-16T09:35:00.000Z",
          },
        ],
      },
      {
        id: "topic-testing",
        assistantId: "assistant-engineer",
        title: "单元测试补齐",
        createdAt: "2024-10-15T14:15:00.000Z",
        updatedAt: "2024-10-15T14:50:00.000Z",
        messages: [
          {
            id: "message-testing-1",
            topicId: "topic-testing",
            role: "user" as MessageRole,
            content: "给新建的 Zustand store 写测试用例，覆盖切换助手和创建话题。",
            createdAt: "2024-10-15T14:15:00.000Z",
          },
          {
            id: "message-testing-2",
            topicId: "topic-testing",
            role: "assistant" as MessageRole,
            content:
              "测试用例已补齐，并在 CI 中串联。建议加入模拟 Socket 响应的集成测试。",
            createdAt: "2024-10-15T14:50:00.000Z",
          },
        ],
      },
    ],
  },
  {
    assistant: {
      id: "assistant-research",
      name: "调研助手",
      description: "负责竞品追踪与行业趋势分析。",
      avatar: "📚",
      color: "amber",
    },
    topics: [
      {
        id: "topic-competitor",
        assistantId: "assistant-research",
        title: "竞品扩展能力对比",
        createdAt: "2024-10-14T08:20:00.000Z",
        updatedAt: "2024-10-14T08:45:00.000Z",
        messages: [
          {
            id: "message-competitor-1",
            topicId: "topic-competitor",
            role: "user" as MessageRole,
            content: "整理浏览器扩展形态下的主流 AI 产品能力矩阵。",
            createdAt: "2024-10-14T08:20:00.000Z",
          },
          {
            id: "message-competitor-2",
            topicId: "topic-competitor",
            role: "assistant" as MessageRole,
            content:
              "完成对比表格，附带权限需求、费用区间与可扩展 API 列表，可直接导出为 CSV。",
            createdAt: "2024-10-14T08:45:00.000Z",
          },
        ],
      },
    ],
  },
];
