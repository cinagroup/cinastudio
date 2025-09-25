import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  MEMORY_STORAGE_KEY,
  MEMORY_STORAGE_VERSION,
  buildMemoryState,
  type MemoryFilters,
  type MemoryItem,
  type MemoryState,
  type MemoryUserDefinition,
} from "@cinaseek/web-shared/memory";

import { createId } from "@/utils/id";

interface CreateMemoryInput {
  memory: string;
  userId?: string;
  metadata?: Record<string, string>;
}

interface UpdateMemoryInput {
  memory?: string;
  metadata?: Record<string, string>;
}

interface CreateUserInput {
  id: string;
  label: string;
  description?: string;
}

type MemoryStore = MemoryState & {
  setGlobalEnabled: (enabled: boolean) => void;
  setCurrentUserId: (userId: string) => void;
  setFilters: (filters: Partial<MemoryFilters>) => void;
  setSearch: (search: string) => void;
  setLlmClient: (clientId: string) => void;
  setEmbedderClient: (clientId: string) => void;
  setEmbedderDimensions: (dimensions: number) => void;
  setSyncCadence: (cadence: MemoryState["config"]["syncCadence"]) => void;
  toggleAutomaticFactExtraction: () => void;
  addMemory: (input: CreateMemoryInput) => MemoryItem;
  updateMemory: (id: string, input: UpdateMemoryInput) => void;
  deleteMemory: (id: string) => void;
  addUser: (input: CreateUserInput) => MemoryUserDefinition;
  deleteUser: (userId: string) => void;
  reset: () => void;
};

function buildInitialState(): MemoryState {
  return buildMemoryState();
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),
      setGlobalEnabled: (enabled) => {
        set({ globalEnabled: enabled });
      },
      setCurrentUserId: (userId) => {
        set((state) => {
          const exists = state.users.some((user) => user.id === userId);
          if (!exists) {
            return state;
          }

          return {
            currentUserId: userId,
            filters: {
              ...state.filters,
              userId,
            },
          };
        });
      },
      setFilters: (filters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...filters,
          },
        }));
      },
      setSearch: (search) => {
        set((state) => ({
          filters: {
            ...state.filters,
            search,
          },
        }));
      },
      setLlmClient: (clientId) => {
        set((state) => {
          const client = state.llmOptions.find((option) => option.id === clientId);
          if (!client) {
            return state;
          }

          return {
            config: {
              ...state.config,
              llmClient: client,
            },
          };
        });
      },
      setEmbedderClient: (clientId) => {
        set((state) => {
          const client = state.embedderOptions.find((option) => option.id === clientId);
          if (!client) {
            return state;
          }

          return {
            config: {
              ...state.config,
              embedderClient: client,
            },
          };
        });
      },
      setEmbedderDimensions: (dimensions) => {
        set((state) => ({
          config: {
            ...state.config,
            embedderDimensions: Math.max(32, Math.min(4096, Math.round(dimensions))),
          },
        }));
      },
      setSyncCadence: (cadence) => {
        set((state) => ({
          config: {
            ...state.config,
            syncCadence: cadence,
          },
        }));
      },
      toggleAutomaticFactExtraction: () => {
        set((state) => ({
          config: {
            ...state.config,
            automaticFactExtraction: !state.config.automaticFactExtraction,
          },
        }));
      },
      addMemory: ({ memory, metadata = {}, userId }) => {
        const { currentUserId } = get();
        const resolvedUserId = userId ?? currentUserId;
        const newMemory: MemoryItem = {
          id: createId("memory"),
          userId: resolvedUserId,
          memory,
          metadata,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          memories: [newMemory, ...state.memories],
          lastUpdatedAt: newMemory.createdAt,
        }));

        return newMemory;
      },
      updateMemory: (id, input) => {
        set((state) => ({
          memories: state.memories.map((memory) =>
            memory.id === id
              ? {
                  ...memory,
                  ...("memory" in input ? { memory: input.memory ?? memory.memory } : {}),
                  metadata: input.metadata ?? memory.metadata,
                  updatedAt: new Date().toISOString(),
                }
              : memory,
          ),
          lastUpdatedAt: new Date().toISOString(),
        }));
      },
      deleteMemory: (id) => {
        set((state) => ({
          memories: state.memories.filter((memory) => memory.id !== id),
          lastUpdatedAt: new Date().toISOString(),
        }));
      },
      addUser: ({ id, label, description }) => {
        const newUser: MemoryUserDefinition = {
          id,
          label,
          description,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          if (state.users.some((user) => user.id === id)) {
            return state;
          }

          return {
            users: [...state.users, newUser],
            currentUserId: newUser.id,
            filters: {
              ...state.filters,
              userId: newUser.id,
            },
          };
        });

        return newUser;
      },
      deleteUser: (userId) => {
        set((state) => {
          const remainingUsers = state.users.filter((user) => user.id !== userId);
          if (remainingUsers.length === 0) {
            return state;
          }

          const nextUserId =
            state.currentUserId === userId ? remainingUsers[0]?.id ?? "default-user" : state.currentUserId;

          return {
            users: remainingUsers,
            memories: state.memories.filter((memory) => memory.userId !== userId),
            currentUserId: nextUserId,
            filters: {
              ...state.filters,
              userId: nextUserId,
            },
          };
        });
      },
      reset: () => {
        set(buildInitialState());
      },
    }),
    {
      name: MEMORY_STORAGE_KEY,
      version: MEMORY_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        config: state.config,
        users: state.users,
        memories: state.memories,
        currentUserId: state.currentUserId,
        globalEnabled: state.globalEnabled,
        filters: state.filters,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
      migrate: (persistedState, version) => {
        if (!persistedState || version === MEMORY_STORAGE_VERSION) {
          return persistedState as MemoryStore;
        }

        const rebuilt = buildInitialState();
        return {
          ...rebuilt,
          setGlobalEnabled: () => undefined,
          setCurrentUserId: () => undefined,
          setFilters: () => undefined,
          setSearch: () => undefined,
          setLlmClient: () => undefined,
          setEmbedderClient: () => undefined,
          setEmbedderDimensions: () => undefined,
          setSyncCadence: () => undefined,
          toggleAutomaticFactExtraction: () => undefined,
          addMemory: () => {
            throw new Error("Memory store not ready during migration");
          },
          updateMemory: () => undefined,
          deleteMemory: () => undefined,
          addUser: () => {
            throw new Error("Memory store not ready during migration");
          },
          deleteUser: () => undefined,
          reset: () => undefined,
        } as MemoryStore;
      },
    },
  ),
);

export function resetMemoryStore() {
  useMemoryStore.getState().reset();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(MEMORY_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear persisted memory state", error);
    }
  }
}
