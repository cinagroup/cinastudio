import { afterEach, describe, expect, it } from "@jest/globals";

import { resetAgentsStore, useAgentsStore } from "../agents";

describe("agents store", () => {
  afterEach(() => {
    resetAgentsStore();
  });

  it("should load system agents from the shared seed", () => {
    const state = useAgentsStore.getState();
    expect(state.systemAgents.length).toBeGreaterThan(0);
    expect(state.systemAgents.every((agent) => agent.source === "system")).toBe(true);
  });

  it("should add and remove a custom agent", () => {
    const agentId = useAgentsStore
      .getState()
      .addCustomAgent({
        name: "测试助手",
        description: "自定义介绍",
        tags: ["测试"],
        categories: ["工程研发"],
      });

    expect(agentId).toBeDefined();

    const withCustom = useAgentsStore.getState();
    expect(withCustom.customAgents.find((agent) => agent.id === agentId)).toBeDefined();

    useAgentsStore.getState().removeCustomAgent(agentId as string);

    const afterRemoval = useAgentsStore.getState();
    expect(afterRemoval.customAgents.some((agent) => agent.id === agentId)).toBe(false);
  });

  it("should toggle pinned state for an agent", () => {
    const targetId = useAgentsStore.getState().systemAgents[0]?.id;
    expect(targetId).toBeDefined();
    if (!targetId) return;

    useAgentsStore.getState().togglePinned(targetId);
    expect(useAgentsStore.getState().pinnedAgentIds).toContain(targetId);

    useAgentsStore.getState().togglePinned(targetId);
    expect(useAgentsStore.getState().pinnedAgentIds).not.toContain(targetId);
  });

  it("should ignore creating agents without a valid name", () => {
    const result = useAgentsStore.getState().addCustomAgent({ name: "  " });
    expect(result).toBeUndefined();
    expect(useAgentsStore.getState().customAgents.length).toBe(0);
  });
});
