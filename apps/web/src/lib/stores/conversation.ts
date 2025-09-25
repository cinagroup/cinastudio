import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  CONVERSATION_STORAGE_KEY,
  CONVERSATION_STORAGE_VERSION,
  conversationSeed,
  getInitialContext,
  normalizeConversationSeed,
  type AssistantRecord,
  type Message,
  type MessageRole,
  type Topic,
} from "@cinaseek/web-shared/conversation";
import type { BridgeSelectionPayload } from "@cinaseek/web-shared/messaging";
import { createId } from "@/utils/id";

interface ConversationDataState {
  assistants: AssistantRecord[];
  topics: Record<string, Topic>;
  messagesByTopic: Record<string, Message[]>;
  activeAssistantId: string | null;
  activeTopicId: string | null;
  composerDraft: string;
}

interface CreateTopicInput {
  assistantId: string;
  title?: string;
}

interface AppendMessageInput {
  topicId: string;
  role: MessageRole;
  content: string;
}

export type ConversationState = ConversationDataState & {
  setActiveAssistant: (assistantId: string) => void;
  setActiveTopic: (topicId: string) => void;
  createTopic: (input: CreateTopicInput) => string | undefined;
  appendMessage: (input: AppendMessageInput) => void;
  appendExternalContent: (content: string | BridgeSelectionPayload) => void;
  setComposerDraft: (value: string) => void;
  appendToComposer: (content: string, options?: { separator?: string; replace?: boolean }) => void;
  reset: () => void;
};

function buildInitialState(): ConversationDataState {
  const normalized = normalizeConversationSeed(conversationSeed);
  const context = getInitialContext(normalized);

  return {
    ...normalized,
    activeAssistantId: context.activeAssistantId,
    activeTopicId: context.activeTopicId,
    composerDraft: "",
  };
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),
      setActiveAssistant: (assistantId) => {
        const assistant = get().assistants.find((item) => item.id === assistantId);
        if (!assistant) {
          return;
        }

        set({
          activeAssistantId: assistantId,
          activeTopicId: assistant.topicIds[0] ?? null,
        });
      },
      setActiveTopic: (topicId) => {
        if (!get().topics[topicId]) {
          return;
        }
        set({ activeTopicId: topicId });
      },
      createTopic: ({ assistantId, title }) => {
        const assistants = get().assistants;
        const assistant = assistants.find((item) => item.id === assistantId);
        if (!assistant) {
          return undefined;
        }

        const topicId = createId("topic");
        const now = new Date().toISOString();
        const normalizedTitle = title?.trim() || "新的话题";

        set((state) => ({
          assistants: state.assistants.map((item) =>
            item.id === assistantId
              ? {
                  ...item,
                  topicIds: [topicId, ...item.topicIds],
                }
              : item,
          ),
          topics: {
            ...state.topics,
            [topicId]: {
              id: topicId,
              assistantId,
              title: normalizedTitle,
              createdAt: now,
              updatedAt: now,
            },
          },
          messagesByTopic: {
            ...state.messagesByTopic,
            [topicId]: [],
          },
          activeAssistantId: assistantId,
          activeTopicId: topicId,
        }));

        return topicId;
      },
      appendMessage: ({ topicId, role, content }) => {
        const trimmed = content.trim();
        if (!trimmed) {
          return;
        }

        const state = get();
        if (!state.topics[topicId]) {
          return;
        }

        const now = new Date().toISOString();
        const message: Message = {
          id: createId("message"),
          topicId,
          role,
          content: trimmed,
          createdAt: now,
        };

        set((current) => ({
          messagesByTopic: {
            ...current.messagesByTopic,
            [topicId]: [...(current.messagesByTopic[topicId] ?? []), message],
          },
          topics: {
            ...current.topics,
            [topicId]: {
              ...current.topics[topicId],
              updatedAt: now,
            },
          },
        }));
      },
      appendExternalContent: (payload) => {
        const value = typeof payload === "string" ? payload : payload?.text ?? "";
        const trimmed = value.trim();
        if (!trimmed) {
          return;
        }

        const state = get();
        const assistantId = state.activeAssistantId ?? state.assistants[0]?.id;
        if (!assistantId) {
          return;
        }

        let topicId = state.activeTopicId ?? undefined;
        if (!topicId) {
          topicId = get().createTopic({
            assistantId,
            title: trimmed.slice(0, 24) || "外部内容",
          });
        }

        const resolvedTopicId = topicId ?? get().activeTopicId;
        if (!resolvedTopicId) {
          return;
        }

        get().appendMessage({
          topicId: resolvedTopicId,
          role: "user",
          content: trimmed,
        });
      },
      setComposerDraft: (value) => {
        set({ composerDraft: value });
      },
      appendToComposer: (content, options) => {
        const { replace = false, separator } = options ?? {};
        set((state) => {
          if (replace || !state.composerDraft) {
            return { composerDraft: content };
          }

          const normalizedSeparator = separator ?? "\n";
          const nextValue = `${state.composerDraft}${normalizedSeparator}${content}`;
          return { composerDraft: nextValue };
        });
      },
      reset: () => {
        set(buildInitialState());
      },
    }),
    {
      name: CONVERSATION_STORAGE_KEY,
      version: CONVERSATION_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        assistants: state.assistants,
        topics: state.topics,
        messagesByTopic: state.messagesByTopic,
        activeAssistantId: state.activeAssistantId,
        activeTopicId: state.activeTopicId,
        composerDraft: state.composerDraft,
      }),
      migrate: (persisted, version) => {
        if (!persisted || version === CONVERSATION_STORAGE_VERSION) {
          return persisted as ConversationState;
        }
        return {
          ...buildInitialState(),
          ...persisted,
        } as ConversationState;
      },
    },
  ),
);

export function resetConversationStore() {
  useConversationStore.getState().reset();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear persisted conversation state", error);
    }
  }
}
