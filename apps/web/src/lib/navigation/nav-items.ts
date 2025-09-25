import {
  SIDEBAR_ENTRY_DEFINITIONS,
  type SidebarIcon,
} from "@cinaseek/web-shared/navigation";
import {
  Bot,
  FolderKanban,
  History,
  Languages,
  LayoutGrid,
  Library,
  Brain,
  NotebookPen,
  Palette,
  PanelsTopLeft,
  Rocket,
  Settings as SettingsIcon,
  TerminalSquare,
  type LucideIcon,
} from "lucide-react";

export type NavigationItemId = SidebarIcon | "launchpad" | "history" | "settings";

export interface NavigationItem {
  id: NavigationItemId;
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const SIDEBAR_ICON_COMPONENTS: Record<SidebarIcon, LucideIcon> = {
  assistants: PanelsTopLeft,
  agents: Bot,
  paintings: Palette,
  translate: Languages,
  memory: Brain,
  minapp: LayoutGrid,
  knowledge: Library,
  files: FolderKanban,
  code_tools: TerminalSquare,
  notes: NotebookPen,
};

const sharedNavigation: NavigationItem[] = SIDEBAR_ENTRY_DEFINITIONS.map((entry) => ({
  id: entry.id,
  href: entry.webPath,
  label: entry.title,
  description: entry.description,
  icon: SIDEBAR_ICON_COMPONENTS[entry.id],
}));

const leadingNavigation: NavigationItem[] = [
  {
    id: "launchpad",
    href: "/launchpad",
    label: "启动台",
    description: "总览迁移路线与自动化进度。",
    icon: Rocket,
  },
  {
    id: "history",
    href: "/history",
    label: "历史记录",
    description: "按时间轴检索与回顾对话内容。",
    icon: History,
  },
];

const trailingNavigation: NavigationItem[] = [
  {
    id: "settings",
    href: "/settings",
    label: "设置中心",
    description: "配置主题、快捷键、数据同步、网页搜索与 MCP 服务器。",
    icon: SettingsIcon,
  },
];

export const NAV_ITEMS: NavigationItem[] = [
  ...leadingNavigation,
  ...sharedNavigation,
  ...trailingNavigation,
];

export const HERO_QUICK_LINK_IDS: NavigationItemId[] = [
  "launchpad",
  "agents",
  "history",
  "files",
  "minapp",
  "memory",
  "code_tools",
  "notes",
  "translate",
  "settings",
];
