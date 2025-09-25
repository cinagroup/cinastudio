import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  CODE_TOOLS_STORAGE_KEY,
  CODE_TOOLS_STORAGE_VERSION,
  buildCodeToolsState,
  mergeCodeToolsState,
  type CodeToolId,
  type CodeToolsStateData,
} from "@cinaseek/web-shared/code-tools";

interface CodeToolsState extends CodeToolsStateData {
  setSelectedTool: (toolId: CodeToolId) => void;
  setSelectedModel: (modelId: string | null) => void;
  setEnvironment: (value: string) => void;
  addDirectory: (directory: string) => void;
  removeDirectory: (directory: string) => void;
  setCurrentDirectory: (directory: string | null) => void;
  clearDirectories: () => void;
  setSelectedTerminal: (terminalId: string) => void;
  setCustomTerminalPath: (terminalId: string, path: string) => void;
  setAutoUpdateToLatest: (value: boolean) => void;
  reset: () => void;
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

export const useCodeToolsStore = create<CodeToolsState>()(
  persist(
    (set, get) => ({
      ...buildCodeToolsState(),
      setSelectedTool: (toolId) => {
        const state = get();
        if (!state.tools.some((tool) => tool.id === toolId)) {
          return;
        }

        set((current) => {
          const currentModel = current.selectedModelByTool[toolId];
          const tool = current.tools.find((item) => item.id === toolId);
          const firstModel = tool?.recommendedModels[0]?.id ?? null;

          return {
            selectedToolId: toolId,
            selectedModelByTool: {
              ...current.selectedModelByTool,
              [toolId]: currentModel ?? firstModel ?? null,
            },
          };
        });
      },
      setSelectedModel: (modelId) => {
        const state = get();
        const toolId = state.selectedToolId;
        const tool = state.tools.find((item) => item.id === toolId);
        if (!tool) {
          return;
        }

        if (modelId && !tool.recommendedModels.some((model) => model.id === modelId)) {
          return;
        }

        set((current) => ({
          selectedModelByTool: {
            ...current.selectedModelByTool,
            [toolId]: modelId,
          },
        }));
      },
      setEnvironment: (value) => {
        const toolId = get().selectedToolId;
        set((current) => ({
          environmentByTool: {
            ...current.environmentByTool,
            [toolId]: value,
          },
        }));
      },
      addDirectory: (directory) => {
        const trimmed = directory.trim();
        if (!trimmed) {
          return;
        }

        set((current) => {
          if (current.directories.includes(trimmed)) {
            return {};
          }

          return {
            directories: [...current.directories, trimmed],
            currentDirectory: current.currentDirectory ?? trimmed,
          };
        });
      },
      removeDirectory: (directory) => {
        set((current) => {
          const nextDirectories = current.directories.filter((item) => item !== directory);
          const nextCurrent = current.currentDirectory === directory ? nextDirectories[0] ?? null : current.currentDirectory;

          return {
            directories: nextDirectories,
            currentDirectory: nextCurrent ?? null,
          };
        });
      },
      setCurrentDirectory: (directory) => {
        if (!directory) {
          set({ currentDirectory: null });
          return;
        }

        set((current) => {
          if (!current.directories.includes(directory)) {
            return {};
          }
          return { currentDirectory: directory };
        });
      },
      clearDirectories: () => {
        set({ directories: [], currentDirectory: null });
      },
      setSelectedTerminal: (terminalId) => {
        const state = get();
        if (!state.terminals.some((terminal) => terminal.id === terminalId)) {
          return;
        }
        set({ selectedTerminalId: terminalId });
      },
      setCustomTerminalPath: (terminalId, path) => {
        set((current) => ({
          customTerminalPaths: {
            ...current.customTerminalPaths,
            [terminalId]: path,
          },
        }));
      },
      setAutoUpdateToLatest: (value) => {
        set({ autoUpdateToLatest: value });
      },
      reset: () => {
        set(buildCodeToolsState());
      },
    }),
    {
      name: CODE_TOOLS_STORAGE_KEY,
      version: CODE_TOOLS_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        selectedToolId: state.selectedToolId,
        selectedModelByTool: state.selectedModelByTool,
        environmentByTool: state.environmentByTool,
        directories: state.directories,
        currentDirectory: state.currentDirectory,
        selectedTerminalId: state.selectedTerminalId,
        customTerminalPaths: state.customTerminalPaths,
        autoUpdateToLatest: state.autoUpdateToLatest,
      }),
      migrate: (persistedState, version) => {
        if (!persistedState || version !== CODE_TOOLS_STORAGE_VERSION) {
          return buildCodeToolsState();
        }

        return mergeCodeToolsState(persistedState as Partial<CodeToolsStateData>);
      },
    },
  ),
);

export function resetCodeToolsStore() {
  useCodeToolsStore.getState().reset();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(CODE_TOOLS_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear persisted code tools state", error);
    }
  }
}
