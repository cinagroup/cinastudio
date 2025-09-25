import { render, screen } from "@testing-library/react";

import { PaintingsView } from "../paintings-view";

describe("PaintingsView", () => {
  it("highlights legacy providers and migration tasks", () => {
    render(<PaintingsView />);

    expect(screen.getByText("迁移 Cherry Studio 绘图工作台")).toBeInTheDocument();
    expect(screen.getByText("智谱 CogView")).toBeInTheDocument();
    expect(screen.getByText("AIHubMix")).toBeInTheDocument();
    expect(screen.getByText("画布与风格参数")).toBeInTheDocument();
  });
});
