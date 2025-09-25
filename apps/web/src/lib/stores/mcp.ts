import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  MCP_STORAGE_KEY,
  MCP_STORAGE_VERSION,
  buildMcpState,
  normalizeMcpServer,
  type McpFilters,
  type McpRuntimeId,
  type McpServer,
  type McpServerSource,
  type McpServerType,
  type McpState,
} from "@cinaseek/web-shared/mcp";

import { createId } from "@/utils/id";

function buildInitialState(): McpState {
  return buildMcpState();
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

function sortServers(servers: McpServer[]): McpServer[] {
  const builtin = servers.filter((server) => server.source === "builtin");
  const custom = servers
    .filter((server) => server.source === "custom")
    .sort((a, b) => {
      const timeA = new Date(a.createdAt ?? 0).getTime();
      const timeB = new Date(b.createdAt ?? 0).getTime();
      if (Number.isNaN(timeA) || Number.isNaN(timeB)) {
        return 0;
      }
      return timeB - timeA;
    });

  return [...builtin, ...custom];
}

function updateServerById(
  servers: McpServer[],
  id: string,
  updater: (server: McpServer) => McpServer,
): McpServer[] {
  let changed = false;
  const next = servers.map((server) => {
    if (server.id !== id) {
      return server;
    }
    changed = true;
    return updater(server);
  });

  return changed ? sortServers(next.map(normalizeMcpServer)) : servers;
}

function normalizeArgs(args: string[] | undefined): string[] {
  if (!args?.length) {
    return [];
  }
  const unique = new Set<string>();
  args.forEach((value) => {
    const trimmed = value.trim();
    if (trimmed) {
      unique.add(trimmed);
    }
  });
  return Array.from(unique);
}

function normalizeRecord(value: Record<string, string> | undefined): Record<string, string> {
  if (!value) {
    return {};
  }
  return Object.entries(value).reduce<Record<string, string>>((accumulator, [key, val]) => {
    if (!key) {
      return accumulator;
    }
    accumulator[key] = val ?? "";
    return accumulator;
  }, {});
}

function normalizeTags(tags: string[] | undefined): string[] {
  return normalizeArgs(tags);
}

function clampTimeout(value: number | null | undefined): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return Math.min(Math.max(Math.round(value), 5), 600);
}

interface CreateMcpServerInput {
  name: string;
  label: string;
  description?: string;
  type: McpServerType;
  baseUrl?: string;
  command?: string;
  args?: string[];
  headers?: Record<string, string>;
  env?: Record<string, string>;
  provider?: string;
  providerUrl?: string;
  logoUrl?: string;
  tags?: string[];
  longRunning?: boolean;
  timeout?: number | null;
  reference?: string;
  supportsPrompts?: boolean;
  supportsResources?: boolean;
  requiresConfiguration?: boolean;
}

interface UpdateMcpServerInput extends Partial<Omit<CreateMcpServerInput, "type" | "name" | "label">> {
  label?: string;
  type?: McpServerType;
  name?: string;
  source?: McpServerSource;
  isActive?: boolean;
}

interface McpStore extends McpState {
  setFilters: (filters: Partial<McpFilters>) => void;
  addServer: (input: CreateMcpServerInput) => McpServer;
  updateServer: (id: string, input: UpdateMcpServerInput) => void;
  removeServer: (id: string) => void;
  toggleServer: (id: string, active?: boolean) => void;
  setRuntimeAvailability: (runtime: McpRuntimeId, available: boolean) => void;
  touchSync: () => void;
  reset: () => void;
}

type PersistedMcpState = {
  servers?: McpServer[];
  uvAvailable?: boolean;
  bunAvailable?: boolean;
  lastSyncedAt?: string | null;
} | null;

