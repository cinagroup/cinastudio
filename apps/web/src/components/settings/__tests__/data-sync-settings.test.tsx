import { fireEvent, render, screen } from "@testing-library/react";

import { DataSyncSettings } from "@/components/settings/data-sync-settings";
import { resetDataSyncStore, useDataSyncStore } from "@/lib/stores/data-sync";

describe("DataSyncSettings", () => {
  beforeEach(() => {
    resetDataSyncStore();
  });

  it("switches between providers", () => {
    render(<DataSyncSettings />);

    fireEvent.click(screen.getByRole("button", { name: /S3 对象存储/ }));

    expect(screen.getByRole("heading", { name: "S3 对象存储" })).toBeInTheDocument();
  });

  it("toggles provider availability", () => {
    render(<DataSyncSettings />);

    const toggle = screen.getByLabelText("启用 WebDAV 同步");
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);

    expect(useDataSyncStore.getState().connectors.webdav.enabled).toBe(true);
  });

  it("updates field values and triggers sync", () => {
    render(<DataSyncSettings />);

    const input = screen.getByPlaceholderText("https://dav.example.com/remote.php/webdav");
    fireEvent.change(input, { target: { value: "https://files.example.com/webdav" } });

    expect(useDataSyncStore.getState().connectors.webdav.config.endpoint).toBe(
      "https://files.example.com/webdav",
    );

    fireEvent.click(screen.getByRole("button", { name: "立即同步" }));

    expect(useDataSyncStore.getState().connectors.webdav.status).toBe("connected");
  });
});
