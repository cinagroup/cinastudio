# CinaSeek Web

基于 Next.js 14 的全新 Web 端，作为 Cherry Studio 迁移至 PWA/浏览器扩展架构的第一步。

## ✨ 技术栈
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Axios & Socket.io Client
- Jest + Testing Library

## 📦 本地开发
```bash
yarn install
yarn workspace @cinaseek/web dev
```

## ✅ 质量保障
```bash
yarn workspace @cinaseek/web lint
yarn workspace @cinaseek/web typecheck
yarn workspace @cinaseek/web test
```

## 📲 PWA 能力
- `public/manifest.webmanifest` 与 `public/sw.js` 定义了安装与离线缓存策略。
- `useServiceWorkerRegistration` 会在客户端注册 Service Worker 并与状态栏联动。
- `packages/web-shared` 提供跨 PWA/扩展复用的领域模型与消息协议。
- `@cinaseek/web-shared/web-search` + `useWebSearchStore` 支持在浏览器侧配置网页搜索供应商、黑名单与订阅源聚合。
- `@cinaseek/web-shared/mcp` + `useMcpStore` 负责统一管理 MCP 服务器、运行时依赖与同步时间戳，支撑扩展/守护进程协作。
- `@cinaseek/web-shared/data-sync` + `useDataSyncStore` 将 WebDAV/S3/Notion/语雀等连接器迁移到浏览器端，统一管理备份与知识沉淀。
- `QuickPanel (⌘/Ctrl + K)` 结合 `useCommandPaletteStore` 提供跨页面快捷操作、话题跳转与 Prompt 插入，实现桌面端 Quick Panel 的浏览器版体验。
- `⌘/Ctrl + F` 对话搜索面板在消息列表内高亮并定位匹配片段，支持键盘快捷遍历（`MessageSearchPanel` + `MessageBubble`）。

## 🧩 浏览器扩展协同
- 新增 `apps/extension` 工作区，使用 Manifest v3 + Service Worker 背景脚本。
- 扩展将选区内容通过 `cinaseek.bridge` 通道推送到 PWA，会自动生成对话消息。
- `ExtensionBridgeProvider` 负责建立长连接并在 UI 中展示连接状态。

## 🚀 构建
```bash
yarn workspace @cinaseek/web build
```

构建产物可通过仓库根目录提供的 Dockerfile 快速部署。

## 🧭 路由结构
- `/`：营销/介绍页，用于验证基础设施。
- `/workspace`：全新的会话工作区，提供助手切换、话题管理与对话体验预览。
- `/launchpad`：启动台，聚合迁移路线、自动化状态与快捷入口。
- `/knowledge`：知识库中心，浏览迁移中的资料并管理固定资源。
- `/files`：文件工作台，支持类型筛选、排序、置顶与示例文件创建。
- `/agents`：助手工作台，集中管理系统助手与自定义专家角色。
- `/minapps`：迷你应用中心，管理快捷入口与扩展联动。
- `/code`：工程工具集，配置 CLI、模型与终端偏好，复刻桌面端工作流。
- `/notes`：记录迁移过程中的笔记、复盘与手册，支持标签筛选。
- `/translate`：迁移的翻译工作台，提供语言切换、快速短语与历史记录。
- `/memory`：记忆中心，管理长期偏好与模型配置，保持跨端上下文一致。
- `/settings`：设置中心，统一管理主题、快捷键、网页搜索、MCP 服务器与系统能力开关。
