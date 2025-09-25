import { create } from "zustand";

import {
  buildCommandPaletteState,
  type CommandPaletteCommand,
} from "@cinaseek/web-shared/command-palette";

interface CommandPaletteStoreState {
  commands: CommandPaletteCommand[];
  isOpen: boolean;
  query: string;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (value: string) => void;
  registerCommands: (commands: CommandPaletteCommand[]) => void;
  reset: () => void;
}

function createInitialState(): Pick<
  CommandPaletteStoreState,
  "commands" | "isOpen" | "query"
> {
  const base = buildCommandPaletteState();
  return {
    commands: base.commands,
    isOpen: false,
    query: "",
  };
}

export const useCommandPaletteStore = create<CommandPaletteStoreState>((set, get) => ({
  ...createInitialState(),
  open: () => {
    if (!get().isOpen) {
      set({ isOpen: true, query: "" });
    }
  },
  close: () => {
    if (get().isOpen) {
      set({ isOpen: false, query: "" });
    }
  },
  toggle: () => {
    if (get().isOpen) {
      get().close();
    } else {
      get().open();
    }
  },
  setQuery: (value) => {
    set({ query: value });
  },
  registerCommands: (commands) => {
    set({ commands });
  },
  reset: () => {
    set(createInitialState());
  },
}));

export function resetCommandPaletteStore() {
  useCommandPaletteStore.getState().reset();
}
