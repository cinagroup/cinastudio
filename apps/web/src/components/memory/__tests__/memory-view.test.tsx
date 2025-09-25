import { fireEvent, render, screen } from "@testing-library/react";

import { MemoryView } from "../memory-view";
import { resetMemoryStore, useMemoryStore } from "@/lib/stores/memory";

describe("MemoryView", () => {
  beforeEach(() => {
    resetMemoryStore();
  });

  it("renders seed data and metrics", () => {
    render(<MemoryView />);
    expect(screen.getByRole("heading", { name: "知识记忆中心" })).toBeInTheDocument();
    expect(screen.getAllByText(/记忆条目/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/关联用户/).length).toBeGreaterThan(0);
  });

  it("adds a new memory entry", () => {
    render(<MemoryView />);
    const textarea = screen.getByPlaceholderText("输入需要记录的偏好、约定或总结...");
    fireEvent.change(textarea, { target: { value: "和桌面端保持统一语言" } });
    fireEvent.click(screen.getByText("保存记忆"));
    expect(screen.getByText("和桌面端保持统一语言")).toBeInTheDocument();
  });

  it("filters memories by search", () => {
    render(<MemoryView />);
    fireEvent.click(screen.getByRole("button", { name: /市场团队/ }));
    const search = screen.getByPlaceholderText("搜索记忆内容");
    fireEvent.change(search, { target: { value: "品牌主色调" } });
    expect(screen.getByText(/品牌主色调为#F472B6/)).toBeInTheDocument();
  });

  it("updates configuration via selects", () => {
    render(<MemoryView />);
    fireEvent.change(screen.getByLabelText("摘要模型"), { target: { value: "moonshot-kimi-large" } });
    fireEvent.change(screen.getByLabelText("嵌入模型"), { target: { value: "voyage-3-large" } });
    fireEvent.change(screen.getByLabelText("嵌入维度"), { target: { value: "2048" } });

    const state = useMemoryStore.getState();
    expect(state.config.llmClient?.id).toBe("moonshot-kimi-large");
    expect(state.config.embedderClient?.id).toBe("voyage-3-large");
    expect(state.config.embedderDimensions).toBe(2048);
  });

  it("can disable global memory", () => {
    render(<MemoryView />);
    fireEvent.click(screen.getByText("全局记忆已启用"));
    expect(useMemoryStore.getState().globalEnabled).toBe(false);
  });
});
