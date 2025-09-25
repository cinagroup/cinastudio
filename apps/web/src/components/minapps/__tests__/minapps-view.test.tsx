import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { MinappsView } from "../minapps-view";
import { resetMinappsStore, useMinappsStore } from "@/lib/stores/minapps";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("MinappsView", () => {
  beforeEach(() => {
    resetMinappsStore();
  });

  it("renders seeded apps and updates search filter", () => {
    render(<MinappsView />);

    expect(screen.getByText("迷你应用中心")).toBeInTheDocument();
    expect(screen.getByText("会话工作区")).toBeInTheDocument();

    const search = screen.getByPlaceholderText("搜索迷你应用或网址");
    fireEvent.change(search, { target: { value: "扩展" } });

    expect(useMinappsStore.getState().filters.search).toBe("扩展");
  });

  it("creates custom mini apps via the form", async () => {
    render(<MinappsView />);

    fireEvent.change(screen.getByLabelText("名称"), {
      target: { value: "内部知识同步" },
    });
    fireEvent.change(screen.getByLabelText("链接"), {
      target: { value: "intranet.example.com" },
    });
    fireEvent.change(screen.getByLabelText("描述"), {
      target: { value: "同步内部知识库到 Web 客户端" },
    });
    fireEvent.change(screen.getByLabelText("标签（以逗号分隔）"), {
      target: { value: "internal, sync" },
    });

    fireEvent.submit(screen.getByTestId("miniapps-form"));

    await waitFor(() => expect(screen.getByText("内部知识同步")).toBeInTheDocument());
    const created = useMinappsStore.getState().apps.find((app) => app.name === "内部知识同步");
    expect(created?.custom).toBe(true);
    expect(created?.url).toBe("https://intranet.example.com");
  });

  it("toggles pinned filter and open strategy", () => {
    render(<MinappsView />);

    const pinnedCheckbox = screen.getByLabelText("仅显示置顶");
    fireEvent.click(pinnedCheckbox);

    expect(useMinappsStore.getState().filters.showPinned).toBe(true);
    expect(screen.getByText(/当前仅展示置顶应用/)).toBeInTheDocument();

    const toggle = screen.getByLabelText("在新标签页打开应用");
    fireEvent.click(toggle);

    expect(useMinappsStore.getState().settings.openInNewTab).toBe(false);
  });
});
