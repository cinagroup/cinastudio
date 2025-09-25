import { create } from "zustand";

type ConversationSearchState = {
  isOpen: boolean;
  query: string;
  matches: string[];
  activeIndex: number;
  open: (initialQuery?: string) => void;
  close: () => void;
  setQuery: (value: string) => void;
  setMatches: (matches: string[]) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  setActiveIndex: (index: number) => void;
};

const clampIndex = (index: number, length: number) => {
  if (length === 0) {
    return -1;
  }
  if (index < 0) {
    return 0;
  }
  if (index >= length) {
    return length - 1;
  }
  return index;
};

export const useConversationSearchStore = create<ConversationSearchState>((set) => ({
  isOpen: false,
  query: "",
  matches: [],
  activeIndex: -1,
  open: (initialQuery) => {
    const normalized = initialQuery?.trim().slice(0, 160);
    set((state) => ({
      isOpen: true,
      query: normalized ?? state.query,
      matches: [],
      activeIndex: -1,
    }));
  },
  close: () =>
    set({
      isOpen: false,
      query: "",
      matches: [],
      activeIndex: -1,
    }),
  setQuery: (value) =>
    set({
      query: value.slice(0, 160),
      activeIndex: -1,
    }),
  setMatches: (matches) =>
    set((state) => {
      if (matches.length === 0) {
        return { matches, activeIndex: -1 };
      }

      const nextIndex = clampIndex(state.activeIndex, matches.length);
      return {
        matches,
        activeIndex: nextIndex === -1 ? 0 : nextIndex,
      };
    }),
  selectNext: () =>
    set((state) => {
      if (state.matches.length === 0) {
        return state;
      }
      const nextIndex = (state.activeIndex + 1) % state.matches.length;
      return { activeIndex: nextIndex };
    }),
  selectPrevious: () =>
    set((state) => {
      if (state.matches.length === 0) {
        return state;
      }
      const nextIndex =
        (state.activeIndex - 1 + state.matches.length) % state.matches.length;
      return { activeIndex: nextIndex };
    }),
  setActiveIndex: (index) =>
    set((state) => ({
      activeIndex: clampIndex(index, state.matches.length),
    })),
}));

export function resetConversationSearchStore() {
  useConversationSearchStore.setState({
    isOpen: false,
    query: "",
    matches: [],
    activeIndex: -1,
  });
}
