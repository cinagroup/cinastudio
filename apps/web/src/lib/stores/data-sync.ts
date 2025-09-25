import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DATA_SYNC_STORAGE_KEY,
  DATA_SYNC_STORAGE_VERSION,
  buildDataSyncState,
  type DataSyncConnectorState,
  type DataSyncConnectorStatus,
  type DataSyncProviderId,
  type DataSyncState,
} from "@cinaseek/web-shared/data-sync";

function buildInitialState(): DataSyncState {
  return buildDataSyncState();
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

interface DataSyncStore extends DataSyncState {
  selectProvider: (id: DataSyncProviderId) => void;
  toggleConnector: (id: DataSyncProviderId, enabled: boolean) => void;
  updateConnectorConfig: (id: DataSyncProviderId, key: string, value: string | boolean) => void;
  replaceConnectorConfig: (id: DataSyncProviderId, config: Record<string, string | boolean>) => void;
  markSyncing: (id: DataSyncProviderId) => void;
  markSynced: (id: DataSyncProviderId, timestamp?: string) => void;
  setError: (id: DataSyncProviderId, message: string) => void;
  clearError: (id: DataSyncProviderId) => void;
  resetProvider: (id: DataSyncProviderId) => void;
  reset: () => void;
}

type PersistedDataSyncState = {
  connectors?: Record<DataSyncProviderId, DataSyncConnectorState>;
  selectedProviderId?: DataSyncProviderId | null;
} | null;

function sanitizeStatus(status: DataSyncConnectorStatus): DataSyncConnectorStatus {
  if (status === "syncing" || status === "connected" || status === "error") {
    return status;
  }
  return "disconnected";
}

function mergeConnectors(
  current: Record<DataSyncProviderId, DataSyncConnectorState>,
  persisted?: Record<DataSyncProviderId, DataSyncConnectorState>,
): Record<DataSyncProviderId, DataSyncConnectorState> {
  if (!persisted) {
    return current;
  }

  const result: Record<DataSyncProviderId, DataSyncConnectorState> = { ...current };
  for (const [id, connector] of Object.entries(persisted) as Array<[
    DataSyncProviderId,
    DataSyncConnectorState,
  ]>) {
    if (!current[id]) {
      continue;
    }
    result[id] = {
      ...current[id],
      enabled: Boolean(connector.enabled),
      status: sanitizeStatus(connector.status),
      lastSyncedAt: connector.lastSyncedAt ?? current[id].lastSyncedAt ?? null,
      error: connector.error ?? null,
      config: {
        ...current[id].config,
        ...connector.config,
      },
    };
  }

  return result;
}

function normalizeValue(value: string | boolean): string | boolean {
  if (typeof value === "string") {
    return value.trim();
  }
  return value;
}

export const useDataSyncStore = create<DataSyncStore>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),
      selectProvider: (id) => {
        set((state) => {
          if (!state.providers.some((provider) => provider.id === id)) {
            return {};
          }
          return {
            selectedProviderId: id,
          };
        });
      },
      toggleConnector: (id, enabled) => {
        set((state) => {
          const connector = state.connectors[id];
          if (!connector) {
            return {};
          }

          return {
            connectors: {
              ...state.connectors,
              [id]: {
                ...connector,
                enabled,
                status: enabled
                  ? connector.status === "error"
                    ? "disconnected"
                    : connector.status
                  : "disconnected",
                error: enabled ? connector.error : null,
              },
            },
          };
        });
      },
      updateConnectorConfig: (id, key, value) => {
        set((state) => {
          const connector = state.connectors[id];
          if (!connector) {
            return {};
          }

          return {
            connectors: {
              ...state.connectors,
              [id]: {
                ...connector,
                config: {
                  ...connector.config,
                  [key]: normalizeValue(value),
                },
              },
            },
          };
        });
      },
      replaceConnectorConfig: (id, config) => {
        set((state) => {
          const connector = state.connectors[id];
          if (!connector) {
            return {};
          }

          const normalized = Object.entries(config).reduce<Record<string, string | boolean>>(
            (accumulator, [key, value]) => {
              accumulator[key] = normalizeValue(value as string | boolean);
              return accumulator;
            },
            {},
          );

          return {
            connectors: {
              ...state.connectors,
              [id]: {
                ...connector,
                config: {
                  ...connector.config,
                  ...normalized,
                },
              },
            },
          };
        });
      },
      markSyncing: (id) => {
        set((state) => {
          const connector = state.connectors[id];
          if (!connector) {
            return {};
          }

          return {
            connectors: {
              ...state.connectors,
              [id]: {
                ...connector,
                status: "syncing",
                error: null,
              },
            },
          };
        });
      },
      markSynced: (id, timestamp) => {
        set((state) => {
          const connector = state.connectors[id];
          if (!connector) {
            return {};
          }

          return {
            connectors: {
              ...state.connectors,
              [id]: {
                ...connector,
                status: "connected",
                error: null,
                lastSyncedAt: timestamp ?? new Date().toISOString(),
              },
            },
          };
        });
      },
      setError: (id, message) => {
        set((state) => {
          const connector = state.connectors[id];
          if (!connector) {
            return {};
          }

          return {
            connectors: {
              ...state.connectors,
              [id]: {
                ...connector,
                status: "error",
                error: message.trim() || "同步失败，请检查配置。",
              },
            },
          };
        });
      },
      clearError: (id) => {
        set((state) => {
          const connector = state.connectors[id];
          if (!connector) {
            return {};
          }

          const hasSynced = Boolean(connector.lastSyncedAt);

          return {
            connectors: {
              ...state.connectors,
              [id]: {
                ...connector,
                status: hasSynced && connector.enabled ? "connected" : "disconnected",
                error: null,
              },
            },
          };
        });
      },
      resetProvider: (id) => {
        const initial = buildInitialState();
        set((state) => {
          if (!state.connectors[id]) {
            return {};
          }
          return {
            connectors: {
              ...state.connectors,
              [id]: initial.connectors[id],
            },
          };
        });
      },
      reset: () => {
        const initial = buildInitialState();
        set(initial);
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(DATA_SYNC_STORAGE_KEY);
          } catch (error) {
            console.warn("Failed to reset data sync store", error);
          }
        }
      },
    }),
    {
      name: DATA_SYNC_STORAGE_KEY,
      version: DATA_SYNC_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        selectedProviderId: state.selectedProviderId,
        connectors: state.connectors,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as PersistedDataSyncState;
        if (!persisted) {
          return currentState;
        }

        const fallback = buildInitialState();
        const connectors = mergeConnectors(currentState.connectors, persisted.connectors);
        const selected = persisted.selectedProviderId &&
          fallback.providers.some((provider) => provider.id === persisted.selectedProviderId)
          ? persisted.selectedProviderId
          : currentState.selectedProviderId ?? fallback.selectedProviderId;

        return {
          ...currentState,
          connectors,
          selectedProviderId: selected,
        };
      },
    },
  ),
);

export function resetDataSyncStore() {
  useDataSyncStore.getState().reset();
}

export type {
  DataSyncState,
  DataSyncConnectorState,
  DataSyncConnectorStatus,
  DataSyncProviderDefinition,
  DataSyncProviderId,
  DataSyncProviderCategory,
  DataSyncFieldDefinition,
} from "@cinaseek/web-shared/data-sync";
