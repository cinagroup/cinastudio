import { afterEach, describe, expect, it } from "@jest/globals";

import { resetKnowledgeStore, useKnowledgeStore } from "../knowledge";

describe("knowledge store", () => {
  afterEach(() => {
    resetKnowledgeStore();
  });

  it("should initialize with the first knowledge base active", () => {
    const state = useKnowledgeStore.getState();
    expect(state.activeBaseId).toBe(state.bases[0]?.id ?? null);
    expect(state.itemsByBase[state.activeBaseId ?? ""]).toBeDefined();
  });

  it("should allow switching active knowledge base", () => {
    const initial = useKnowledgeStore.getState();
    const nextBase = initial.bases[1];
    expect(nextBase).toBeDefined();
    if (!nextBase) return;

    useKnowledgeStore.getState().setActiveBase(nextBase.id);

    expect(useKnowledgeStore.getState().activeBaseId).toBe(nextBase.id);
  });

  it("should toggle pinned state for a knowledge item", () => {
    const state = useKnowledgeStore.getState();
    const activeBaseId = state.activeBaseId as string;
    const items = state.itemsByBase[activeBaseId];
    const target = items.find((item) => !item.pinned);
    expect(target).toBeDefined();
    if (!target) return;

    useKnowledgeStore.getState().togglePin({ baseId: activeBaseId, itemId: target.id });

    const updated = useKnowledgeStore.getState().itemsByBase[activeBaseId].find((item) => item.id === target.id);
    expect(updated?.pinned).toBe(true);
  });

  it("should update search query", () => {
    useKnowledgeStore.getState().setSearchQuery("扩展");
    expect(useKnowledgeStore.getState().searchQuery).toBe("扩展");
  });
});
