import type { CommandPaletteCommand } from "./types";

export const commandPaletteSeed: CommandPaletteCommand[] = [
  {
    id: "open-launchpad",
    type: "navigation",
    label: "打开 Launchpad",
    description: "浏览迁移进度、快捷入口与自动化状态",
    keywords: ["dashboard", "launchpad", "导航"],
    href: "/launchpad",
    icon: "rocket",
  },
  {
    id: "open-settings",
    type: "navigation",
    label: "打开设置中心",
    description: "切换主题、语言与快捷键配置",
    keywords: ["settings", "preferences", "配置"],
    href: "/settings",
    icon: "settings",
  },
  {
    id: "open-files",
    type: "navigation",
    label: "浏览文件管理",
    description: "查看迁移后的文档与附件",
    keywords: ["files", "attachments"],
    href: "/files",
    icon: "folder",
  },
  {
    id: "prompt-standup",
    type: "prompt",
    label: "插入：站会纪要模板",
    description: "快速生成包含风险与待办的会议纪要",
    keywords: ["prompt", "summary", "standup"],
    content:
      "请按照以下结构整理站会纪要：\n1. 今日亮点\n2. 风险与阻塞\n3. 待跟进事项（负责人 + 截止时间）",
    icon: "sparkles",
  },
  {
    id: "prompt-multilingual",
    type: "prompt",
    label: "插入：多语言版本提示",
    description: "引导助手输出中英双语发布说明",
    keywords: ["prompt", "translation"],
    content:
      "请生成中英文双语版本的发布说明，包含：功能亮点、升级步骤、常见问题及联系方式。",
    icon: "message",
  },
];
