import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  KNOWLEDGE_STORAGE_KEY,
  KNOWLEDGE_STORAGE_VERSION,
  buildKnowledgeState,
  normalizeKnowledgeSeed,
  knowledgeSeed,
  type KnowledgeBaseRecord,
  type KnowledgeItem,
} from "@cinaseek/web-shared/knowledge";

interface KnowledgeDataState {
  bases: KnowledgeBaseRecord[];
  itemsByBase: Record<string, KnowledgeItem[]>;
  activeBaseId: string | null;
  searchQuery: string;
}

interface TogglePinInput {
  baseId: string;
  itemId: string;
}

export type KnowledgeState = KnowledgeDataState & {
  setActiveBase: (baseId: string) => void;
  setSearchQuery: (query: string) => void;
  togglePin: (input: TogglePinInput) => void;
  reset: () => void;
};

function buildInitialState(): KnowledgeDataState {
  const initial = buildKnowledgeState(knowledgeSeed);
  return {
    bases: initial.bases,
    itemsByBase: initial.itemsByBase,
    activeBaseId: initial.activeBaseId,
    searchQuery: "",
  };
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),
      setActiveBase: (baseId) => {
        const exists = get().bases.some((base) => base.id === baseId);
        if (!exists) {
          return;
        }
        set({ activeBaseId: baseId });
      },
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
      togglePin: ({ baseId, itemId }) => {
        const items = get().itemsByBase[baseId];
        if (!items) {
          return;
        }
        set((state) => ({
          itemsByBase: {
            ...state.itemsByBase,
            [baseId]: items.map((item) =>
              item.id === itemId ? { ...item, pinned: !item.pinned } : item,
            ),
          },
        }));
      },
      reset: () => {
        set(buildInitialState());
      },
    }),
    {
      name: KNOWLEDGE_STORAGE_KEY,
      version: KNOWLEDGE_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        bases: state.bases,
        itemsByBase: state.itemsByBase,
        activeBaseId: state.activeBaseId,
        searchQuery: state.searchQuery,
      }),
      migrate: (persisted, version) => {
        if (!persisted) {
          return persisted as KnowledgeState;
        }
        if (version === KNOWLEDGE_STORAGE_VERSION) {
          return persisted as KnowledgeState;
        }
        const normalized = normalizeKnowledgeSeed(knowledgeSeed);
        return {
          bases: normalized.bases,
          itemsByBase: normalized.itemsByBase,
          activeBaseId: normalized.bases[0]?.id ?? null,
          searchQuery: "",
          setActiveBase: () => undefined,
          setSearchQuery: () => undefined,
          togglePin: () => undefined,
          reset: () => undefined,
        } as KnowledgeState;
      },
    },
  ),
);

export function resetKnowledgeStore() {
  useKnowledgeStore.getState().reset();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(KNOWLEDGE_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear persisted knowledge state", error);
    }
  }
}
