import type { NotesSeed } from "./types";

export const notesSeed: NotesSeed = {
  categories: [
    {
      id: "product",
      name: "产品规划",
      description: "围绕 CinaSeek Web 与扩展的产品规划和路线。",
    },
    {
      id: "workflow",
      name: "工作流",
      description: "跨端协作、自动化与运营工作流记录。",
    },
    {
      id: "migration",
      name: "迁移纪要",
      description: "Electron → Web 重构的每日总结与经验沉淀。",
    },
    {
      id: "knowledge",
      name: "知识沉淀",
      description: "通用的提示词、最佳实践与团队知识。",
    },
    {
      id: "release",
      name: "发布记录",
      description: "版本发布、上线事项与回滚计划。",
    },
  ],
  tags: [
    { id: "pwa", label: "PWA", description: "渐进式 Web 应用相关事项" },
    { id: "extension", label: "Extension", description: "浏览器扩展联调与发布" },
    { id: "knowledge", label: "知识库" },
    { id: "release", label: "发布" },
    { id: "workflow", label: "工作流" },
    { id: "migration", label: "迁移" },
  ],
  notes: [
    {
      id: "note-pwa-alpha",
      title: "PWA Alpha 功能清单",
      summary: "整理首个 Alpha 版本需要完成的核心能力。",
      content:
        "- [x] 会话工作区布局与主题切换\\n- [x] Zustand 持久化与跨标签同步\\n- [ ] 离线缓存知识库与翻译草稿\\n- [ ] 推送桥接与自动登录",
      updatedAt: "2024-10-25T08:00:00.000Z",
      tags: ["pwa", "migration"],
      category: "product",
      pinned: true,
    },
    {
      id: "note-extension-bridge",
      title: "扩展桥接联调要点",
      summary: "Manifest v3 背景脚本与 PWA 的消息协定。",
      content:
        "1. background 建立 chrome.runtime.Port 长连接\\n2. content script 捕获选区后通过 bridge.forward\\n3. PWA 端 ExtensionBridgeProvider 注入状态\\n4. Native Messaging 预留文件访问能力",
      updatedAt: "2024-10-24T03:00:00.000Z",
      tags: ["extension", "workflow"],
      category: "workflow",
    },
    {
      id: "note-knowledge-sync",
      title: "知识库同步策略讨论",
      summary: "如何在 Web 端复刻 Electron IndexedDB 同步。",
      content:
        "- 使用 Next.js Route Handler 作为 BFF 网关\\n- 定时任务推送 Markdown/FAQ 增量\\n- Service Worker 负责缓存与离线回放\\n- 引入加密存储保护敏感对话",
      updatedAt: "2024-10-23T12:00:00.000Z",
      tags: ["knowledge", "workflow"],
      category: "knowledge",
    },
    {
      id: "note-release-beta",
      title: "Beta 发布准备清单",
      summary: "确保 Web 端发布前的回归与监控项。",
      content:
        "- [ ] Lint / Typecheck / Test 全量通过\\n- [ ] Playwright 覆盖关键路径\\n- [ ] 扩展 store 审核提交流程\\n- [ ] PWA manifest 与图标检查",
      updatedAt: "2024-10-22T15:30:00.000Z",
      tags: ["release", "migration"],
      category: "release",
    },
  ],
};
