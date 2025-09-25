import { settingsSeed } from "./seed";
import type {
  SettingsLanguageOption,
  SettingsPreferences,
  SettingsSeed,
  SettingsShortcutOption,
  SettingsThemeOption,
} from "./types";

export const SETTINGS_STORAGE_KEY = "cinaseek.settings";
export const SETTINGS_STORAGE_VERSION = 1;

export interface SettingsState {
  themes: SettingsThemeOption[];
  languages: SettingsLanguageOption[];
  shortcuts: SettingsShortcutOption[];
  preferences: SettingsPreferences;
}

export function buildSettingsState(seed: SettingsSeed = settingsSeed): SettingsState {
  return {
    themes: seed.themes.map((theme) => ({ ...theme })),
    languages: seed.languages.map((language) => ({ ...language })),
    shortcuts: seed.shortcuts.map((shortcut) => ({ ...shortcut })),
    preferences: { ...seed.preferences },
  };
}
