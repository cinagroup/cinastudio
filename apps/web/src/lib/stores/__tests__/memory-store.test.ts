import { act } from "@testing-library/react";

import { useMemoryStore, resetMemoryStore } from "@/lib/stores/memory";

describe("useMemoryStore", () => {
  beforeEach(() => {
    resetMemoryStore();
  });

  it("initializes with seed data", () => {
    const state = useMemoryStore.getState();
    expect(state.users.length).toBeGreaterThan(0);
    expect(state.memories.length).toBeGreaterThan(0);
    expect(state.config.llmClient?.id).toBe("openai-gpt-4o-mini");
  });

  it("allows toggling global memory flag", () => {
    act(() => {
      useMemoryStore.getState().setGlobalEnabled(false);
    });
    expect(useMemoryStore.getState().globalEnabled).toBe(false);
  });

  it("creates and removes memories", () => {
    let createdId = "";
    act(() => {
      createdId = useMemoryStore.getState().addMemory({ memory: "Follow-up summary" }).id;
    });

    expect(useMemoryStore.getState().memories.some((item) => item.id === createdId)).toBe(true);

    act(() => {
      useMemoryStore.getState().deleteMemory(createdId);
    });

    expect(useMemoryStore.getState().memories.some((item) => item.id === createdId)).toBe(false);
  });

  it("updates configuration clients", () => {
    act(() => {
      useMemoryStore.getState().setLlmClient("moonshot-kimi-large");
      useMemoryStore.getState().setEmbedderClient("voyage-3-large");
      useMemoryStore.getState().setEmbedderDimensions(1024.4);
      useMemoryStore.getState().setSyncCadence("daily");
      useMemoryStore.getState().toggleAutomaticFactExtraction();
    });

    const state = useMemoryStore.getState();
    expect(state.config.llmClient?.id).toBe("moonshot-kimi-large");
    expect(state.config.embedderClient?.id).toBe("voyage-3-large");
    expect(state.config.embedderDimensions).toBe(1024);
    expect(state.config.syncCadence).toBe("daily");
    expect(state.config.automaticFactExtraction).toBe(false);
  });

  it("manages users and current selection", () => {
    act(() => {
      useMemoryStore.getState().addUser({ id: "research", label: "Research" });
    });

    const stateAfterAdd = useMemoryStore.getState();
    expect(stateAfterAdd.users.some((user) => user.id === "research")).toBe(true);
    expect(stateAfterAdd.currentUserId).toBe("research");

    act(() => {
      useMemoryStore.getState().deleteUser("research");
    });

    const stateAfterDelete = useMemoryStore.getState();
    expect(stateAfterDelete.users.some((user) => user.id === "research")).toBe(false);
    expect(stateAfterDelete.currentUserId).not.toBe("research");
  });
});
