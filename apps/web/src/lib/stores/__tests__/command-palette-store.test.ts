import { act } from "@testing-library/react";

import { resetCommandPaletteStore, useCommandPaletteStore } from "../command-palette";

describe("command palette store", () => {
  beforeEach(() => {
    resetCommandPaletteStore();
  });

  it("opens, closes and toggles visibility", () => {
    expect(useCommandPaletteStore.getState().isOpen).toBe(false);

    act(() => {
      useCommandPaletteStore.getState().open();
    });
    expect(useCommandPaletteStore.getState().isOpen).toBe(true);
    expect(useCommandPaletteStore.getState().query).toBe("");

    act(() => {
      useCommandPaletteStore.getState().toggle();
    });
    expect(useCommandPaletteStore.getState().isOpen).toBe(false);

    act(() => {
      useCommandPaletteStore.getState().toggle();
    });
    expect(useCommandPaletteStore.getState().isOpen).toBe(true);

    act(() => {
      useCommandPaletteStore.getState().close();
    });
    expect(useCommandPaletteStore.getState().isOpen).toBe(false);
  });

  it("updates query and registers commands", () => {
    const originalCommands = useCommandPaletteStore.getState().commands;
    expect(originalCommands).not.toHaveLength(0);

    act(() => {
      useCommandPaletteStore.getState().setQuery("launchpad");
    });
    expect(useCommandPaletteStore.getState().query).toBe("launchpad");

    const nextCommands = originalCommands.slice(0, 1);
    act(() => {
      useCommandPaletteStore.getState().registerCommands(nextCommands);
    });
    expect(useCommandPaletteStore.getState().commands).toEqual(nextCommands);
  });
});
