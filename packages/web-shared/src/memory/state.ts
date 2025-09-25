import { memorySeed } from "./seed";
import type {
  MemoryConfig,
  MemoryItem,
  MemorySeed,
  MemoryUserDefinition,
  MemoryApiClientConfig,
} from "./types";

export const MEMORY_STORAGE_KEY = "cinaseek.memory";
export const MEMORY_STORAGE_VERSION = 1;

export interface MemoryFilters {
  search: string;
  userId: string;
}

export interface MemoryState {
  config: MemoryConfig;
  users: MemoryUserDefinition[];
  memories: MemoryItem[];
  llmOptions: MemoryApiClientConfig[];
  embedderOptions: MemoryApiClientConfig[];
  currentUserId: string;
  globalEnabled: boolean;
  filters: MemoryFilters;
  lastUpdatedAt: string | null;
}

export function buildMemoryState(seed: MemorySeed = memorySeed): MemoryState {
  const lastUpdated = seed.memories
    .map((memory) => memory.updatedAt ?? memory.createdAt)
    .sort()
    .pop();

  return {
    config: seed.config,
    users: seed.users,
    memories: seed.memories,
    llmOptions: seed.llmOptions,
    embedderOptions: seed.embedderOptions,
    currentUserId: seed.users[0]?.id ?? "default-user",
    globalEnabled: true,
    filters: {
      search: "",
      userId: seed.users[0]?.id ?? "default-user",
    },
    lastUpdatedAt: lastUpdated ?? null,
  };
}
