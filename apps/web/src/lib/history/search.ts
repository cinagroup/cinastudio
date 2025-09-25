import type { AssistantRecord, Message, Topic } from "@/types";

const ESCAPE_REGEX = /[.*+?^${}()|\[\]\\]/g;

export interface HistorySearchResult {
  message: Message;
  topic: Topic;
  assistant?: AssistantRecord;
}

interface SearchMessagesInput {
  query: string;
  assistants: AssistantRecord[];
  topics: Record<string, Topic>;
  messagesByTopic: Record<string, Message[]>;
}

interface SearchMessagesOutput {
  results: HistorySearchResult[];
  terms: string[];
  durationMs: number;
}

export function searchMessages({
  query,
  assistants,
  topics,
  messagesByTopic,
}: SearchMessagesInput): SearchMessagesOutput {
  const trimmed = query.trim();
  if (!trimmed) {
    return { results: [], terms: [], durationMs: 0 };
  }

  const start = typeof performance !== "undefined" ? performance.now() : Date.now();
  const terms = Array.from(
    new Set(
      trimmed
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    ),
  );

  if (terms.length === 0) {
    return { results: [], terms: [], durationMs: 0 };
  }

  const assistantMap = new Map(assistants.map((assistant) => [assistant.id, assistant]));
  const results: HistorySearchResult[] = [];

  Object.values(topics).forEach((topic) => {
    const messages = messagesByTopic[topic.id] ?? [];
    messages.forEach((message) => {
      const normalized = message.content.toLowerCase();
      if (terms.some((term) => normalized.includes(term))) {
        results.push({
          message,
          topic,
          assistant: assistantMap.get(topic.assistantId),
        });
      }
    });
  });

  results.sort(
    (a, b) => new Date(b.message.createdAt).getTime() - new Date(a.message.createdAt).getTime(),
  );

  const end = typeof performance !== "undefined" ? performance.now() : Date.now();

  return {
    results,
    terms,
    durationMs: Math.max(0, end - start),
  };
}

export function highlightTerms(content: string, terms: string[]) {
  if (!terms.length) {
    return content;
  }

  return terms.reduce((text, term) => {
    if (!term) {
      return text;
    }
    const escaped = term.replace(ESCAPE_REGEX, "\\$&");
    try {
      const regex = new RegExp(`(${escaped})`, "gi");
      return text.replace(regex, "<mark>$1</mark>");
    } catch (error) {
      return text;
    }
  }, content);
}
