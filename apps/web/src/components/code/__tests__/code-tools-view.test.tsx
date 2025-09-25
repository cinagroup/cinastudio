import { fireEvent, render, screen } from "@testing-library/react";

import { CodeToolsView } from "../code-tools-view";
import { resetCodeToolsStore, useCodeToolsStore } from "@/lib/stores/code-tools";

describe("CodeToolsView", () => {
  beforeEach(() => {
    resetCodeToolsStore();
  });

  it("renders tool cards and switches active tool", () => {
    const { tools } = useCodeToolsStore.getState();
    render(<CodeToolsView />);

    expect(screen.getByText(tools[0].name)).toBeInTheDocument();

    const nextTool = tools[1];
    if (!nextTool) {
      return;
    }

    fireEvent.click(screen.getByText(nextTool.name));

    expect(useCodeToolsStore.getState().selectedToolId).toBe(nextTool.id);
  });

  it("adds directories through prompt fallback", () => {
    render(<CodeToolsView />);

    const promptSpy = jest.spyOn(window, "prompt").mockReturnValue("/tmp/example-project");

    fireEvent.click(screen.getByRole("button", { name: /添加目录/ }));

    expect(useCodeToolsStore.getState().directories).toContain("/tmp/example-project");

    promptSpy.mockRestore();
  });
});
