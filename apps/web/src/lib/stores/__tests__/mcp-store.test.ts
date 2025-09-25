import { act } from "@testing-library/react";

import { resetMcpStore, useMcpStore } from "@/lib/stores/mcp";

describe("useMcpStore", () => {
  beforeEach(() => {
    resetMcpStore();
  });

  it("initializes with builtin and custom servers", () => {
    const state = useMcpStore.getState();
    const builtin = state.servers.filter((server) => server.source === "builtin");
    const custom = state.servers.filter((server) => server.source === "custom");

    expect(builtin.length).toBeGreaterThan(0);
    expect(builtin.some((server) => server.name === "@cherry/memory")).toBe(true);
    expect(custom.some((server) => server.name === "team/dify-bridge")).toBe(true);
  });

  it("adds a new custom server", () => {
    act(() => {
      useMcpStore.getState().addServer({
        name: "team/analytics",
        label: "Team Analytics",
        type: "stdio",
        command: "uvx",
        args: ["team-analytics"],
        tags: ["metrics"],
      });
    });

    const custom = useMcpStore.getState().servers.filter((server) => server.source === "custom");
    expect(custom.some((server) => server.name === "team/analytics")).toBe(true);
  });

  it("toggles server activation", () => {
    const memory = useMcpStore.getState().servers.find((server) => server.name === "@cherry/memory");
    expect(memory?.isActive).toBe(true);

    act(() => {
      if (memory) {
        useMcpStore.getState().toggleServer(memory.id, false);
      }
    });

    const updated = useMcpStore.getState().servers.find((server) => server.name === "@cherry/memory");
    expect(updated?.isActive).toBe(false);
  });

  it("removes only custom servers", () => {
    const [custom] = useMcpStore.getState().servers.filter((server) => server.source === "custom");
    expect(custom).toBeDefined();

    act(() => {
      useMcpStore.getState().removeServer(custom.id);
    });

    const afterRemoval = useMcpStore.getState().servers.filter((server) => server.source === "custom");
    expect(afterRemoval.some((server) => server.id === custom.id)).toBe(false);

    const builtin = useMcpStore.getState().servers.find((server) => server.source === "builtin");
    expect(builtin).toBeDefined();
  });

  it("updates filters and runtime availability", () => {
    act(() => {
      useMcpStore.getState().setFilters({ search: "dify", source: "custom", status: "active" });
      useMcpStore.getState().setRuntimeAvailability("uv", false);
    });

    const state = useMcpStore.getState();
    expect(state.filters).toMatchObject({ search: "dify", source: "custom", status: "active" });
    expect(state.uvAvailable).toBe(false);
  });

  it("touches sync timestamp", () => {
    expect(useMcpStore.getState().lastSyncedAt).toBeNull();

    act(() => {
      useMcpStore.getState().touchSync();
    });

    expect(useMcpStore.getState().lastSyncedAt).not.toBeNull();
  });
});
