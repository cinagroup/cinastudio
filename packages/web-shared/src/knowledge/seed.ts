import type { KnowledgeSeedEntry } from "./types";

export const knowledgeSeed: KnowledgeSeedEntry[] = [
  {
    base: {
      id: "knowledge-product",
      name: "产品知识库",
      description: "集中存放发布说明、演示稿与客服 FAQ，支撑产品团队与一线同事的协同。",
      icon: "📘",
      accentColor: "#6366F1",
      createdAt: "2024-09-12T09:00:00.000Z",
      updatedAt: "2024-10-18T09:20:00.000Z",
      stats: {
        documents: 24,
        tokens: 185_000,
        automations: 3,
      },
      itemIds: [],
    },
    items: [
      {
        id: "knowledge-product-release-notes",
        title: "Cherry Studio 1.16 发布说明",
        summary:
          "覆盖 Copilot 自动草稿、浏览器扩展消息桥以及 Workspace PWA 引导的关键亮点，附带上手指南。",
        type: "document",
        tags: ["release", "copilot", "workspace"],
        pinned: true,
        source: {
          type: "upload",
          label: "来自产品团队的 Markdown 文档",
          href: "https://docs.cinaseek.com/releases/1.16",
        },
        createdAt: "2024-10-08T02:00:00.000Z",
        updatedAt: "2024-10-17T12:30:00.000Z",
      },
      {
        id: "knowledge-product-demo-script",
        title: "Workspace 演示脚本",
        summary:
          "逐步演示如何在浏览器端完成助手切换、知识库检索与扩展授权的讲解脚本。",
        type: "notebook",
        tags: ["demo", "sales"],
        pinned: false,
        source: {
          type: "note",
          label: "团队内部共享文档",
        },
        createdAt: "2024-09-30T15:00:00.000Z",
        updatedAt: "2024-10-12T07:45:00.000Z",
      },
      {
        id: "knowledge-product-faq",
        title: "客服常见问题 FAQ",
        summary: "整理试用期用户对授权、同步与本地模型配置的常见疑问。",
        type: "dataset",
        tags: ["support", "faq"],
        source: {
          type: "sync",
          label: "Zendesk 自动同步",
        },
        createdAt: "2024-09-12T09:00:00.000Z",
        updatedAt: "2024-10-16T10:12:00.000Z",
      },
      {
        id: "knowledge-product-webinar",
        title: "浏览器扩展发布会回放",
        summary: "针对 Chrome/Edge 扩展适配的路线图说明，附加自动化脚本示例。",
        type: "integration",
        tags: ["webinar", "extension"],
        source: {
          type: "url",
          label: "Youtube",
          href: "https://youtube.com/watch?v=cinaseek-webinar",
        },
        createdAt: "2024-10-02T04:00:00.000Z",
        updatedAt: "2024-10-11T18:00:00.000Z",
      },
    ],
  },
  {
    base: {
      id: "knowledge-engineering",
      name: "工程方案库",
      description: "沉淀工程体系规范、参考架构与可复用脚本，支撑开发团队快速迭代。",
      icon: "🛠️",
      accentColor: "#0EA5E9",
      createdAt: "2024-08-20T08:30:00.000Z",
      updatedAt: "2024-10-15T14:10:00.000Z",
      stats: {
        documents: 31,
        tokens: 264_500,
        automations: 5,
      },
      itemIds: [],
    },
    items: [
      {
        id: "knowledge-engineering-pwa-migration",
        title: "Electron → PWA 迁移蓝图",
        summary:
          "从窗口、IPC、数据持久化三个维度梳理迁移步骤，提供脚手架与检测清单。",
        type: "document",
        tags: ["migration", "pwa", "architecture"],
        pinned: true,
        source: {
          type: "upload",
          label: "Confluence 导出 PDF",
        },
        createdAt: "2024-09-05T06:00:00.000Z",
        updatedAt: "2024-10-14T09:40:00.000Z",
      },
      {
        id: "knowledge-engineering-state-management",
        title: "Zustand Store 设计规范",
        summary:
          "约定切片边界、持久化策略以及与 Socket.io/Service Worker 协作的模式。",
        type: "note",
        tags: ["zustand", "state", "guideline"],
        pinned: false,
        source: {
          type: "note",
          label: "工程团队共享笔记",
        },
        createdAt: "2024-09-18T10:30:00.000Z",
        updatedAt: "2024-10-10T11:25:00.000Z",
      },
      {
        id: "knowledge-engineering-cicd",
        title: "CI/CD 扩展打包流水线",
        summary: "描述如何在 GitHub Actions 中串联 lint、typecheck、extension build 与发布流程。",
        type: "integration",
        tags: ["ci", "extension", "automation"],
        source: {
          type: "sync",
          label: "GitHub Actions 运行记录",
        },
        createdAt: "2024-09-22T12:00:00.000Z",
        updatedAt: "2024-10-09T08:15:00.000Z",
      },
      {
        id: "knowledge-engineering-playbooks",
        title: "浏览器扩展原生桥接 Playbook",
        summary:
          "总结消息协议、错误处理与权限申请策略，帮助扩展团队快速搭建基础设施。",
        type: "dataset",
        tags: ["bridge", "extension"],
        source: {
          type: "upload",
          label: "内部教程文档",
        },
        createdAt: "2024-08-22T09:15:00.000Z",
        updatedAt: "2024-10-05T07:00:00.000Z",
      },
    ],
  },
];
