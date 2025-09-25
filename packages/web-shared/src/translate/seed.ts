import type { TranslateSeed } from "./types";

export const translateSeed: TranslateSeed = {
  languages: [
    {
      id: "zh-CN",
      label: "简体中文",
      locale: "zh-CN",
      emoji: "🇨🇳",
      description: "默认界面语言与主要文档语言",
    },
    {
      id: "en-US",
      label: "English",
      locale: "en-US",
      emoji: "🇺🇸",
      description: "国际化沟通与文档发布",
    },
    {
      id: "ja-JP",
      label: "日本語",
      locale: "ja-JP",
      emoji: "🇯🇵",
      description: "扩展在日本市场的支持",
    },
    {
      id: "fr-FR",
      label: "Français",
      locale: "fr-FR",
      emoji: "🇫🇷",
    },
    {
      id: "de-DE",
      label: "Deutsch",
      locale: "de-DE",
      emoji: "🇩🇪",
    },
  ],
  quickPhrases: [
    {
      id: "phrase-summary",
      label: "总结归纳",
      content: "请用目标语言总结下列内容，并输出三个要点。",
    },
    {
      id: "phrase-tone",
      label: "语气润色",
      content: "保持原意，将译文调整为正式且友好的语气。",
    },
    {
      id: "phrase-proofread",
      label: "拼写检查",
      content: "校对文本中的语法和拼写问题，并给出修改建议。",
    },
  ],
  history: [
    {
      id: "history-welcome",
      sourceText: "欢迎来到新的 Web 工作台",
      translatedText: "Welcome to the new web workspace",
      sourceLanguageId: "zh-CN",
      targetLanguageId: "en-US",
      createdAt: "2024-10-20T10:00:00.000Z",
    },
    {
      id: "history-extension",
      sourceText: "扩展背景脚本已经连接到 PWA",
      translatedText: "The extension background worker is now connected to the PWA",
      sourceLanguageId: "zh-CN",
      targetLanguageId: "en-US",
      createdAt: "2024-10-21T08:30:00.000Z",
    },
  ],
  preferences: {
    autoDetect: true,
    autoCopy: false,
    historyLimit: 20,
  },
};
