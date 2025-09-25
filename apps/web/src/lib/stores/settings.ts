import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  SETTINGS_STORAGE_KEY,
  SETTINGS_STORAGE_VERSION,
  buildSettingsState,
  type MessageStyleOption,
  type SettingsLanguageOption,
  type SettingsPreferences,
  type SettingsShortcutId,
  type SettingsShortcutOption,
  type SettingsState,
  type SettingsThemeId,
  type SettingsThemeOption,
} from "@cinaseek/web-shared/settings";

function buildInitialState(): SettingsState {
  return buildSettingsState();
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

interface SettingsStore extends SettingsState {
  setTheme: (id: SettingsThemeId) => void;
  setLanguage: (id: string) => void;
  setShortcut: (id: SettingsShortcutId) => void;
  setMessageStyle: (style: MessageStyleOption) => void;
  setFontScale: (scale: number) => void;
  setPreferences: (preferences: Partial<SettingsPreferences>) => void;
  reset: () => void;
}

type PersistedSettings = {
  preferences?: Partial<SettingsPreferences>;
} | null;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...buildInitialState(),
      setTheme: (id) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            themeId: id,
          },
        }));
      },
      setLanguage: (id) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            languageId: id,
          },
        }));
      },
      setShortcut: (id) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            sendShortcutId: id,
          },
        }));
      },
      setMessageStyle: (style) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            messageStyle: style,
          },
        }));
      },
      setFontScale: (scale) => {
        const normalized = clamp(scale, 0.85, 1.25);
        set((state) => ({
          preferences: {
            ...state.preferences,
            fontScale: Number(normalized.toFixed(2)),
          },
        }));
      },
      setPreferences: (preferences) => {
        if (Object.keys(preferences).length === 0) {
          return;
        }
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...preferences,
          },
        }));
      },
      reset: () => {
        const initial = buildInitialState();
        set(initial);
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
          } catch (error) {
            console.warn("Failed to reset settings store", error);
          }
        }
      },
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: SETTINGS_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        preferences: state.preferences,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as PersistedSettings;
        if (!persisted) {
          return currentState;
        }

        const preferences = persisted.preferences
          ? {
              ...currentState.preferences,
              ...persisted.preferences,
            }
          : currentState.preferences;

        return {
          ...currentState,
          preferences,
        };
      },
    },
  ),
);

export function resetSettingsStore() {
  useSettingsStore.getState().reset();
}

export type {
  SettingsThemeOption,
  SettingsLanguageOption,
  SettingsShortcutOption,
  SettingsPreferences,
  SettingsThemeId,
  SettingsShortcutId,
  SettingsState,
  MessageStyleOption,
};
