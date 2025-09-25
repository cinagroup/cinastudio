import { fireEvent, render, screen } from "@testing-library/react";

import { QuickPanel } from "../quick-panel";
import { resetCommandPaletteStore, useCommandPaletteStore } from "@/lib/stores/command-palette";
import { resetConversationStore, useConversationStore } from "@/lib/stores/conversation";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("QuickPanel", () => {
  beforeEach(() => {
    pushMock.mockReset();
    resetCommandPaletteStore();
    resetConversationStore();
  });

  it("inserts prompt content into the composer and closes", () => {
    render(<QuickPanel />);

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    const promptButton = screen.getByText("插入：站会纪要模板").closest("button");
    expect(promptButton).toBeTruthy();

    fireEvent.click(promptButton!);

    expect(useConversationStore.getState().composerDraft).toContain("站会纪要");
    expect(useCommandPaletteStore.getState().isOpen).toBe(false);
  });

  it("navigates to target route when selecting navigation command", () => {
    render(<QuickPanel />);

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    const navButton = screen.getByText("打开 Launchpad").closest("button");
    expect(navButton).toBeTruthy();

    fireEvent.click(navButton!);

    expect(pushMock).toHaveBeenCalledWith("/launchpad");
    expect(useCommandPaletteStore.getState().isOpen).toBe(false);
  });
});
