import { act } from "@testing-library/react";

import { settingsSeed } from "@cinaseek/web-shared/settings";

import { resetSettingsStore, useSettingsStore } from "../settings";

describe("settings store", () => {
  beforeEach(() => {
    resetSettingsStore();
  });

  it("initializes with seeded preferences", () => {
    const state = useSettingsStore.getState();
    expect(state.themes).toHaveLength(settingsSeed.themes.length);
    expect(state.languages).toHaveLength(settingsSeed.languages.length);
    expect(state.shortcuts).toHaveLength(settingsSeed.shortcuts.length);
    expect(state.preferences.themeId).toBe(settingsSeed.preferences.themeId);
  });

  it("updates theme and shortcut", () => {
    act(() => {
      useSettingsStore.getState().setTheme("dark");
      useSettingsStore.getState().setShortcut("mod-enter");
    });

    const state = useSettingsStore.getState();
    expect(state.preferences.themeId).toBe("dark");
    expect(state.preferences.sendShortcutId).toBe("mod-enter");
  });

  it("applies partial preference updates", () => {
    act(() => {
      useSettingsStore.getState().setPreferences({
        showAssistants: false,
        enableNotifications: true,
      });
    });

    const state = useSettingsStore.getState();
    expect(state.preferences.showAssistants).toBe(false);
    expect(state.preferences.enableNotifications).toBe(true);
  });

  it("resets to initial state", () => {
    act(() => {
      useSettingsStore.getState().setTheme("light");
      useSettingsStore.getState().setFontScale(1.2);
    });

    expect(useSettingsStore.getState().preferences.themeId).toBe("light");

    act(() => {
      useSettingsStore.getState().reset();
    });

    const resetState = useSettingsStore.getState();
    expect(resetState.preferences.themeId).toBe(settingsSeed.preferences.themeId);
    expect(resetState.preferences.fontScale).toBe(settingsSeed.preferences.fontScale);
  });
});
