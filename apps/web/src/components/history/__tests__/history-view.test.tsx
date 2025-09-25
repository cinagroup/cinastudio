import { fireEvent, render, screen } from "@testing-library/react";

import { HistoryView } from "../history-view";
import { resetConversationStore } from "@/lib/stores/conversation";

describe("HistoryView", () => {
  beforeEach(() => {
    resetConversationStore();
  });

  it("searches messages and renders results", () => {
    render(<HistoryView />);

    const input = screen.getByPlaceholderText("搜索话题或消息");
    fireEvent.change(input, { target: { value: "站会" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getAllByText("产品站会纪要").length).toBeGreaterThan(0);
    expect(screen.getByText(/帮我整理今日/)).toBeInTheDocument();
    expect(screen.getByText(/找到 1 条记录/)).toBeInTheDocument();
  });
});
