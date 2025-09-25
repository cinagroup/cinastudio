import { act } from "@testing-library/react";

import { filesSeed } from "@cinaseek/web-shared/files";

import { resetFilesStore, useFilesStore } from "../files";

describe("files store", () => {
  beforeEach(() => {
    resetFilesStore();
  });

  it("initializes with seeded files and categories", () => {
    const state = useFilesStore.getState();
    expect(state.files).toHaveLength(filesSeed.files.length);
    expect(state.categories).toHaveLength(filesSeed.categories.length);
    expect(state.filters.type).toBe("all");
  });

  it("updates filters for search and type", () => {
    act(() => {
      useFilesStore.getState().setSearch("迁移");
      useFilesStore.getState().setType("document");
    });

    const { filters } = useFilesStore.getState();
    expect(filters.search).toBe("迁移");
    expect(filters.type).toBe("document");
  });

  it("toggles pin status and records access", () => {
    const file = useFilesStore.getState().files[0];
    expect(file).toBeDefined();
    if (!file) return;

    act(() => {
      useFilesStore.getState().togglePin(file.id);
      useFilesStore.getState().recordAccess(file.id);
    });

    const updated = useFilesStore.getState().files.find((item) => item.id === file.id);
    expect(updated?.pinned).toBe(!file.pinned);
    expect(updated?.usageCount).toBe(file.usageCount + 1);
  });

  it("creates and removes files", () => {
    const initialLength = useFilesStore.getState().files.length;
    let createdId: string | null = null;

    act(() => {
      const created = useFilesStore.getState().addFile({
        title: "浏览器日志片段",
        type: "text",
        size: 1_024,
        source: "workspace",
        description: "调试扩展桥接时的请求示例",
        tags: ["调试"],
      });
      createdId = created.id;
    });

    const afterCreate = useFilesStore.getState();
    expect(afterCreate.files).toHaveLength(initialLength + 1);
    expect(createdId).not.toBeNull();

    if (createdId) {
      act(() => {
        useFilesStore.getState().removeFile(createdId!);
      });
      const afterRemove = useFilesStore.getState();
      expect(afterRemove.files.find((file) => file.id === createdId)).toBeUndefined();
    }
  });

  it("switches sort order when the same field is selected twice", () => {
    act(() => {
      useFilesStore.getState().setSort("size");
    });

    expect(useFilesStore.getState().filters.sortField).toBe("size");
    expect(useFilesStore.getState().filters.sortOrder).toBe("desc");

    act(() => {
      useFilesStore.getState().setSort("size");
    });

    expect(useFilesStore.getState().filters.sortOrder).toBe("asc");
  });
});
