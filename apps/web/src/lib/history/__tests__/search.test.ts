import { conversationSeed, normalizeConversationSeed } from "@cinaseek/web-shared/conversation";

import { highlightTerms, searchMessages } from "../search";

describe("searchMessages", () => {
  const normalized = normalizeConversationSeed(conversationSeed);

  it("returns empty results for blank queries", () => {
    const result = searchMessages({
      query: "   ",
      assistants: normalized.assistants,
      topics: normalized.topics,
      messagesByTopic: normalized.messagesByTopic,
    });

    expect(result.results).toHaveLength(0);
    expect(result.terms).toHaveLength(0);
    expect(result.durationMs).toBe(0);
  });

  it("finds messages matching keywords", () => {
    const result = searchMessages({
      query: "站会", // matches topic-standup messages
      assistants: normalized.assistants,
      topics: normalized.topics,
      messagesByTopic: normalized.messagesByTopic,
    });

    expect(result.results.map((item) => item.message.id)).toContain("message-standup-1");
    expect(result.terms).toEqual(["站会"]);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("supports multi-term queries", () => {
    const result = searchMessages({
      query: "版本 说明",
      assistants: normalized.assistants,
      topics: normalized.topics,
      messagesByTopic: normalized.messagesByTopic,
    });

    expect(result.results.some((item) => item.topic.id === "topic-roadmap")).toBe(true);
    expect(result.terms).toEqual(["版本", "说明"]);
  });
});

describe("highlightTerms", () => {
  it("wraps matching terms with mark elements", () => {
    expect(highlightTerms("离线缓存测试", ["缓存"])).toBe("离线<mark>缓存</mark>测试");
  });

  it("is case insensitive while preserving original casing", () => {
    expect(highlightTerms("Service Worker", ["service"])).toBe("<mark>Service</mark> Worker");
  });

  it("returns original content when no terms provided", () => {
    expect(highlightTerms("PWA", [])).toBe("PWA");
  });
});
