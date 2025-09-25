export type CodeToolId =
  | "qwen-code"
  | "claude-code"
  | "gemini-cli"
  | "iflow-cli"
  | "openai-codex";

export interface CodeToolModel {
  id: string;
  name: string;
  provider: string;
  notes?: string;
  docsUrl?: string;
}

export interface CodeToolGuideStep {
  id: string;
  title: string;
  description: string;
}

export interface CodeTool {
  id: CodeToolId;
  name: string;
  description: string;
  cliCommand: string;
  docsUrl?: string;
  recommendedModels: CodeToolModel[];
  prerequisites: string[];
  highlights: string[];
  guide: CodeToolGuideStep[];
}

export type TerminalPlatform = "mac" | "windows" | "linux" | "web";

export interface TerminalOption {
  id: string;
  name: string;
  platform: TerminalPlatform;
  description: string;
  homepage?: string;
}

export interface CodeToolsSeed {
  tools: CodeTool[];
  terminals: TerminalOption[];
  defaultEnvironments: Partial<Record<CodeToolId, string>>;
}
