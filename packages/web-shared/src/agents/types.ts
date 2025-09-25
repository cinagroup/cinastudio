export const AGENT_CATEGORY_PRESETS = [
  "产品协作",
  "工程研发",
  "知识管理",
  "自动化",
  "内容创作",
  "研究分析",
  "翻译本地化",
  "系统运营",
] as const;

export type AgentCategory = (typeof AGENT_CATEGORY_PRESETS)[number] | (string & {});

export type AgentSource = "system" | "custom";

export interface AgentDefinition {
  id: string;
  name: string;
  avatar: string;
  description: string;
  prompt: string;
  tags: string[];
  capabilities: string[];
  categories: AgentCategory[];
  source: AgentSource;
}

export interface AgentSeedEntry {
  id: string;
  name: string;
  avatar: string;
  description: string;
  prompt: string;
  tags: string[];
  capabilities: string[];
  categories: AgentCategory[];
}

export const AGENT_STORAGE_KEY = "cinaseek.web.agents";
export const AGENT_STORAGE_VERSION = 1;
