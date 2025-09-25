export const SIDEBAR_ICON_IDS = [
  "assistants",
  "agents",
  "paintings",
  "translate",
  "memory",
  "minapp",
  "knowledge",
  "files",
  "code_tools",
  "notes",
] as const;

export type SidebarIcon = (typeof SIDEBAR_ICON_IDS)[number];

export const DEFAULT_SIDEBAR_ICONS: SidebarIcon[] = [
  "assistants",
  "agents",
  "paintings",
  "translate",
  "memory",
  "minapp",
  "knowledge",
  "files",
  "code_tools",
  "notes",
];

export const REQUIRED_SIDEBAR_ICONS: SidebarIcon[] = ["assistants"];

export interface SidebarEntryDefinition {
  id: SidebarIcon;
  title: string;
  description: string;
  webPath: string;
}

export const SIDEBAR_ENTRY_DEFINITIONS: SidebarEntryDefinition[] = [
  {
    id: "assistants",
    title: "会话空间",
    description: "集中管理助手会话与最新话题。",
    webPath: "/workspace",
  },
  {
    id: "agents",
    title: "助手工作台",
    description: "浏览系统内置助手并管理自定义角色。",
    webPath: "/agents",
  },
  {
    id: "paintings",
    title: "绘图创作",
    description: "调试多模型绘图能力并保存提示词预设。",
    webPath: "/paintings",
  },
  {
    id: "translate",
    title: "翻译工作台",
    description: "在浏览器中完成润色、翻译与术语统一。",
    webPath: "/translate",
  },
  {
    id: "memory",
    title: "记忆中心",
    description: "整理长期偏好与上下文记忆，保持跨端一致。",
    webPath: "/memory",
  },
  {
    id: "minapp",
    title: "迷你应用",
    description: "管理快捷入口与扩展自动化脚本。",
    webPath: "/minapps",
  },
  {
    id: "knowledge",
    title: "知识库",
    description: "浏览与固定团队知识资源。",
    webPath: "/knowledge",
  },
  {
    id: "files",
    title: "文件工作台",
    description: "查看附件同步状态并整理素材。",
    webPath: "/files",
  },
  {
    id: "code_tools",
    title: "工程工具集",
    description: "配置 CLI、模型与终端联动的开发流程。",
    webPath: "/code",
  },
  {
    id: "notes",
    title: "团队笔记",
    description: "记录迁移纪要与知识沉淀。",
    webPath: "/notes",
  },
];
