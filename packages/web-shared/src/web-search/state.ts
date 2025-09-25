import { webSearchSeed } from "./seed";
import type {
  WebSearchProviderConfig,
  WebSearchProviderId,
  WebSearchSeed,
  WebSearchState,
  WebSearchSubscribeSource,
} from "./types";

export const WEB_SEARCH_STORAGE_KEY = "cinaseek.web-search";
export const WEB_SEARCH_STORAGE_VERSION = 1;

function buildProviderConfigs(seed: WebSearchSeed): Record<WebSearchProviderId, WebSearchProviderConfig> {
  return seed.providers.reduce<Record<WebSearchProviderId, WebSearchProviderConfig>>((acc, provider) => {
    acc[provider.id] = {
      ...provider.defaultConfig,
    };
    return acc;
  }, {} as Record<WebSearchProviderId, WebSearchProviderConfig>);
}

function normalizeSubscribeSources(seed: WebSearchSeed): WebSearchSubscribeSource[] {
  return seed.subscribeSources.map((source, index) => ({
    key: source.key ?? index,
    name: source.name,
    url: source.url,
    blacklist: source.blacklist ?? [],
  }));
}

export function buildWebSearchState(seed: WebSearchSeed = webSearchSeed): WebSearchState {
  return {
    providers: seed.providers,
    defaultProviderId: seed.defaultProviderId,
    searchWithTime: seed.searchWithTime,
    maxResults: seed.maxResults,
    excludeDomains: [...seed.excludeDomains],
    subscribeSources: normalizeSubscribeSources(seed),
    compression: seed.compression,
    providerConfigs: buildProviderConfigs(seed),
  };
}
