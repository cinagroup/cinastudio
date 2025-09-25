export type McpServerType = "stdio" | "sse" | "streamableHttp" | "inMemory";

export type McpServerSource = "builtin" | "custom";

export interface McpServerRuntime {
  uvAvailable: boolean;
  bunAvailable: boolean;
}

export interface McpServer {
  id: string;
  /** 唯一标识（通常与 CLI/包名一致） */
  name: string;
  /** UI 展示名称 */
  label: string;
  description?: string;
  type: McpServerType;
  source: McpServerSource;
  command?: string;
  args: string[];
  baseUrl?: string;
  headers: Record<string, string>;
  env: Record<string, string>;
  provider?: string;
  providerUrl?: string;
  logoUrl?: string;
  tags: string[];
  longRunning: boolean;
  timeout: number | null;
  reference?: string;
  requiresConfiguration: boolean;
  supportsPrompts: boolean;
  supportsResources: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface McpSeed {
  servers: McpServer[];
}

export type McpRuntimeId = "uv" | "bun";
