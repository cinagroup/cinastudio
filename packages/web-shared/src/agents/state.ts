import { agentSeed } from "./seed";
import type { AgentDefinition, AgentSeedEntry } from "./types";

export interface AgentSeedContext {
  agents: AgentDefinition[];
  categories: string[];
}

export function normalizeAgentSeed(seed: AgentSeedEntry[]): AgentSeedContext {
  const agents: AgentDefinition[] = seed.map((entry) => ({
    ...entry,
    source: "system",
  }));

  const categorySet = new Set<string>();
  for (const agent of agents) {
    for (const category of agent.categories) {
      categorySet.add(category);
    }
  }

  return {
    agents,
    categories: Array.from(categorySet),
  };
}

export function getInitialAgentContext(): AgentSeedContext {
  return normalizeAgentSeed(agentSeed);
}
