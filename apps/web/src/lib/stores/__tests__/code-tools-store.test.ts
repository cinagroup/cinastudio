import { act } from "@testing-library/react";

import { resetCodeToolsStore, useCodeToolsStore } from "../code-tools";

describe("code tools store", () => {
  beforeEach(() => {
    resetCodeToolsStore();
  });

  it("initializes with seeded tools and terminals", () => {
    const state = useCodeToolsStore.getState();
    expect(state.tools.length).toBeGreaterThan(0);
    expect(state.terminals.length).toBeGreaterThan(0);
    expect(state.selectedToolId).toBe(state.tools[0].id);
    expect(state.selectedTerminalId).toBe(state.terminals[0]?.id ?? null);
  });

  it("updates selected tool and remembers model selection", () => {
    const [firstTool, secondTool] = useCodeToolsStore.getState().tools;
    expect(firstTool).toBeDefined();
    expect(secondTool).toBeDefined();
    if (!firstTool || !secondTool) return;

    act(() => {
      useCodeToolsStore.getState().setSelectedTool(secondTool.id);
    });

    expect(useCodeToolsStore.getState().selectedToolId).toBe(secondTool.id);

    const targetModel = secondTool.recommendedModels[1]?.id ?? secondTool.recommendedModels[0]?.id ?? null;
    if (targetModel) {
      act(() => {
        useCodeToolsStore.getState().setSelectedModel(targetModel);
      });

      expect(useCodeToolsStore.getState().selectedModelByTool[secondTool.id]).toBe(targetModel);

      act(() => {
        useCodeToolsStore.getState().setSelectedTool(firstTool.id);
      });

      expect(useCodeToolsStore.getState().selectedToolId).toBe(firstTool.id);

      act(() => {
        useCodeToolsStore.getState().setSelectedTool(secondTool.id);
      });

      expect(useCodeToolsStore.getState().selectedModelByTool[secondTool.id]).toBe(targetModel);
    }
  });

  it("manages directories and environment snippets", () => {
    act(() => {
      useCodeToolsStore.getState().addDirectory("/workspace/project-a");
      useCodeToolsStore.getState().addDirectory("/workspace/project-b");
      useCodeToolsStore.getState().setCurrentDirectory("/workspace/project-b");
      useCodeToolsStore.getState().setEnvironment("export API_KEY=123\ncli run");
      useCodeToolsStore.getState().removeDirectory("/workspace/project-a");
    });

    const state = useCodeToolsStore.getState();
    expect(state.directories).toEqual(["/workspace/project-b"]);
    expect(state.currentDirectory).toBe("/workspace/project-b");
    const activeTool = state.tools.find((tool) => tool.id === state.selectedToolId);
    if (activeTool) {
      expect(state.environmentByTool[activeTool.id]).toContain("API_KEY");
    }

    act(() => {
      useCodeToolsStore.getState().clearDirectories();
    });

    expect(useCodeToolsStore.getState().directories).toEqual([]);
    expect(useCodeToolsStore.getState().currentDirectory).toBeNull();
  });

  it("updates terminal preferences and flags", () => {
    const state = useCodeToolsStore.getState();
    const terminal = state.terminals[1];
    if (!terminal) {
      return;
    }

    act(() => {
      useCodeToolsStore.getState().setSelectedTerminal(terminal.id);
      useCodeToolsStore.getState().setCustomTerminalPath(terminal.id, "/usr/local/bin/custom-terminal");
      useCodeToolsStore.getState().setAutoUpdateToLatest(true);
    });

    const next = useCodeToolsStore.getState();
    expect(next.selectedTerminalId).toBe(terminal.id);
    expect(next.customTerminalPaths[terminal.id]).toBe("/usr/local/bin/custom-terminal");
    expect(next.autoUpdateToLatest).toBe(true);
  });
});
