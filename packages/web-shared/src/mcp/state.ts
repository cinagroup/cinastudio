import { mcpSeed } from "./seed";
import type { McpSeed, McpServer, McpServerSource } from "./types";

export const MCP_STORAGE_KEY = "cinaseek.mcp";
export const MCP_STORAGE_VERSION = 1;

export interface McpFilters {
  search: string;
  status: "all" | "active" | "inactive";
  source: "all" | McpServerSource;
}

export interface McpState {
  servers: McpServer[];
  filters: McpFilters;
  uvAvailable: boolean;
  bunAvailable: boolean;
  lastSyncedAt: string | null;
}

function normalizeList(values: string[] | undefined): string[] {
  if (!values?.length) {
    return [];
  }
  const unique = new Set<string>();
  values.forEach((value) => {
    const trimmed = value.trim();
    if (trimmed) {
      unique.add(trimmed);
    }
  });
  return Array.from(unique);
}

function clampTimeout(value: number | null | undefined): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return Math.min(Math.max(Math.round(value), 5), 600);
}

export function normalizeMcpServer(server: McpServer): McpServer {
  return {
    ...server,
    label: server.label || server.name,
    args: normalizeList(server.args),
    headers: server.headers ?? {},
    env: server.env ?? {},
    tags: normalizeList(server.tags),
    longRunning: Boolean(server.longRunning),
    timeout: clampTimeout(server.timeout),
    requiresConfiguration: Boolean(server.requiresConfiguration),
    supportsPrompts: server.supportsPrompts ?? true,
    supportsResources: server.supportsResources ?? true,
    isActive: Boolean(server.isActive),
    createdAt: server.createdAt ?? new Date().toISOString(),
    updatedAt: server.updatedAt,
    source: server.source,
  };
}

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

export function buildMcpState(seed: McpSeed = mcpSeed): McpState {
  const normalized = seed.servers.map(normalizeMcpServer);
  return {
    servers: sortServers(normalized),
    filters: {
      search: "",
      status: "all",
      source: "all",
    },
    uvAvailable: true,
    bunAvailable: true,
    lastSyncedAt: null,
  };
}
