import { codeToolsSeed } from "./seed";
import type { CodeToolId, CodeToolsSeed } from "./types";

export const CODE_TOOLS_STORAGE_KEY = "cinaseek.codeTools";
export const CODE_TOOLS_STORAGE_VERSION = 1;

export interface CodeToolsStateData {
  tools: CodeToolsSeed["tools"];
  terminals: CodeToolsSeed["terminals"];
  selectedToolId: CodeToolId;
  selectedModelByTool: Partial<Record<CodeToolId, string | null>>;
  environmentByTool: Partial<Record<CodeToolId, string>>;
  directories: string[];
  currentDirectory: string | null;
  selectedTerminalId: string | null;
  customTerminalPaths: Record<string, string>;
  autoUpdateToLatest: boolean;
}

function buildSelectedModels(seed: CodeToolsSeed) {
  return seed.tools.reduce<Partial<Record<CodeToolId, string | null>>>((acc, tool) => {
    acc[tool.id] = tool.recommendedModels[0]?.id ?? null;
    return acc;
  }, {});
}

export function buildCodeToolsState(seed: CodeToolsSeed = codeToolsSeed): CodeToolsStateData {
  const defaultTool = seed.tools[0];
  return {
    tools: seed.tools.map((tool) => ({ ...tool, guide: tool.guide.map((step) => ({ ...step })) })),
    terminals: seed.terminals.map((terminal) => ({ ...terminal })),
    selectedToolId: defaultTool?.id ?? "claude-code",
    selectedModelByTool: buildSelectedModels(seed),
    environmentByTool: { ...seed.defaultEnvironments },
    directories: [],
    currentDirectory: null,
    selectedTerminalId: seed.terminals[0]?.id ?? null,
    customTerminalPaths: {},
    autoUpdateToLatest: false,
  };
}

export function mergeCodeToolsState(
  persisted: Partial<CodeToolsStateData> | null,
  seed: CodeToolsSeed = codeToolsSeed,
): CodeToolsStateData {
  const base = buildCodeToolsState(seed);
  if (!persisted) {
    return base;
  }

  const selectedToolId =
    persisted.selectedToolId && seed.tools.some((tool) => tool.id === persisted.selectedToolId)
      ? persisted.selectedToolId
      : base.selectedToolId;

  const selectedModelByTool = { ...base.selectedModelByTool };
  const persistedModels = persisted.selectedModelByTool ?? {};
  seed.tools.forEach((tool) => {
    const modelId = persistedModels[tool.id] ?? base.selectedModelByTool[tool.id] ?? null;
    if (modelId && tool.recommendedModels.some((model) => model.id === modelId)) {
      selectedModelByTool[tool.id] = modelId;
    }
  });

  const selectedTerminalId =
    persisted.selectedTerminalId && seed.terminals.some((terminal) => terminal.id === persisted.selectedTerminalId)
      ? persisted.selectedTerminalId
      : base.selectedTerminalId;

  return {
    ...base,
    selectedToolId,
    selectedModelByTool,
    environmentByTool: {
      ...base.environmentByTool,
      ...(persisted.environmentByTool ?? {}),
    },
    directories: Array.isArray(persisted.directories) ? [...persisted.directories] : base.directories,
    currentDirectory: persisted.currentDirectory ?? base.currentDirectory,
    selectedTerminalId,
    customTerminalPaths: persisted.customTerminalPaths ? { ...persisted.customTerminalPaths } : {},
    autoUpdateToLatest: persisted.autoUpdateToLatest ?? base.autoUpdateToLatest,
  };
}
