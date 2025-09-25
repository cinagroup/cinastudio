export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  topicId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  assistantId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assistant {
  id: string;
  name: string;
  description: string;
  avatar: string;
  color: string;
}

export interface AssistantRecord extends Assistant {
  topicIds: string[];
}

export interface ConversationSeedTopic extends Topic {
  messages: Message[];
}

export interface ConversationSeedEntry {
  assistant: Assistant;
  topics: ConversationSeedTopic[];
}

export interface NormalizedConversationState {
  assistants: AssistantRecord[];
  topics: Record<string, Topic>;
  messagesByTopic: Record<string, Message[]>;
}
