import { conversationSeed } from "./seed";
import type {
  AssistantRecord,
  ConversationSeedEntry,
  Message,
  NormalizedConversationState,
  Topic,
} from "./types";

export function normalizeConversationSeed(
  seed: readonly ConversationSeedEntry[] = conversationSeed,
): NormalizedConversationState {
  const assistants: AssistantRecord[] = [];
  const topics: Record<string, Topic> = {};
  const messagesByTopic: Record<string, Message[]> = {};

  seed.forEach((entry) => {
    const topicIds: string[] = [];

    entry.topics.forEach((topic) => {
      topicIds.push(topic.id);
      topics[topic.id] = {
        id: topic.id,
        assistantId: entry.assistant.id,
        title: topic.title,
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
      };
      messagesByTopic[topic.id] = topic.messages.map((message) => ({ ...message }));
    });

    assistants.push({
      ...entry.assistant,
      topicIds,
    });
  });

  return {
    assistants,
    topics,
    messagesByTopic,
  };
}

export function getInitialContext(state: NormalizedConversationState) {
  const firstAssistant = state.assistants[0];
  const activeAssistantId = firstAssistant?.id ?? null;
  const activeTopicId = firstAssistant?.topicIds[0] ?? null;

  return { activeAssistantId, activeTopicId };
}

export const CONVERSATION_STORAGE_KEY = "cinaseek.conversation";
export const CONVERSATION_STORAGE_VERSION = 2;
