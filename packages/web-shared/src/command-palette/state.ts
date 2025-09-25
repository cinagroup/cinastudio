import { commandPaletteSeed } from "./seed";
import type { CommandPaletteCommand, CommandPaletteState } from "./types";

export function buildCommandPaletteState(
  commands: readonly CommandPaletteCommand[] = commandPaletteSeed,
): CommandPaletteState {
  return {
    commands: commands.map((command) => ({ ...command })),
  };
}
