import { act } from "@testing-library/react";

import { resetNotesStore, useNotesStore } from "../notes";

describe("notes store", () => {
  beforeEach(() => {
    resetNotesStore();
  });

  it("exposes categories and tags", () => {
    const state = useNotesStore.getState();
    expect(state.categories.length).toBeGreaterThan(0);
    expect(state.tags.length).toBeGreaterThan(0);
  });

  it("creates a new note with generated id", () => {
    const initialLength = useNotesStore.getState().notes.length;

    let createdId: string | null = null;
    act(() => {
      const note = useNotesStore.getState().createNote({
        title: "测试笔记",
        content: "这是一条迁移记录",
        tags: ["migration"],
      });
      createdId = note.id;
    });

    const state = useNotesStore.getState();
    expect(state.notes).toHaveLength(initialLength + 1);
    expect(createdId).not.toBeNull();
    if (createdId) {
      expect(state.notes.some((note) => note.id === createdId)).toBe(true);
    }
  });

  it("updates an existing note", () => {
    const note = useNotesStore.getState().notes[0];
    expect(note).toBeDefined();
    if (!note) return;

    act(() => {
      useNotesStore.getState().updateNote(note.id, { title: "已更新标题" });
    });

    expect(useNotesStore.getState().notes[0]?.title).toBe("已更新标题");
  });

  it("filters notes by tag and category", () => {
    act(() => {
      useNotesStore.getState().setFilters({ tag: "migration", category: "product" });
    });

    const { filters } = useNotesStore.getState();
    expect(filters.tag).toBe("migration");
    expect(filters.category).toBe("product");
  });

  it("toggles pin status", () => {
    const target = useNotesStore.getState().notes[0];
    expect(target).toBeDefined();
    if (!target) return;

    act(() => {
      useNotesStore.getState().togglePin(target.id);
    });

    expect(useNotesStore.getState().notes[0]?.pinned).toBe(!target.pinned);
  });

  it("removes notes", () => {
    const { notes } = useNotesStore.getState();
    const target = notes[0];
    expect(target).toBeDefined();
    if (!target) return;

    act(() => {
      useNotesStore.getState().deleteNote(target.id);
    });

    expect(useNotesStore.getState().notes.find((note) => note.id === target.id)).toBeUndefined();
  });
});
