import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  WEB_SEARCH_STORAGE_KEY,
  WEB_SEARCH_STORAGE_VERSION,
  buildWebSearchState,
  type WebSearchCompressionConfig,
  type WebSearchProviderConfig,
  type WebSearchProviderId,
  type WebSearchState,
  type WebSearchSubscribeSource,
} from "@cinaseek/web-shared/web-search";

function buildInitialState(): WebSearchState {
  return buildWebSearchState();
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

interface WebSearchStore extends WebSearchState {
  setDefaultProvider: (id: WebSearchProviderId) => void;
  setSearchWithTime: (enabled: boolean) => void;
  setMaxResults: (count: number) => void;
  setExcludeDomains: (domains: string[]) => void;
  setExcludeDomainsFromText: (text: string) => void;
  updateProviderConfig: (id: WebSearchProviderId, config: Partial<WebSearchProviderConfig>) => void;
  addSubscribeSource: (source: Omit<WebSearchSubscribeSource, "key">) => void;
  updateSubscribeSource: (key: number, source: Partial<Omit<WebSearchSubscribeSource, "key">>) => void;
  removeSubscribeSource: (key: number) => void;
  setCompressionConfig: (config: WebSearchCompressionConfig) => void;
  updateCompressionConfig: (config: Partial<WebSearchCompressionConfig>) => void;
  reset: () => void;
}

type PersistedWebSearchState = {
  defaultProviderId?: WebSearchProviderId;
  searchWithTime?: boolean;
  maxResults?: number;
  excludeDomains?: string[];
  subscribeSources?: WebSearchSubscribeSource[];
  compression?: WebSearchCompressionConfig;
  providerConfigs?: Record<WebSearchProviderId, WebSearchProviderConfig>;
} | null;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeDomains(domains: string[]): string[] {
  const unique = new Set<string>();
  domains.forEach((domain) => {
    const trimmed = domain.trim().toLowerCase();
    if (trimmed) {
      unique.add(trimmed);
    }
  });
  return Array.from(unique);
}

function parseDomainsFromText(text: string): string[] {
  return normalizeDomains(
    text
      .split(/[\n,]/)
      .map((part) => part.trim())
      .filter(Boolean),
  );
}

function mergeSubscribeSources(
  next: WebSearchSubscribeSource[] | undefined,
  fallbackSources: WebSearchSubscribeSource[],
): WebSearchSubscribeSource[] {
  if (!next) {
    return fallbackSources;
  }

  return next.map((source, index) => ({
    key: typeof source.key === "number" ? source.key : index,
    name: source.name,
    url: source.url,
    blacklist: source.blacklist ?? [],
  }));
}

export const useWebSearchStore = create<WebSearchStore>()(
  persist(
    (set, _get) => ({
      ...buildInitialState(),
      setDefaultProvider: (id) => {
        set((state) => {
          const exists = state.providers.some((provider) => provider.id === id);
          if (!exists) {
            return {};
          }

          return {
            defaultProviderId: id,
          };
        });
      },
      setSearchWithTime: (enabled) => {
        set({
          searchWithTime: enabled,
        });
      },
      setMaxResults: (count) => {
        const normalized = clamp(Math.round(count), 1, 10);
        set({
          maxResults: normalized,
        });
      },
      setExcludeDomains: (domains) => {
        set({
          excludeDomains: normalizeDomains(domains),
        });
      },
      setExcludeDomainsFromText: (text) => {
        set({
          excludeDomains: parseDomainsFromText(text),
        });
      },
      updateProviderConfig: (id, config) => {
        set((state) => {
          if (!state.providers.some((provider) => provider.id === id)) {
            return {};
          }

          const current = state.providerConfigs[id] ?? {};
          return {
            providerConfigs: {
              ...state.providerConfigs,
              [id]: {
                ...current,
                ...config,
              },
            },
          };
        });
      },
      addSubscribeSource: (source) => {
        set((state) => {
          const nextKey = state.subscribeSources.length
            ? Math.max(...state.subscribeSources.map((item) => item.key)) + 1
            : 0;
          return {
            subscribeSources: [
              ...state.subscribeSources,
              {
                key: nextKey,
                name: source.name,
                url: source.url,
                blacklist: source.blacklist ?? [],
              },
            ],
          };
        });
      },
      updateSubscribeSource: (key, source) => {
        set((state) => ({
          subscribeSources: state.subscribeSources.map((item) =>
            item.key === key
              ? {
                  ...item,
                  ...source,
                  blacklist: source.blacklist ?? item.blacklist,
                }
              : item,
          ),
        }));
      },
      removeSubscribeSource: (key) => {
        set((state) => ({
          subscribeSources: state.subscribeSources.filter((item) => item.key !== key),
        }));
      },
      setCompressionConfig: (config) => {
        set({
          compression: {
            ...config,
          },
        });
      },
      updateCompressionConfig: (config) => {
        set((state) => ({
          compression: {
            ...state.compression,
            ...config,
          },
        }));
      },
      reset: () => {
        const initial = buildInitialState();
        set(initial);
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(WEB_SEARCH_STORAGE_KEY);
          } catch (error) {
            console.warn("Failed to reset web search store", error);
          }
        }
      },
    }),
    {
      name: WEB_SEARCH_STORAGE_KEY,
      version: WEB_SEARCH_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        defaultProviderId: state.defaultProviderId,
        searchWithTime: state.searchWithTime,
        maxResults: state.maxResults,
        excludeDomains: state.excludeDomains,
        subscribeSources: state.subscribeSources,
        compression: state.compression,
        providerConfigs: state.providerConfigs,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as PersistedWebSearchState;
        if (!persisted) {
          return currentState;
        }

        const fallback = buildInitialState();

        const defaultProviderId = persisted.defaultProviderId &&
          fallback.providers.some((provider) => provider.id === persisted.defaultProviderId)
          ? persisted.defaultProviderId
          : currentState.defaultProviderId;

        return {
          ...currentState,
          defaultProviderId,
          searchWithTime: persisted.searchWithTime ?? currentState.searchWithTime,
          maxResults: persisted.maxResults
            ? clamp(Math.round(persisted.maxResults), 1, 10)
            : currentState.maxResults,
          excludeDomains: persisted.excludeDomains
            ? normalizeDomains(persisted.excludeDomains)
            : currentState.excludeDomains,
          subscribeSources: mergeSubscribeSources(persisted.subscribeSources, currentState.subscribeSources),
          compression: persisted.compression
            ? {
                ...currentState.compression,
                ...persisted.compression,
              }
            : currentState.compression,
          providerConfigs: persisted.providerConfigs
            ? {
                ...currentState.providerConfigs,
                ...persisted.providerConfigs,
              }
            : currentState.providerConfigs,
        };
      },
    },
  ),
);

export function resetWebSearchStore() {
  useWebSearchStore.getState().reset();
}

export type {
  WebSearchState,
  WebSearchProviderDefinition,
  WebSearchProviderConfig,
  WebSearchProviderId,
  WebSearchCompressionConfig,
  WebSearchSubscribeSource,
} from "@cinaseek/web-shared/web-search";
