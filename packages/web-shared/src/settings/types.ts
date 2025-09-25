export type SettingsThemeId = "system" | "light" | "dark";

export interface SettingsThemeOption {
  id: SettingsThemeId;
  name: string;
  description: string;
  accent: string;
}

export interface SettingsLanguageOption {
  id: string;
  label: string;
  description: string;
}

export type SettingsShortcutId = "enter" | "shift-enter" | "mod-enter";

export interface SettingsShortcutOption {
  id: SettingsShortcutId;
  label: string;
  description: string;
}

export type MessageStyleOption = "bubble" | "compact";

export interface SettingsPreferences {
  themeId: SettingsThemeId;
  languageId: string;
  sendShortcutId: SettingsShortcutId;
  messageStyle: MessageStyleOption;
  fontScale: number;
  showAssistants: boolean;
  showTopics: boolean;
  showTimestamps: boolean;
  enableTopicNaming: boolean;
  enableNotifications: boolean;
  enableRealtimeBridge: boolean;
  enableOfflineCache: boolean;
  enableExtensionHints: boolean;
  enableLaunchpadTips: boolean;
  showBetaFeatures: boolean;
}

export interface SettingsSeed {
  themes: SettingsThemeOption[];
  languages: SettingsLanguageOption[];
  shortcuts: SettingsShortcutOption[];
  preferences: SettingsPreferences;
}
