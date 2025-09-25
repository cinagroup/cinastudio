export type CommandPaletteCommandType = "navigation" | "prompt";

interface BaseCommandPaletteCommand {
  id: string;
  type: CommandPaletteCommandType;
  label: string;
  description?: string;
  keywords?: string[];
  icon?: string;
}

export interface NavigationCommandPaletteCommand extends BaseCommandPaletteCommand {
  type: "navigation";
  href: string;
}

export interface PromptCommandPaletteCommand extends BaseCommandPaletteCommand {
  type: "prompt";
  content: string;
}

export type CommandPaletteCommand =
  | NavigationCommandPaletteCommand
  | PromptCommandPaletteCommand;

export interface CommandPaletteState {
  commands: CommandPaletteCommand[];
}
