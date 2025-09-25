import { fireEvent, render, screen } from "@testing-library/react";

import { SettingsView } from "../settings-view";
import { resetSettingsStore, useSettingsStore } from "@/lib/stores/settings";

describe("SettingsView", () => {
  beforeEach(() => {
    resetSettingsStore();
  });

  it("updates theme selection", () => {
    render(<SettingsView />);

    const darkRadio = screen.getByLabelText("深色模式");
    fireEvent.click(darkRadio);

    expect(useSettingsStore.getState().preferences.themeId).toBe("dark");
  });

  it("toggles assistant visibility and resets", () => {
    render(<SettingsView />);

    const toggle = screen.getByLabelText("显示助手面板");
    expect(toggle).toBeChecked();

    fireEvent.click(toggle);
    expect(useSettingsStore.getState().preferences.showAssistants).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "恢复默认设置" }));
    expect(useSettingsStore.getState().preferences.showAssistants).toBe(true);
  });

  it("changes interface language", () => {
    render(<SettingsView />);

    const select = screen.getByLabelText("界面语言");
    fireEvent.change(select, { target: { value: "en-US" } });

    expect(useSettingsStore.getState().preferences.languageId).toBe("en-US");
  });
});