function prepareCustomServer(input: CreateMcpServerInput): McpServer {
  const now = new Date().toISOString();
  return normalizeMcpServer({
    id: createId("mcp"),
    name: input.name.trim(),
    label: input.label.trim() || input.name.trim(),
    description: input.description?.trim(),
    type: input.type,
    source: "custom",
    baseUrl: input.baseUrl?.trim(),
    command: input.command?.trim(),
    args: normalizeArgs(input.args),
    headers: normalizeRecord(input.headers),
    env: normalizeRecord(input.env),
    provider: input.provider?.trim(),
    providerUrl: input.providerUrl?.trim(),
    logoUrl: input.logoUrl?.trim(),
    tags: normalizeTags(input.tags),
    longRunning: Boolean(input.longRunning),
    timeout: clampTimeout(input.timeout),
    reference: input.reference?.trim(),
    supportsPrompts: input.supportsPrompts ?? true,
    supportsResources: input.supportsResources ?? true,
    requiresConfiguration: Boolean(input.requiresConfiguration),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
}

export const useMcpStore = create<McpStore>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),
      setFilters: (filters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...filters,
          },
        }));
      },
      addServer: (input) => {
        const server = prepareCustomServer(input);
        set((state) => ({
          servers: sortServers([...state.servers, server]),
        }));
        return server;
      },
      updateServer: (id, input) => {
        set((state) => ({
          servers: updateServerById(state.servers, id, (server) =>
            normalizeMcpServer({
              ...server,
              ...input,
              name: input.name?.trim() ?? server.name,
              label: input.label?.trim() ?? server.label,
              baseUrl: input.baseUrl?.trim() ?? server.baseUrl,
              command: input.command?.trim() ?? server.command,
              args: normalizeArgs(input.args ?? server.args),
              headers: normalizeRecord(input.headers ?? server.headers),
              env: normalizeRecord(input.env ?? server.env),
              provider: input.provider?.trim() ?? server.provider,
              providerUrl: input.providerUrl?.trim() ?? server.providerUrl,
              logoUrl: input.logoUrl?.trim() ?? server.logoUrl,
              tags: normalizeTags(input.tags ?? server.tags),
              longRunning: input.longRunning ?? server.longRunning,
              timeout: clampTimeout(input.timeout ?? server.timeout),
              reference: input.reference?.trim() ?? server.reference,
              supportsPrompts: input.supportsPrompts ?? server.supportsPrompts,
              supportsResources: input.supportsResources ?? server.supportsResources,
              requiresConfiguration: input.requiresConfiguration ?? server.requiresConfiguration,
              isActive: input.isActive ?? server.isActive,
              type: input.type ?? server.type,
              source: input.source ?? server.source,
              updatedAt: new Date().toISOString(),
            }),
          ),
        }));
      },
      removeServer: (id) => {
        set((state) => ({
          servers: state.servers.filter((server) => !(server.id === id && server.source === "custom")),
        }));
      },
      toggleServer: (id, active) => {
        set((state) => ({
          servers: updateServerById(state.servers, id, (server) => ({
            ...server,
            isActive: typeof active === "boolean" ? active : !server.isActive,
            updatedAt: new Date().toISOString(),
          })),
        }));
      },
      setRuntimeAvailability: (runtime, available) => {
        set((state) =>
          runtime === "uv"
            ? { uvAvailable: available }
            : runtime === "bun"
            ? { bunAvailable: available }
            : state,
        );
      },
      touchSync: () => {
        set({ lastSyncedAt: new Date().toISOString() });
      },
      reset: () => {
        const initial = buildInitialState();
        set(initial);
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(MCP_STORAGE_KEY);
          } catch (error) {
            console.warn("Failed to reset MCP store", error);
          }
        }
      },
    }),
    {
      name: MCP_STORAGE_KEY,
      version: MCP_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        servers: state.servers,
        uvAvailable: state.uvAvailable,
        bunAvailable: state.bunAvailable,
        lastSyncedAt: state.lastSyncedAt,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as PersistedMcpState;
        if (!persisted) {
          return currentState;
        }

        const fallback = buildInitialState();
        const persistedServers = persisted.servers?.map(normalizeMcpServer) ?? [];

        const mergedBuiltin = fallback.servers
          .filter((server) => server.source === "builtin")
          .map((server) => {
            const stored = persistedServers.find((item) => item.id === server.id);
            if (!stored) {
              return server;
            }
            return normalizeMcpServer({
              ...server,
              isActive: stored.isActive,
              env: Object.keys(stored.env ?? {}).length ? stored.env : server.env,
              headers: Object.keys(stored.headers ?? {}).length ? stored.headers : server.headers,
              tags: stored.tags?.length ? stored.tags : server.tags,
              args: stored.args?.length ? stored.args : server.args,
              requiresConfiguration: stored.requiresConfiguration,
              supportsPrompts: stored.supportsPrompts,
              supportsResources: stored.supportsResources,
              updatedAt: stored.updatedAt ?? server.updatedAt,
            });
          });

        const customServers = persistedServers.filter((server) => server.source === "custom");

        return {
          ...currentState,
          servers: sortServers([...mergedBuiltin, ...customServers]),
          uvAvailable: persisted.uvAvailable ?? currentState.uvAvailable,
          bunAvailable: persisted.bunAvailable ?? currentState.bunAvailable,
          lastSyncedAt: persisted.lastSyncedAt ?? currentState.lastSyncedAt,
        };
      },
    },
  ),
);

export function resetMcpStore() {
  useMcpStore.getState().reset();
}

export type {
  McpServer,
  McpServerType,
  McpServerSource,
  McpFilters,
} from "@cinaseek/web-shared/mcp";
