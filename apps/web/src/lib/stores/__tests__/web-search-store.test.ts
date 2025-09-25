import { act } from "@testing-library/react";

import { useWebSearchStore, resetWebSearchStore } from "@/lib/stores/web-search";

describe("useWebSearchStore", () => {
  beforeEach(() => {
    resetWebSearchStore();
  });

  it("initializes with default provider definitions", () => {
    const state = useWebSearchStore.getState();
    expect(state.providers.length).toBeGreaterThan(0);
    expect(state.defaultProviderId).toBe("local-bing");
    expect(state.providerConfigs[state.defaultProviderId]?.url).toContain("bing.com");
  });

  it("updates provider configuration", () => {
    act(() => {
      useWebSearchStore.getState().updateProviderConfig("tavily", { apiKey: "test-key" });
    });

    expect(useWebSearchStore.getState().providerConfigs.tavily?.apiKey).toBe("test-key");
  });

  it("normalizes exclude domains from text", () => {
    act(() => {
      useWebSearchStore.getState().setExcludeDomainsFromText("example.com\nExample.com, news.site");
    });

    expect(useWebSearchStore.getState().excludeDomains).toEqual(["example.com", "news.site"]);
  });

  it("manages subscribe sources", () => {
    act(() => {
      useWebSearchStore.getState().addSubscribeSource({
        name: "Tech RSS",
        url: "https://example.com/feed.xml",
        blacklist: ["ads.example.com"],
      });
    });

    const [source] = useWebSearchStore.getState().subscribeSources;
    expect(source.name).toBe("Tech RSS");
    expect(source.blacklist).toEqual(["ads.example.com"]);

    act(() => {
      useWebSearchStore.getState().updateSubscribeSource(source.key, {
        name: "Tech Insider",
        blacklist: ["ads.example.com", "tracking.example.com"],
      });
    });

    expect(useWebSearchStore.getState().subscribeSources[0].name).toBe("Tech Insider");
    expect(useWebSearchStore.getState().subscribeSources[0].blacklist).toEqual([
      "ads.example.com",
      "tracking.example.com",
    ]);

    act(() => {
      useWebSearchStore.getState().removeSubscribeSource(source.key);
    });

    expect(useWebSearchStore.getState().subscribeSources).toHaveLength(0);
  });

  it("updates compression configuration", () => {
    act(() => {
      useWebSearchStore.getState().updateCompressionConfig({ method: "cutoff", cutoffLimit: 400 });
    });

    expect(useWebSearchStore.getState().compression.method).toBe("cutoff");
    expect(useWebSearchStore.getState().compression.cutoffLimit).toBe(400);
  });
});
