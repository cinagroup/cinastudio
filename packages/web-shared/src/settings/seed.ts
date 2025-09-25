import type { SettingsSeed } from "./types";

export const settingsSeed: SettingsSeed = {
  themes: [
    {
      id: "system",
      name: "跟随系统",
      description: "根据系统外观自动切换明暗模式。",
      accent: "from-slate-500 to-slate-900",
    },
    {
      id: "light",
      name: "浅色模式",
      description: "在明亮环境中保持清爽的阅读体验。",
      accent: "from-amber-200 to-amber-400",
    },
    {
      id: "dark",
      name: "深色模式",
      description: "以深色界面专注于对话与知识卡片。",
      accent: "from-indigo-500 to-purple-600",
    },
  ],
  languages: [
    {
      id: "zh-CN",
      label: "简体中文",
      description: "界面与提示以简体中文呈现，适用于大多数团队成员。",
    },
    {
      id: "en-US",
      label: "English (US)",
      description: "Use the workspace in English for global collaborators.",
    },
    {
      id: "ja-JP",
      label: "日本語",
      description: "日本語 UI と通知で、日本チームの移行を支援します。",
    },
  ],
  shortcuts: [
    {
      id: "enter",
      label: "Enter",
      description: "按 Enter 发送消息，Shift+Enter 换行。",
    },
    {
      id: "shift-enter",
      label: "Shift + Enter",
      description: "按 Shift+Enter 发送消息，Enter 换行。",
    },
    {
      id: "mod-enter",
      label: "⌘ / Ctrl + Enter",
      description: "按 Command/Ctrl + Enter 发送消息，Enter 换行。",
    },
  ],
  preferences: {
    themeId: "system",
    languageId: "zh-CN",
    sendShortcutId: "enter",
    messageStyle: "bubble",
    fontScale: 1,
    showAssistants: true,
    showTopics: true,
    showTimestamps: true,
    enableTopicNaming: true,
    enableNotifications: false,
    enableRealtimeBridge: true,
    enableOfflineCache: true,
    enableExtensionHints: true,
    enableLaunchpadTips: true,
    showBetaFeatures: true,
  },
};
