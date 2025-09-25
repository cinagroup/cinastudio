import { fireEvent, render, screen } from "@testing-library/react";

import { FilesView } from "../files-view";
import { resetFilesStore, useFilesStore } from "@/lib/stores/files";

describe("FilesView", () => {
  beforeEach(() => {
    resetFilesStore();
  });

  it("renders seeded pinned files and allows search", () => {
    render(<FilesView />);

    expect(screen.getByText("文件工作台")).toBeInTheDocument();
    expect(screen.getByText("迁移执行手册")).toBeInTheDocument();

    const search = screen.getByPlaceholderText("搜索文件标题、标签或描述");
    fireEvent.change(search, { target: { value: "站会" } });

    expect(screen.getAllByText("迁移例会速记 2024-10-20").length).toBeGreaterThan(0);
    expect(useFilesStore.getState().filters.search).toBe("站会");
  });

  it("toggles pinned filter and creates sample file", () => {
    render(<FilesView />);

    const checkbox = screen.getByLabelText("仅查看置顶");
    fireEvent.click(checkbox);

    expect(screen.getByText(/当前仅展示置顶文件/)).toBeInTheDocument();

    const button = screen.getByText("新建示例文件");
    fireEvent.click(button);

    const state = useFilesStore.getState();
    expect(state.files.some((file) => file.title.includes("临时草稿"))).toBe(true);
  });
});
