# CinaSeek PWA & Extension Migration Checklist

本清单记录 Cherry Studio 向「Next.js 14 + PWA + 浏览器扩展」架构迁移的落地步骤，并在完成后打勾。每一项均映射到仓库中的具体实现，便于后续审计与扩展。

## 基础设施
- [x] 建立 `apps/web` Next.js 14 App Router 工作区，提供根布局、全局样式与营销首页骨架（见 `apps/web/src/app/layout.tsx`、`apps/web/src/app/(marketing)/page.tsx`）。
- [x] 配置 Tailwind CSS、PostCSS 与全局 `globals.css`，并将组件目录结构调整为 `components/`, `hooks/`, `lib/`, `types/`, `utils/`（见 `apps/web/tailwind.config.ts`、`apps/web/src/app/globals.css`）。
- [x] 使用 TypeScript 严格模式与路径别名（`tsconfig.json`、`tsconfig.web.json`）统一工程配置。

## 状态与数据层
- [x] 引入 Zustand，并为会话、文件、知识库、设置等域构建持久化 store（`apps/web/src/lib/stores/*`）。
- [x] 封装 Axios 实例与 Socket.io Client 连接器，支撑 REST 与实时事件（`apps/web/src/lib/api-client.ts`、`apps/web/src/lib/socket.ts`、`apps/web/src/hooks/useRealtimeConnection.ts`）。
- [x] 抽象共享领域模型到 `packages/web-shared`，供 PWA 与扩展共同消费。
- [x] 迁移 MCP 服务器领域模型与 Zustand store，支撑运行时状态与自定义服务记录（`packages/web-shared/src/mcp/*`、`apps/web/src/lib/stores/mcp.ts`）。
- [x] 构建数据同步连接器领域模型与状态存储，管理 WebDAV/S3/Notion/语雀等备份方案（`packages/web-shared/src/data-sync/*`、`apps/web/src/lib/stores/data-sync.ts`）。

## PWA 能力
- [x] 准备 Manifest、图标与 Service Worker 缓存策略，并在客户端注册（`apps/web/public/manifest.webmanifest`、`apps/web/public/sw.js`、`apps/web/src/hooks/useServiceWorkerRegistration.ts`）。
- [x] 在 `AppProviders` 中追踪 Service Worker 状态并映射到全局 UI 状态管理。

## 浏览器扩展协同
- [x] 创建 `apps/extension` 工作区，包含 Manifest v3、背景脚本、内容脚本与构建配置（`apps/extension/public/manifest.json` 等）。
- [x] 构建 Extension Bridge 与 `ExtensionBridgeProvider`，实现扩展与 PWA 的消息通道（`apps/web/src/lib/extension/bridge.ts`、`apps/web/src/hooks/useExtensionBridge.tsx`）。

## 业务路由与 UI
- [x] 实现 `/workspace`、`/launchpad`、`/knowledge`、`/files` 等核心业务页面与组件，重现 Electron 功能矩阵（`apps/web/src/components/**`、`apps/web/src/app/(app)/**`）。
- [x] 提供可复用 UI 元素（按钮、状态指示、卡片），并接入 Lucide Icons（`apps/web/src/components/ui/button.tsx` 等）。
- [x] 迁移记忆中心，提供用户分组、模型配置与记忆管理（`apps/web/src/components/memory/**`、`apps/web/src/lib/stores/memory.ts`）。
- [x] 迁移网页搜索配置，涵盖供应商管理、黑名单、结果压缩与订阅源聚合（`apps/web/src/components/settings/web-search-settings.tsx`、`apps/web/src/lib/stores/web-search.ts`、`packages/web-shared/src/web-search/*`）。
- [x] 构建 MCP 服务器设置面板，支持运行时可用性、内置/自定义服务管理与同步提示（`apps/web/src/components/settings/mcp-settings.tsx`）。
- [x] 迁移 Quick Panel/Command Palette，实现 `⌘/Ctrl + K` 快速操作、话题跳转与 Prompt 插入（`apps/web/src/components/conversation/quick-panel.tsx`、`apps/web/src/lib/stores/command-palette.ts`）。
- [x] 迁移对话内搜索能力，支持 `⌘/Ctrl + F` 在消息中高亮并定位匹配项（`apps/web/src/components/conversation/message-search-panel.tsx`、`apps/web/src/components/conversation/message-bubble.tsx`）。

## 质量与交付
- [x] 配置 Jest + Testing Library 测试环境并迁移关键用例（`apps/web/jest.config.js`、`apps/web/src/components/**/__tests__`）。
- [x] 准备 Docker 多阶段构建以交付生产镜像（`apps/web/Dockerfile`）。
- [x] 在 README 中记录技术栈、命令、PWA/扩展协作方式（`apps/web/README.md`）。

> 若需新增模块，请在此清单追加条目并完成实现后再勾选。
