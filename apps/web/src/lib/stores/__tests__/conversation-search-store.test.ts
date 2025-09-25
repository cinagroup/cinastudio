import { act } from "@testing-library/react";

import { resetConversationSearchStore, useConversationSearchStore } from "../conversation-search";

describe("conversation search store", () => {
  beforeEach(() => {
    resetConversationSearchStore();
  });

  it("opens with optional initial query and closes correctly", () => {
    expect(useConversationSearchStore.getState().isOpen).toBe(false);

    act(() => {
      useConversationSearchStore.getState().open("纪要");
    });

    const state = useConversationSearchStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.query).toBe("纪要");
    expect(state.matches).toEqual([]);
    expect(state.activeIndex).toBe(-1);

    act(() => {
      useConversationSearchStore.getState().close();
    });

    const closedState = useConversationSearchStore.getState();
    expect(closedState.isOpen).toBe(false);
    expect(closedState.query).toBe("");
    expect(closedState.matches).toEqual([]);
    expect(closedState.activeIndex).toBe(-1);
  });

  it("tracks matches and cycles through them", () => {
    act(() => {
      useConversationSearchStore.getState().open("测试");
      useConversationSearchStore.getState().setMatches(["a", "b", "c"]);
    });

    expect(useConversationSearchStore.getState().activeIndex).toBe(0);

    act(() => {
      useConversationSearchStore.getState().selectNext();
    });
    expect(useConversationSearchStore.getState().activeIndex).toBe(1);

    act(() => {
      useConversationSearchStore.getState().selectNext();
    });
    expect(useConversationSearchStore.getState().activeIndex).toBe(2);

    act(() => {
      useConversationSearchStore.getState().selectNext();
    });
    expect(useConversationSearchStore.getState().activeIndex).toBe(0);

    act(() => {
      useConversationSearchStore.getState().selectPrevious();
    });
    expect(useConversationSearchStore.getState().activeIndex).toBe(2);

    act(() => {
      useConversationSearchStore.getState().setMatches([]);
    });
    expect(useConversationSearchStore.getState().activeIndex).toBe(-1);
  });
});
