import { fireEvent, render, screen } from "@testing-library/react";

import { ChatPanel } from "../chat-panel";
import { resetConversationSearchStore } from "@/lib/stores/conversation-search";
import { resetConversationStore } from "@/lib/stores/conversation";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("ChatPanel message search", () => {
  beforeEach(() => {
    resetConversationStore();
    resetConversationSearchStore();
    pushMock.mockReset();
  });

  it("opens with Ctrl/⌘+F, highlights matches and closes with escape", async () => {
    render(<ChatPanel />);

    fireEvent.keyDown(window, { key: "f", ctrlKey: true });

    const input = await screen.findByPlaceholderText("搜索对话");

    fireEvent.change(input, { target: { value: "纪要" } });

    await screen.findByText(/\d+ \/ \d+/);

    const highlights = document.querySelectorAll("mark");
    expect(highlights.length).toBeGreaterThan(0);
    expect(highlights[0]).toHaveTextContent("纪要");

    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByPlaceholderText("搜索对话")).not.toBeInTheDocument();
  });
});
