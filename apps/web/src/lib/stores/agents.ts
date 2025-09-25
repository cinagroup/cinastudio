import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  AGENT_STORAGE_KEY,
  AGENT_STORAGE_VERSION,
  getInitialAgentContext,
  type AgentDefinition,
} from "@cinaseek/web-shared/agents";

import { createId } from "@/utils/id";

interface AgentsDataState {
  systemAgents: AgentDefinition[];
  customAgents: AgentDefinition[];
  pinnedAgentIds: string[];
}

export interface CreateAgentInput {
  name: string;
  description?: string;
  prompt?: string;
  avatar?: string;
  tags?: string[];
  capabilities?: string[];
  categories?: string[];
}

export type AgentsState = AgentsDataState & {
  addCustomAgent: (input: CreateAgentInput) => string | undefined;
  removeCustomAgent: (agentId: string) => void;
  togglePinned: (agentId: string) => void;
  reset: () => void;
};

function buildInitialState(): AgentsDataState {
  const context = getInitialAgentContext();
  return {
    systemAgents: context.agents,
    customAgents: [],
    pinnedAgentIds: [],
  };
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

function normalizeList(values: string[] | undefined): string[] {
  return Array.from(
    new Set(values?.map((value) => value.trim()).filter(Boolean) ?? []),
  );
}

export const useAgentsStore = create<AgentsState>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),
      addCustomAgent: ({ name, description, prompt, avatar, tags, capabilities, categories }) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
          return undefined;
        }

        const agentId = createId("agent");
        const normalizedAvatar = avatar?.trim() || "🧠";

        const normalizedTags = normalizeList(tags);
        const normalizedCapabilities = normalizeList(capabilities);
        const normalizedCategories = normalizeList(categories) as AgentDefinition["categories"];

        const agent: AgentDefinition = {
          id: agentId,
          name: trimmedName,
          description: description?.trim() || "自定义助手",
          prompt: prompt?.trim() || "",
          avatar: normalizedAvatar,
          tags: normalizedTags,
          capabilities: normalizedCapabilities,
          categories: normalizedCategories.length
            ? normalizedCategories
            : ["产品协作"],
          source: "custom",
        };

        set((state) => ({
          customAgents: [agent, ...state.customAgents],
        }));

        return agentId;
      },
      removeCustomAgent: (agentId) => {
        set((state) => ({
          customAgents: state.customAgents.filter((agent) => agent.id !== agentId),
          pinnedAgentIds: state.pinnedAgentIds.filter((id) => id !== agentId),
        }));
      },
      togglePinned: (agentId) => {
        set((state) => {
          const isPinned = state.pinnedAgentIds.includes(agentId);
          return {
            pinnedAgentIds: isPinned
              ? state.pinnedAgentIds.filter((id) => id !== agentId)
              : [agentId, ...state.pinnedAgentIds],
          };
        });
      },
      reset: () => {
        set(buildInitialState());
      },
    }),
    {
      name: AGENT_STORAGE_KEY,
      version: AGENT_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        customAgents: state.customAgents,
        pinnedAgentIds: state.pinnedAgentIds,
      }),
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== "object") {
          return buildInitialState() as AgentsState;
        }

        const data = persistedState as Partial<AgentsState>;
        return {
          ...buildInitialState(),
          customAgents: data.customAgents ?? [],
          pinnedAgentIds: data.pinnedAgentIds ?? [],
        } as AgentsState;
      },
    },
  ),
);

export function resetAgentsStore() {
  useAgentsStore.getState().reset();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(AGENT_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear persisted agent state", error);
    }
  }
}
