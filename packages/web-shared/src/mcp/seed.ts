import type { McpSeed, McpServer } from "./types";

const BASE_CREATED_AT = "2024-05-01T00:00:00.000Z";
const SAMPLE_UPDATED_AT = "2024-05-08T00:00:00.000Z";

function createBuiltinServer(
  partial: Omit<
    McpServer,
    | "source"
    | "args"
    | "headers"
    | "env"
    | "tags"
    | "longRunning"
    | "timeout"
    | "requiresConfiguration"
    | "supportsPrompts"
    | "supportsResources"
  > & {
    args?: string[];
    headers?: Record<string, string>;
    env?: Record<string, string>;
    tags?: string[];
    longRunning?: boolean;
    timeout?: number | null;
    requiresConfiguration?: boolean;
    supportsPrompts?: boolean;
    supportsResources?: boolean;
  },
): McpServer {
  const {
    args = [],
    headers = {},
    env = {},
    tags = [],
    longRunning = false,
    timeout = null,
    requiresConfiguration = false,
    supportsPrompts = true,
    supportsResources = true,
    ...rest
  } = partial;

  return {
    ...rest,
    source: "builtin",
    args,
    headers,
    env,
    tags,
    longRunning,
    timeout,
    requiresConfiguration,
    supportsPrompts,
    supportsResources,
  };
}

const builtinServers: McpServer[] = [
  createBuiltinServer({
    id: "builtin-mcp-auto-install",
    name: "@cherry/mcp-auto-install",
    label: "Auto Install Helper",
    description: "自动安装 Cherry 官方 MCP 服务，帮助快速体验市场生态。",
    type: "inMemory",
    command: "npx",
    args: ["-y", "@mcpmarket/mcp-auto-install", "connect", "--json"],
    provider: "Cherry Studio",
    reference: "https://docs.cherry-ai.com/advanced-basic/mcp/auto-install",
    tags: ["自动部署", "实验"],
    isActive: false,
    createdAt: BASE_CREATED_AT,
  }),
  createBuiltinServer({
    id: "builtin-memory",
    name: "@cherry/memory",
    label: "Cherry Memory",
    description: "以本地文件缓存用户记忆，增强跨平台上下文能力。",
    type: "inMemory",
    provider: "Cherry Studio",
    env: {
      MEMORY_FILE_PATH: "YOUR_MEMORY_FILE_PATH",
    },
    requiresConfiguration: true,
    tags: ["记忆", "上下文"],
    isActive: true,
    createdAt: BASE_CREATED_AT,
    updatedAt: SAMPLE_UPDATED_AT,
  }),
  createBuiltinServer({
    id: "builtin-sequential-thinking",
    name: "@cherry/sequentialthinking",
    label: "Sequential Thinking",
    description: "提供逐步推理策略，帮助构建多阶段工作流。",
    type: "inMemory",
    provider: "Cherry Studio",
    tags: ["推理"],
    isActive: true,
    createdAt: BASE_CREATED_AT,
  }),
  createBuiltinServer({
    id: "builtin-brave-search",
    name: "@cherry/brave-search",
    label: "Brave Search",
    description: "连接 Brave 搜索 API，增强实时搜索能力。",
    type: "inMemory",
    provider: "Cherry Studio",
    env: {
      BRAVE_API_KEY: "YOUR_API_KEY",
    },
    requiresConfiguration: true,
    tags: ["搜索", "外部"],
    isActive: false,
    createdAt: BASE_CREATED_AT,
  }),
  createBuiltinServer({
    id: "builtin-fetch",
    name: "@cherry/fetch",
    label: "Universal Fetch",
    description: "提供 HTTP 请求能力，便于助手调用任意 REST 服务。",
    type: "inMemory",
    provider: "Cherry Studio",
    tags: ["网络"],
    isActive: true,
    createdAt: BASE_CREATED_AT,
  }),
  createBuiltinServer({
    id: "builtin-filesystem",
    name: "@cherry/filesystem",
    label: "Filesystem Bridge",
    description: "访问本地文件系统，支持读取与写入指定目录。",
    type: "inMemory",
    provider: "Cherry Studio",
    args: ["/Users/username/Desktop", "/path/to/other/allowed/dir"],
    requiresConfiguration: true,
    tags: ["文件"],
    isActive: false,
    createdAt: BASE_CREATED_AT,
  }),
  createBuiltinServer({
    id: "builtin-dify-knowledge",
    name: "@cherry/dify-knowledge",
    label: "Dify Knowledge",
    description: "桥接 Dify 知识库，复用已有企业内容。",
    type: "inMemory",
    provider: "Cherry Studio",
    env: {
      DIFY_KEY: "YOUR_DIFY_KEY",
    },
    requiresConfiguration: true,
    tags: ["知识库"],
    isActive: false,
    createdAt: BASE_CREATED_AT,
  }),
  createBuiltinServer({
    id: "builtin-python",
    name: "@cherry/python",
    label: "Python Runtime",
    description: "在隔离环境中运行 Python 代码，支持工具脚本。",
    type: "inMemory",
    provider: "Cherry Studio",
    tags: ["脚本", "代码"],
    isActive: false,
    createdAt: BASE_CREATED_AT,
  }),
];

const sampleCustomServers: McpServer[] = [
  {
    id: "custom-dify-bridge",
    name: "team/dify-bridge",
    label: "团队知识库桥接",
    description: "通过 HTTP MCP 适配器接入私有 Dify 实例，供翻译与知识库查询使用。",
    type: "streamableHttp",
    source: "custom",
    baseUrl: "https://dify.example.com/mcp",
    headers: {
      Authorization: "Bearer team-secret",
    },
    env: {},
    args: [],
    provider: "Team Ops",
    providerUrl: "https://dify.example.com",
    tags: ["知识库", "HTTP"],
    longRunning: true,
    timeout: 120,
    reference: "https://modelcontextprotocol.io",
    requiresConfiguration: false,
    supportsPrompts: true,
    supportsResources: true,
    isActive: true,
    createdAt: "2024-05-10T00:00:00.000Z",
    updatedAt: "2024-05-12T00:00:00.000Z",
  },
];

export const mcpSeed: McpSeed = {
  servers: [...builtinServers, ...sampleCustomServers],
};
