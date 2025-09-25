import { fireEvent, render, screen } from "@testing-library/react";

import { McpSettings } from "@/components/settings/mcp-settings";
import { resetMcpStore, useMcpStore } from "@/lib/stores/mcp";

describe("McpSettings", () => {
  beforeEach(() => {
    resetMcpStore();
  });

  it("renders builtin servers", () => {
    render(<McpSettings />);

    expect(screen.getByText("Cherry Memory")).toBeInTheDocument();
    expect(screen.getByText("团队知识库桥接")).toBeInTheDocument();
  });

  it("toggles runtime availability and server activation", () => {
    render(<McpSettings />);

    const runtimeToggle = screen.getByLabelText("uvx / Node (uv)");
    fireEvent.click(runtimeToggle);
    expect(useMcpStore.getState().uvAvailable).toBe(false);

    const disableMemory = screen.getByLabelText("停用 Cherry Memory");
    fireEvent.click(disableMemory);
    const memory = useMcpStore.getState().servers.find((server) => server.name === "@cherry/memory");
    expect(memory?.isActive).toBe(false);
  });

  it("adds a custom server through the form", () => {
    render(<McpSettings />);

    fireEvent.change(screen.getByPlaceholderText("team/service"), {
      target: { value: "team/metrics" },
    });
    fireEvent.change(screen.getByPlaceholderText("团队知识库"), {
      target: { value: "Metrics Bridge" },
    });
    fireEvent.click(screen.getByRole("button", { name: "添加服务" }));

    const customNames = useMcpStore.getState().servers
      .filter((server) => server.source === "custom")
      .map((server) => server.name);
    expect(customNames).toContain("team/metrics");
  });
});
